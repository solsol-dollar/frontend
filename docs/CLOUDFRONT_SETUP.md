# CloudFront + S3 배포 설정 가이드

Eclipse 프론트엔드 정적 파일을 S3에 호스팅하고 CloudFront로 CDN 배포하는 절차입니다.

---

## 1. S3 버킷 생성

1. AWS 콘솔 → S3 → **버킷 만들기**
2. 버킷 이름: `eclipse-frontend-prod` (임의로 지정)
3. 리전: `ap-northeast-2` (서울)
4. **퍼블릭 액세스 차단** → 모든 퍼블릭 액세스 차단 활성화 (기본값 유지)
5. **정적 웹사이트 호스팅** → 비활성화 (CloudFront OAC를 사용하므로 불필요)
6. 버킷 생성 완료

---

## 2. CloudFront OAC(Origin Access Control) 생성

OAC는 CloudFront가 S3에 직접 접근할 수 있도록 하는 인증 방식입니다. OAI(구 방식)보다 보안이 강화된 방식입니다.

1. AWS 콘솔 → CloudFront → **Origin access** → **Create control setting**
2. 설정:
   - Name: `eclipse-frontend-oac`
   - Origin type: **S3**
   - Signing behavior: **Sign requests (recommended)**
3. 생성 후 OAC ID를 메모해둡니다.

---

## 3. S3 버킷 정책 설정

CloudFront OAC에서만 S3에 접근할 수 있도록 버킷 정책을 설정합니다.

S3 버킷 → **권한** → **버킷 정책** → 아래 내용 입력:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::eclipse-frontend-prod/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

- `eclipse-frontend-prod` → 실제 버킷명으로 교체
- `YOUR_ACCOUNT_ID` → AWS 계정 ID (12자리)로 교체
- `YOUR_DISTRIBUTION_ID` → CloudFront 배포 ID로 교체 (배포 생성 후 입력)

---

## 4. CloudFront 배포 생성

1. AWS 콘솔 → CloudFront → **배포 생성**

### Origin 설정

| 항목 | 값 |
|------|-----|
| Origin domain | `eclipse-frontend-prod.s3.ap-northeast-2.amazonaws.com` (S3 버킷 선택) |
| Origin access | **Origin access control settings (recommended)** |
| Origin access control | 2단계에서 생성한 OAC 선택 |
| S3 버킷 정책 | 배포 생성 후 "Copy policy" 버튼으로 버킷 정책 자동 입력 가능 |

### Default Cache Behavior 설정

| 항목 | 값 |
|------|-----|
| Viewer protocol policy | **Redirect HTTP to HTTPS** |
| Cache policy | **CachingDisabled** (index.html 항상 최신 유지) |

### Cache Behavior 추가 (`/assets/*`)

정적 에셋(JS/CSS/이미지)은 Vite가 content hash로 파일명을 생성하므로 장기 캐시 적용:

1. **캐시 동작 추가** 클릭
2. 경로 패턴: `/assets/*`
3. Cache policy: **CachingOptimized** (Managed Policy, TTL 1년)

### Default Root Object

- Default root object: `index.html`

### SPA 처리 (중요)

React Router 사용 시 S3에 존재하지 않는 경로에 접근하면 403/404가 발생합니다. CloudFront 에러 페이지 설정으로 해결합니다:

배포 설정 → **오류 페이지** → **사용자 정의 오류 응답 생성**:

| HTTP 오류 코드 | 응답 페이지 경로 | HTTP 응답 코드 |
|---------------|-----------------|---------------|
| 403 | `/index.html` | **200** |
| 404 | `/index.html` | **200** |

---

## 5. ACM 인증서 발급

CloudFront는 **us-east-1(버지니아 북부)** 리전의 ACM 인증서만 사용 가능합니다.

1. AWS 콘솔 리전을 **us-east-1**으로 전환
2. ACM → **인증서 요청** → 퍼블릭 인증서
3. 도메인 이름: `eclipse.yourdomain.com` (실제 도메인 입력)
   - 루트 도메인과 서브도메인 모두 필요하면 `*.yourdomain.com`으로 와일드카드 발급 가능
4. 검증 방법: **DNS 검증** (권장)
5. CNAME 레코드를 도메인 DNS에 추가 → 검증 완료 대기 (수 분 ~ 수십 분 소요)

---

## 6. 커스텀 도메인 연결

1. CloudFront 배포 → **편집**
2. **Alternate domain name(CNAME)**: `eclipse.yourdomain.com` 입력
3. **Custom SSL certificate**: 5단계에서 발급한 ACM 인증서 선택
4. 저장

도메인 DNS 설정:

| 타입 | 이름 | 값 |
|------|------|-----|
| CNAME | `eclipse` | `xxxxxxxxxxxxx.cloudfront.net` (CloudFront 도메인) |

또는 Route 53 사용 시 A 레코드 → Alias → CloudFront 배포 선택

---

## 확인

배포 완료 후 다음을 확인합니다:

- `https://eclipse.yourdomain.com` → 앱 정상 로딩
- `https://eclipse.yourdomain.com/ipo` 등 하위 경로 새로고침 → 앱 정상 로딩 (SPA 설정 확인)
- 브라우저 개발자도구 → Network → `index.html` 응답 헤더: `no-store` 포함 여부
- `/assets/*.js` 응답 헤더: `max-age=31536000, immutable` 포함 여부
