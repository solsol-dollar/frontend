# Eclipse Frontend

신한 그룹 연계 해외 공모주(IPO) 청약 자동화 앱 **SOL SOL 달러**의 프론트엔드입니다.
PWA(Progressive Web App) 기반 모바일 중심 설계로 구현됩니다.

## 문서

| 문서 | 설명 |
|------|------|
| [README](./README.md) | 프로젝트 개요, 로컬 셋업, 개발 규칙 |
| [docs/PAGES.md](./docs/PAGES.md) | 전체 페이지 구조, 라우팅, API 연동 |
| [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | 컬러 팔레트, 타이포그래피, 레이아웃 규칙 |
| [docs/SHADCN.md](./docs/SHADCN.md) | shadcn/ui 컴포넌트 추가 방법 및 사용 예시 |

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 언어 | TypeScript | 5.5 |
| 프레임워크 | React | 18.3 |
| 빌드 | Vite | 5.4 |
| 패키지 매니저 | pnpm | - |
| 스타일 | Tailwind CSS | 3.4 |
| UI 컴포넌트 | shadcn/ui | - |
| 라우팅 | React Router | v6 |
| 서버 상태 | TanStack Query | v5 |
| 클라이언트 상태 | Zustand | v5 |
| HTTP 클라이언트 | Axios | 1.7 |
| 폼 관리 | React Hook Form + zod | - |
| 차트 | Recharts | 2.12 |
| 날짜 | dayjs | 1.11 |
| PWA | vite-plugin-pwa | 0.20 |
| 푸시 알림 | Firebase FCM | 10.14 |
| 폰트 | Pretendard | - |

---

## 아키텍처

### 배포 구조

```
[PWA (모바일 브라우저 / 홈 화면 설치)]
         |
         +---> ledger-app  :8080  (청약, 리턴플랜, 계좌, 증권주문)
         |
         +---> service-app :8081  (IPO 탐색, 증권조회, AI 분석, 홈 대시보드)
```

### Axios 인스턴스 분리

```
src/lib/axios.ts
  ledgerApi  → VITE_LEDGER_URL  (자금/원장 트랜잭션)
  serviceApi → VITE_SERVICE_URL (조회/탐색/AI)
```

두 인스턴스 모두 `X-User-Id` 헤더를 자동으로 주입합니다 (내부 평가용 더미 인증).

### PWA 캐싱 전략

| URL 패턴 | 전략 | 이유 |
|----------|------|------|
| `/api/ipos` | Stale While Revalidate | IPO 목록은 자주 안 바뀜, 빠른 응답 우선 |
| `/api/subscriptions`, `/api/accounts` | Network First | 자금 관련은 항상 최신 데이터 필요 |
| 정적 자산 (JS/CSS/이미지) | Cache First | 빌드 해시로 캐시 무효화 |

---

## 프로젝트 구조

```
eclipse-frontend/
├── public/
│   ├── icons/                    # PWA 아이콘 (192px, 512px 필요)
│   └── firebase-messaging-sw.js  # FCM 백그라운드 메시지 핸들러
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 컴포넌트 (자동 생성)
│   │   └── common/               # 전체 공유 레이아웃 컴포넌트
│   │       ├── Layout.tsx        # 페이지 래퍼 (Header + BottomNav)
│   │       ├── Header.tsx        # 헤더 (로고형 / 타이틀형 / 뒤로가기+중앙타이틀형)
│   │       └── BottomNav.tsx     # 하단 탭 네비게이션 (홈/IPO/리턴플랜/증권)
│   ├── features/                 # 도메인별 기능 모듈
│   │   ├── onboarding/           # 신한 인증 3단계 (splash → PIN → 계좌선택)
│   │   ├── home/                 # 홈 대시보드, 송금 플로우
│   │   ├── ipo/                  # IPO 캘린더, 상세, 청약, 가이드, 투자성향
│   │   ├── return-plan/          # 리턴플랜, 수령 계좌 배분 설정
│   │   ├── securities/           # 증권 (MY홈/해외주식/ETF 탭, 종목 상세)
│   │   └── mypage/               # 마이페이지, 알림센터, 알림설정
│   ├── lib/
│   │   ├── axios.ts              # Axios 인스턴스 (ledgerApi, serviceApi)
│   │   ├── queryClient.ts        # React Query 기본 설정
│   │   ├── firebase.ts           # FCM 초기화 및 토큰 요청
│   │   └── utils.ts              # cn() 유틸 (clsx + tailwind-merge)
│   ├── store/
│   │   └── userStore.ts          # Zustand 전역 상태 (persist)
│   ├── hooks/
│   │   └── usePushNotification.ts # FCM 토큰 등록 + 포그라운드 메시지 수신
│   ├── router/
│   │   └── index.tsx             # 전체 라우팅 정의
│   ├── styles/
│   │   └── globals.css           # Tailwind + 디자인 토큰 CSS 변수
│   └── main.tsx                  # 앱 진입점
├── .env.example                  # 환경변수 가이드
├── tailwind.config.ts            # 디자인 시스템 (컬러 팔레트)
└── vite.config.ts                # Vite + PWA 설정
```

### features/ 모듈 구조 규칙

각 도메인 모듈은 동일한 구조를 따릅니다.

```
features/{domain}/
├── components/   # 이 도메인에서만 쓰는 컴포넌트
├── hooks/        # 이 도메인의 React Query hooks (useIpoList 등)
└── pages/        # 라우터에서 직접 렌더링하는 페이지 컴포넌트
```

`components/ui/`에는 절대 비즈니스 로직을 넣지 않습니다. 도메인 로직은 반드시 `features/` 안에 위치합니다.

---

## 로컬 개발 환경 셋업

### 사전 요구사항

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- 백엔드 서버 실행 중 (ledger-app :8080, service-app :8081)

### 1단계: 저장소 클론

```bash
git clone https://github.com/solsol-dollar/frontend.git
cd frontend
```

### 2단계: 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 값을 채웁니다.

```env
VITE_LEDGER_URL=http://localhost:8080
VITE_SERVICE_URL=http://localhost:8081

# Firebase는 FCM 연동 전까지 비워도 됩니다
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_PROJECT_ID=
...
```

### 3단계: 의존성 설치 및 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:5173` 접속 후 **개발자 도구 → 모바일 뷰(iPhone 14 Pro 권장)**로 확인합니다.

---

## 네비게이션 구조

### 하단 탭 (BottomNav)

| 탭 | 경로 | 설명 |
|----|------|------|
| 홈 | `/home` | 총 달러 잔액, 계좌, 쉬는 달러 위젯, 관심 IPO |
| IPO | `/ipo` | IPO 캘린더(리스트/그리드), 청약, 가이드 |
| 리턴플랜 | `/return-plan` | 리턴금 내역, 수령 계좌 배분 설정 |
| 증권 | `/securities` | MY홈 / 해외주식 / ETF 탭, 종목 상세, 구매 |

### 상단 헤더

헤더는 3가지 패턴으로 사용합니다.

| 패턴 | 좌측 | 중앙 | 우측 | 사용 페이지 |
|------|------|------|------|------------|
| 로고형 | SOL SOL 달러 로고 | — | 알림벨 + MY 아바타 | 홈 |
| 타이틀형 | 페이지 타이틀 | — | 알림벨 + 검색 | 마이페이지, 리턴플랜 |
| 뒤로가기형 | `<` 버튼 | **페이지 타이틀 (중앙)** | 페이지별 액션 | 상세, 설정, 알림센터 |

```tsx
// 로고형
<Header showNotification showMypage />

// 타이틀형
<Header title="마이페이지" showNotification showSearch showMypage={false} />

// 뒤로가기형 (타이틀 절대 중앙 정렬)
<Header showBack title="알림센터" showSettings />
```

- **알림벨** → `/notifications` 이동
- **MY 아바타** → `/mypage` 이동

---

## 상태 관리 구조

### 서버 상태 — React Query

API 응답 데이터는 모두 React Query로 관리합니다. 각 도메인의 `hooks/` 디렉토리에 정의합니다.

```ts
// 예시: features/ipo/hooks/useIpoList.ts
export function useIpoList() {
  return useQuery({
    queryKey: ['ipos'],
    queryFn: () => serviceApi.get('/api/ipos'),
  })
}
```

### 클라이언트 상태 — Zustand

UI 상태, 인증 정보, FCM 토큰은 Zustand로 관리합니다. `localStorage`에 자동 영속화됩니다.

```ts
// store/userStore.ts
const { isOnboarded, setOnboarded } = useUserStore()
```

---

## API 호출 규칙

### 어떤 인스턴스를 쓸까?

| 도메인 | 인스턴스 | 포트 |
|--------|----------|------|
| 청약, 리턴플랜, 계좌, 증권주문 | `ledgerApi` | 8080 |
| IPO 탐색, 증권 조회, AI 분석, 홈 | `serviceApi` | 8081 |

```ts
import { ledgerApi, serviceApi } from '@/lib/axios'

// 청약 신청 (자금 이동 → ledger)
await ledgerApi.post('/api/subscriptions', payload)

// IPO 목록 조회 (탐색 → service)
await serviceApi.get('/api/ipos')
```

### X-User-Id 헤더

두 인스턴스 모두 요청 인터셉터에서 `X-User-Id: 1`을 자동 주입합니다. 별도 설정 불필요합니다.

---

## PWA 아이콘 추가

`public/icons/` 에 아래 두 파일이 반드시 있어야 합니다.

```
public/icons/icon-192.png   # 192×192 px
public/icons/icon-512.png   # 512×512 px
```

아직 디자인이 없다면 임시 이미지를 넣어도 앱 구동에 문제없습니다.

---

## FCM 푸시 알림 연동

Firebase 프로젝트 생성 후 `.env`에 키를 채우면 됩니다.

```
1. console.firebase.google.com → 프로젝트 생성
2. 앱 추가 (웹) → SDK 설정 값 복사 → .env에 입력
3. Cloud Messaging → VAPID 키 생성 → VITE_FIREBASE_VAPID_KEY에 입력
```

알림 수신 로직은 이미 `src/hooks/usePushNotification.ts`에 구현되어 있습니다. FCM 토큰 서버 등록 API만 추가하면 됩니다.

---

## shadcn/ui 컴포넌트 추가

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add sheet   # 바텀시트
pnpm dlx shadcn@latest add dialog
```

추가된 컴포넌트는 `src/components/ui/`에 생성됩니다.

---

## 빌드 및 배포

```bash
pnpm build        # dist/ 생성
pnpm preview      # 빌드 결과 로컬 확인
```

PWA 설치 테스트는 `pnpm preview` 후 Chrome에서 확인합니다 (`pnpm dev`는 Service Worker 비활성화).
