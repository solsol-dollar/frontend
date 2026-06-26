#!/bin/bash
set -e

# Required GitHub Secrets (set in repository settings):
#   S3_BUCKET             — S3 버킷명
#   CF_DISTRIBUTION_ID    — CloudFront 배포 ID
#   VITE_LEDGER_URL       — ledger-app API URL (e.g. https://api.yourdomain.com/api/ledger)
#   VITE_SERVICE_URL      — service-app API URL (e.g. https://api.yourdomain.com/api/service)
#
# 수동 실행 예시:
#   S3_BUCKET=my-bucket \
#   CF_DISTRIBUTION_ID=EXXXXXXXXXX \
#   VITE_LEDGER_URL=https://api.yourdomain.com/api/ledger \
#   VITE_SERVICE_URL=https://api.yourdomain.com/api/service \
#   bash scripts/deploy.sh

# 필수 환경변수 확인
: "${S3_BUCKET:?S3_BUCKET is required}"
: "${CF_DISTRIBUTION_ID:?CF_DISTRIBUTION_ID is required}"
: "${VITE_LEDGER_URL:?VITE_LEDGER_URL is required}"
: "${VITE_SERVICE_URL:?VITE_SERVICE_URL is required}"

echo "Building..."
pnpm build

echo "Syncing to S3..."

# assets (JS/CSS/이미지 — content-hash 파일명) — 장기 캐시 (1년, immutable)
aws s3 sync dist/ s3://${S3_BUCKET}/ \
  --delete \
  --exclude "index.html" \
  --exclude "sw.js" \
  --exclude "manifest.webmanifest" \
  --cache-control "public, max-age=31536000, immutable"

# Service Worker + Manifest — 캐시 없음 (브라우저가 항상 최신 버전 확인)
aws s3 cp dist/sw.js s3://${S3_BUCKET}/sw.js \
  --cache-control "no-store"
aws s3 cp dist/manifest.webmanifest s3://${S3_BUCKET}/manifest.webmanifest \
  --cache-control "no-store"

# index.html — 캐시 없음 (항상 최신)
aws s3 cp dist/index.html s3://${S3_BUCKET}/index.html \
  --cache-control "no-store"

echo "Invalidating CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id ${CF_DISTRIBUTION_ID} \
  --paths "/*"

echo "Deploy complete!"
