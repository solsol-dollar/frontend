# 페이지 구조

SOL SOL 달러 앱의 전체 페이지 목록, 라우팅, 역할, API 연동 정의입니다.

---

## 온보딩

### `/onboarding` — OnboardingPage

**역할**: 앱 진입 최초 인증 (3단계 단일 컴포넌트)

| 단계 | UI | 설명 |
|------|----|------|
| splash | "신한통합인증 시작하기" CTA | 앱 로고 + 브랜드 소개 |
| pin | 신한인증서 PIN 입력 | 6자리 PIN, 파란 키패드, 자동로그인 체크 |
| accounts | 연동 계좌 선택 | 진행바 (2/4), 계좌 목록, 청약신청 버튼 |

**API**: `POST /api/auth/verify`, `GET /api/accounts`

---

## 홈

### `/home` — HomePage

**역할**: 총 달러 잔액, 보유 계좌, 쉬는 달러 위젯, 관심 IPO

**Header**: 로고 좌측 / 알림벨 + MY아바타 우측

**섹션**:
1. 총 달러 잔액 (`$18,330.50`)
2. 계좌별 잔액 리스트 (CMA, Value-up, 체인지업)
3. 송금 CTA 버튼 → `/home/transfer`
4. 쉬는 달러 위젯 (유휴 달러 감지 → IPO 유도)
5. 관심 IPO 카드 목록

**API**: `GET /api/accounts/summary`, `GET /api/ipos/favorites`

---

### `/home/transfer` — TransferPage

**역할**: 계좌 선택 → 금액 입력 (파란 키패드)

**단계**:
1. 출금 계좌 선택 (라디오 리스트)
2. 금액 입력 (파란 Primary 숫자 키패드)

**API**: `GET /api/accounts`

---

### `/home/transfer/confirm` — TransferConfirmPage

**역할**: 송금 내용 확인 (CMA 계좌로 $300 이동 확인)

**API**: `POST /api/transfers`

---

### `/home/transfer/complete` — TransferCompletePage

**역할**: 송금 완료 (SOL 로고 + 완료 메시지)

---

### `/home/transfer/history` — TransferHistoryPage

**역할**: 송금 내역 (전체/입금/출금 필터 칩)

**API**: `GET /api/transfers?userId={id}`

---

## IPO

### `/ipo` — IpoCalendarPage

**역할**: IPO 캘린더 (청약일정 탭 + 청약내역/취소 탭)

**Header**: 알림벨 / 검색 / "IPO란?" 버튼 (→ `/ipo/guide`)

**탭 1 — 청약 일정**:
- 필터 칩: 전체 / 청약가능 / 청약예정
- 뷰 토글: 리스트(날짜 그룹) / 캘린더 그리드
- 캘린더 범례: 🔴 청약시작/마감 (#FF4B8B), 🟢 상장일 (#00C0A0)

**탭 2 — 청약내역/취소**: 청약 내역 인라인 표시

**API**: `GET /api/ipos`, `GET /api/subscriptions`

---

### `/ipo/guide` — IpoGuidePage

**역할**: IPO 청약 방법 가이드

**섹션**:
- 4단계 흐름도 (신한인증 → 계좌연동 → IPO 청약 → 배정확인)
- 단계별 상세 설명 (Step 1~4)
- SOL SOL달러 vs 타사 MTS 비교표
- FAQ 목록

---

### `/ipo/history` — SubscriptionHistoryPage

**역할**: 청약 내역 목록 + 취소 bottom sheet

**Badge 상태**: 배정 대기 / 배정 완료 / 환불 완료

**API**: `GET /api/subscriptions?userId={id}`, `DELETE /api/subscriptions/{id}`

---

### `/ipo/profile` — InvestmentProfilePage

**역할**: 투자성향 진단

---

### `/ipo/:id` — IpoDetailPage

**역할**: IPO 종목 상세

**섹션**:
1. 종목 헤더 (컬러 아바타, 이름, D-day 뱃지, 찜 아이콘)
2. 타임라인 마일스톤 4단계 (청약시작 → 청약마감 → 청약대금납부 → 상장/환불예정일)
3. 청약가능금액 + 트렌드 배너 ("이 종목 지금 트렌드예요 ↑")
4. SOL SOL달러 vs 타사 비교표
5. 청약신청금액 표시
6. News Score (0~100 진행바)
7. 관련 뉴스 목록
8. "청약하기" CTA → `/ipo/:id/subscribe`

**API**: `GET /api/ipos/{id}`, `GET /api/ipos/{id}/news-score`

---

### `/ipo/:id/subscribe` — SubscribePage

**역할**: 청약 금액 입력 (USD ↔ KRW 환율 표시 + 숫자 키패드)

**API**: `GET /api/exchange-rate`

---

### `/ipo/:id/subscribe/exchange` — SubscribeExchangePage

**역할**: 청약 최종 확인 (타임라인, 예상 리턴금액, 총 청약금액)

**API**: `POST /api/subscriptions`

---

## 리턴플랜

### `/return-plan` — ReturnPlanPage

**역할**: 리턴플랜 메인 (진행 중 IPO 요약 + 월별 내역)

**Header**: "리턴 플랜" 타이틀 / 검색 아이콘

**섹션**:
1. 현재 IPO 리턴플랜 요약 (총 리턴금, 배정금, 이자)
2. 리턴 플랜 설정 버튼 → `/return-plan/allocation`
3. 월 네비게이션 (← 5월 / 6월 →)
4. 날짜별 리턴 내역 목록

**API**: `GET /api/return-plans?userId={id}`, `GET /api/return-plans/history`

---

### `/return-plan/allocation` — ReturnPlanSettingsPage

**역할**: 리턴금 수령 계좌 배분 설정

**섹션**:
- 현재 IPO 예상 리턴금액 + D-day
- 도넛 차트 (총 리턴금 시각화)
- 계좌별 배분 슬라이더 (CMA / Value-up / 체인지업)
- 수정 완료 버튼

**API**: `PUT /api/return-plans/settings`

---

## 증권

### `/securities` — SecuritiesPage

**탭**: MY홈 | 해외주식 | ETF

**탭 MY홈**:
- 총 자산 ($2,084,455), 주식 평가금 / 외화예수금
- 보유 종목 리스트 (아이콘, 이름, 수량, 현재가, 등락)

**탭 해외주식**:
- 실시간 라인 차트 (Recharts)
- 종목 순위 리스트 (가격 + 등락률)

**탭 ETF**: 해외주식과 동일한 구조

**API**: `GET /api/portfolio`, `GET /api/securities/stocks`, `GET /api/securities/etf`

---

### `/securities/stocks/:ticker` — StockDetailPage

**역할**: 종목 상세 (가격, 차트, 호가, 구매)

**섹션**:
1. 종목 헤더 (현재가 + 등락, 찜 아이콘)
2. 기간 선택 (1일/1주/1달/3달/1년)
3. Recharts 라인 차트
4. 호가 목록 (5 호가)
5. 판매하기 / 구매하기 버튼
6. 구매 bottom sheet:
   - 수량 입력 (- / 숫자 / +)
   - 주문 요약 (계좌, 보유 달러, 구매 주 수, 총 대금)
   - 구매하기 버튼

**API**: `GET /api/securities/stocks/{ticker}`, `GET /api/securities/stocks/{ticker}/chart`, `POST /api/securities/orders`

---

## 마이페이지

### `/mypage` — MyPage

**역할**: 연동 계좌 관리, 상품 추천, 설정 진입

**Header**: "마이페이지" 좌측 타이틀 / 알림벨 + 검색 우측

**섹션**:
1. 연동 계좌 목록 (체크 / 추가 버튼)
2. 내 계좌·카드 보기 및 추가 연동 링크
3. 신한 상품 추천 배너 (Value-up 예금 등)
4. 설정 메뉴 (알림 설정 → `/notifications/settings`)

**API**: `GET /api/accounts`, `GET /api/mypage/products`

---

## 알림

### `/notifications` — NotificationsPage

**역할**: 알림 센터 (날짜별 알림 목록)

**Header**: 뒤로가기 / "알림센터" 중앙 / 설정(⚙) 아이콘

**알림 타입**:

| 타입 | 아이콘 | 내용 |
|------|--------|------|
| 배정 완료 | 🎉 | "[종목명] 배정 완료 / 리턴플랜으로 $X 분배 완료" |
| 환불금 입금 | 💰 | "미배정 환불금 $X 입금 / 리턴 플랜 설정 CTA" |
| 쉬는 달러 | 😴 | "달러가 30일 이상 유휴 → IPO 참여 유도" |

**미읽음**: 좌측 Primary 컬러 보더 라인

**API**: `GET /api/notifications?userId={id}`, `PATCH /api/notifications/read-all`

---

### `/notifications/settings` — NotificationSettingsPage

**역할**: 알림 유형별 on/off 토글

**토글 항목** (전체 알림 허용 → 나머지 일괄 제어):
- 전체 알림 허용
- 배정 결과 알림 (상장일 당일)
- 환불금 입금 알림 (미배정 환불 시)
- 쉬는 달러 감지 (30일 이상 유휴)

**API**: `GET /api/notifications/settings`, `PUT /api/notifications/settings`

---

## 공통 컴포넌트 → 라우팅 매핑

| 컴포넌트 위치 | 이동 경로 |
|---------------|----------|
| Header 알림벨 | `/notifications` |
| Header MY 아바타 | `/mypage` |
| BottomNav 홈 | `/home` |
| BottomNav IPO | `/ipo` |
| BottomNav 리턴플랜 | `/return-plan` |
| BottomNav 증권 | `/securities` |
| 알림센터 설정 아이콘 | `/notifications/settings` |
| 마이페이지 알림설정 행 | `/notifications/settings` |
| IPO 캘린더 "IPO란?" | `/ipo/guide` |
| 리턴플랜 "설정" 버튼 | `/return-plan/allocation` |
