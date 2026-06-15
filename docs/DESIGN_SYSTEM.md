# 디자인 시스템

SOL SOL 달러 앱의 디자인 토큰, 컬러 팔레트, 타이포그래피, 공통 컴포넌트 사용 규칙을 정리합니다.
UI 이미지(`referance/ui/`)에서 추출한 컬러를 기반으로 구성되었습니다.

---

## 컬러 팔레트

### Primary

| 이름 | 값 | 사용처 |
|------|----|--------|
| `primary` | `#1C1FE8` | CTA 버튼, 브랜드 강조, 바텀시트 헤더 |
| `primary-light` | `#4A90FF` | 링크, 보조 강조, 활성 상태 |

```tsx
// 사용 예시
<button className="bg-primary text-white">청약신청</button>
<span className="text-primary-light">전체보기 &gt;</span>
```

### 포인트 컬러

| 이름 | 값 | 사용처 |
|------|----|--------|
| `orange` | `#FF6830` | IPO 아바타 배경, 포인트 강조 |
| `sky-blue` | `#29A9F5` | 증권 종목 배지, 보조 아이콘 |
| `pink` | `#FF4B8B` | IPO 캘린더 청약시작/마감 표시 |
| `teal` | `#00C0A0` | IPO 캘린더 상장(예정)일 표시 |

### 수익률 컬러

금융 앱 관례에 따라 **상승은 빨강, 하락은 파랑**을 사용합니다.

| 이름 | 값 | 사용처 |
|------|----|--------|
| `up` | `#E53935` | 상승 수익률, 양수 변동 |
| `down` | `#1565C0` | 하락 수익률, 음수 변동 |

```tsx
// 유틸리티 클래스 사용
<span className="amount-positive">+1,518.90</span>
<span className="amount-negative">-500.77</span>
```

### 배경 / 서피스

| 이름 | 값 | 사용처 |
|------|----|--------|
| `white` | `#FFFFFF` | 기본 배경 |
| `surface` | `#F5F6F8` | 카드 배경, 입력 필드 배경 |
| `border` | `#EEEEEE` | 구분선, 테두리 |

### 텍스트

| 이름 | 값 | 사용처 |
|------|----|--------|
| `text-primary` | `#111111` | 본문, 제목 |
| `text-secondary` | `#666666` | 보조 설명, 레이블 |
| `text-tertiary` | `#999999` | 비활성 상태, 힌트 |

---

## CSS 변수

모든 컬러는 `globals.css`에 CSS 변수로도 정의되어 있습니다. JS에서 접근이 필요한 경우 (차트 색상 등) 사용합니다.

```css
var(--color-primary)
var(--color-up)
var(--color-down)
var(--color-surface)
var(--color-text-primary)
/* ... */
```

```ts
// Recharts 등 CSS 변수를 직접 쓸 수 없는 라이브러리에서
const CHART_COLOR_UP = '#E53935'
const CHART_COLOR_DOWN = '#1565C0'
```

---

## 타이포그래피

**폰트: Pretendard** (CDN 로드, `index.html`)

```css
font-family: 'Pretendard', system-ui, sans-serif;
```

### 텍스트 스케일 (Tailwind)

| 클래스 | 크기 | 사용처 |
|--------|------|--------|
| `text-2xl font-bold` | 24px Bold | 총자산 금액 |
| `text-xl font-bold` | 20px Bold | 페이지 제목, 섹션 헤더 |
| `text-lg font-semibold` | 18px SemiBold | 앱 로고, 카드 제목 |
| `text-base font-medium` | 16px Medium | 버튼 텍스트, 주요 정보 |
| `text-sm` | 14px Regular | 본문, 설명 |
| `text-xs` | 12px Regular | 바텀 탭 레이블, 부가 정보 |

---

## 레이아웃

### 모바일 컨테이너

모든 페이지는 `max-width: 430px`로 제한하여 모바일 앱처럼 표시합니다.

```tsx
// globals.css에 정의된 유틸리티
<div className="mobile-container">
  {/* 최대 너비 430px, 중앙 정렬 */}
</div>
```

### 페이지 기본 구조

```tsx
export function SomePage() {
  return (
    <div className="page-content px-4">
      {/* pb-20: 바텀 탭 높이만큼 하단 패딩 자동 적용 */}
    </div>
  )
}
```

### 간격 규칙 (Tailwind spacing)

| 용도 | 클래스 | 값 |
|------|--------|-----|
| 페이지 좌우 패딩 | `px-4` | 16px |
| 섹션 간격 | `mt-6` | 24px |
| 카드 내부 패딩 | `p-4` | 16px |
| 아이템 간격 | `gap-3` | 12px |
| 아이콘-텍스트 간격 | `gap-2` | 8px |

---

## 공통 컴포넌트

### Header

```tsx
import { Header } from '@/components/common/Header'

// 기본 (로고 + 알림 + 마이페이지)
<Header />

// 뒤로가기 버튼 포함
<Header showBack title="IPO 종목 상세" />

// 알림/마이페이지 없는 단순 헤더
<Header showNotification={false} showMypage={false} />
```

### BottomNav

`Layout.tsx`에 포함되어 있습니다. 별도로 사용하지 않습니다.
라우터에서 `Layout`을 부모로 설정하면 자동으로 표시됩니다.

### Layout

```tsx
// router/index.tsx에서 이미 설정되어 있음
{
  element: <Layout />,
  children: [
    { path: '/home', element: <HomePage /> },
    // ...
  ],
}
```

---

## shadcn/ui 컴포넌트

shadcn/ui 컴포넌트는 `pnpm dlx shadcn@latest add {name}`으로 추가합니다.
추가된 파일은 `src/components/ui/`에 생성됩니다.

### 자주 쓸 컴포넌트 목록

```bash
pnpm dlx shadcn@latest add button      # 버튼
pnpm dlx shadcn@latest add input       # 입력 필드
pnpm dlx shadcn@latest add sheet       # 바텀 시트 (청약 금액 입력 등)
pnpm dlx shadcn@latest add dialog      # 모달
pnpm dlx shadcn@latest add tabs        # 탭 (IPO 캘린더 청약일정/청약내역)
pnpm dlx shadcn@latest add badge       # 배지 (청약가능, D-2 등)
pnpm dlx shadcn@latest add skeleton    # 로딩 스켈레톤
pnpm dlx shadcn@latest add toast       # 토스트 알림
```

### 버튼 패턴

```tsx
// Primary CTA
<button className="w-full bg-primary text-white py-4 rounded-xl font-semibold">
  청약신청
</button>

// Secondary (취소)
<button className="w-full bg-surface text-text-primary py-4 rounded-xl font-semibold">
  취소
</button>

// 아웃라인 (청약가능 배지)
<span className="border border-primary text-primary text-xs px-2 py-0.5 rounded-full">
  청약가능
</span>
```

---

## IPO 캘린더 색상 코딩

캘린더 이벤트 바는 아래 규칙을 따릅니다.

| 이벤트 | 색상 | 클래스 |
|--------|------|--------|
| 청약시작 | `#FF4B8B` | `bg-pink` |
| 청약마감 | `#FF4B8B` (점선 테두리) | `border border-dashed border-pink` |
| 상장(예정)일 | `#00C0A0` | `bg-teal` |

범례 점 표시:
```tsx
<span className="w-2 h-2 rounded-full bg-pink inline-block" />
<span className="text-xs text-text-secondary">청약시작</span>
```

---

## 수익률 표시 규칙

```tsx
function PriceChange({ value }: { value: number }) {
  const isPositive = value > 0
  return (
    <span className={isPositive ? 'amount-positive' : 'amount-negative'}>
      {isPositive ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}
```

---

## 아바타 / 종목 배지

IPO 종목명 앞에 표시되는 원형 배지입니다.

```tsx
// 티커 첫 2글자를 이니셜로 사용
function TickerBadge({ ticker, color }: { ticker: string; color: string }) {
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
      style={{ backgroundColor: color }}
    >
      {ticker.slice(0, 2)}
    </div>
  )
}

// 예시
<TickerBadge ticker="CRWV" color="#FF6830" />  // → "CR"
```

---

## 반응형 지원 여부

이 프로젝트는 **모바일 전용(430px 이하)**으로 설계되었습니다.
데스크탑에서는 중앙 430px 영역만 표시되며, 태블릿/데스크탑 레이아웃을 별도로 지원하지 않습니다.

```css
/* mobile-container가 하는 일 */
.mobile-container {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
}
```

---

## 헤더 패턴

UI 이미지 분석 결과, 3가지 헤더 패턴이 존재합니다.

### 패턴 A — 홈 헤더 (로고 + 액션)

```tsx
<Header showNotification showMypage />
// 좌: SOL SOL 달러 로고 (파란색 SOL SOL)
// 우: 알림벨(→ /notifications) + MY 아바타(→ /mypage)
```

### 패턴 B — 탭 페이지 헤더 (타이틀 + 액션)

```tsx
<Header title="마이페이지" showNotification showSearch showMypage={false} />
// 좌: 페이지 타이틀 (예: "마이페이지")
// 우: 알림벨 + 검색 아이콘
```

### 패턴 C — 상세 페이지 헤더 (뒤로가기 + 중앙 타이틀)

```tsx
<Header showBack title="알림센터" showNotification={false} showMypage={false} showSettings />
// 좌: < 뒤로가기 (절대 좌측)
// 중앙: 페이지 타이틀 (절대 중앙 정렬)
// 우: 설정/검색/찜 등 페이지별 액션
```

**타이틀 위치**: `showBack=true`일 때 타이틀은 반드시 `position: absolute; left: 50%` 중앙 정렬.

---

## PIN 키패드 패턴

온보딩 PIN 입력, 송금 비밀번호 확인에서 사용하는 파란 키패드입니다.

```tsx
// 배경: bg-primary (#1C1FE8), 텍스트: 흰색
<div className="bg-primary grid grid-cols-3">
  {keys.map(k => (
    <button className="py-5 text-white text-xl font-medium active:bg-white/10">
      {k}
    </button>
  ))}
</div>
// 키: 1~9, 재배열(셔플), 0, ← (백스페이스)
```

---

## PIN 진행 표시

6자리 PIN 입력 진행 상태를 점으로 표시합니다.

```tsx
<div className="flex gap-4">
  {Array.from({ length: 6 }).map((_, i) => (
    <div className={`w-4 h-4 rounded-full border-2 ${
      i < pinLength ? 'bg-primary border-primary' : 'border-border'
    }`} />
  ))}
</div>
```

---

## 타임라인 마일스톤

IPO 상세 페이지의 4단계 진행 표시입니다.

```tsx
// 가로 점선 배경, 각 단계는 원형 도트 + 레이블
<div className="flex items-center relative">
  <div className="absolute left-0 right-0 top-2.5 h-0.5 bg-border" />
  {milestones.map((m) => (
    <div className="flex-1 flex flex-col items-center">
      <div className={`w-5 h-5 rounded-full border-2 z-10 ${
        m.active ? 'bg-primary border-primary' : 'bg-white border-border'
      }`} />
      <p className={`text-[10px] mt-1 ${m.active ? 'text-primary' : 'text-text-tertiary'}`}>
        {m.label}
      </p>
      <p className="text-[10px] text-text-tertiary">{m.date}</p>
    </div>
  ))}
</div>
```

**마일스톤 4단계**: 청약시작 → 청약마감 → 청약대금납부 → 상장/환불예정일

---

## 쉬는 달러 위젯

홈 화면의 유휴 달러 감지 위젯입니다.

```tsx
<section className="mx-4 mt-4 p-4 bg-surface rounded-2xl">
  <div className="flex items-start gap-3">
    <span className="text-2xl">💤</span>
    <div className="flex-1">
      <p className="text-sm font-semibold">$3,850가 10일째 쉬고 있어요</p>
      <ul className="mt-2 space-y-1">
        <li className="text-xs text-text-secondary">• 예상 수익, 참여 유도 메시지</li>
      </ul>
    </div>
  </div>
  <button className="mt-3 w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold">
    IPO 청약 바로가기
  </button>
</section>
```

---

## 알림 카드 패턴

미읽음 알림은 좌측에 Primary 컬러 보더 라인으로 구분합니다.

```tsx
<div className={`p-4 border-b border-border ${
  !notification.read ? 'border-l-2 border-l-primary' : ''
}`}>
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 rounded-full bg-surface text-xl">🎉</div>
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-text-secondary">{body}</p>
      {/* 환불금 입금 알림은 CTA 버튼 포함 */}
      {hasAction && (
        <button className="mt-3 w-full bg-primary text-white py-2.5 rounded-xl text-sm">
          리턴 플랜 설정
        </button>
      )}
    </div>
  </div>
</div>
```

---

## 토글 스위치 패턴

알림설정 등에서 사용하는 커스텀 토글입니다.

```tsx
<button
  onClick={toggle}
  className={`relative w-12 h-7 rounded-full transition-colors ${
    enabled ? 'bg-primary' : 'bg-border'
  }`}
>
  <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
    enabled ? 'translate-x-6' : 'translate-x-1'
  }`} />
</button>
```

---

## 구매 Bottom Sheet

증권 종목 상세에서 사용하는 구매 바텀시트입니다.

```tsx
// Sheet 내부 구조
<div className="bg-white rounded-t-3xl px-4 pt-6 pb-8">
  <h3>몇 주 구매할까요?</h3>
  {/* 수량: - / 숫자 / + */}
  <div className="flex items-center gap-3">
    <button className="w-10 h-10 rounded-full border">-</button>
    <span className="flex-1 text-center text-2xl">{qty}주</span>
    <button className="w-10 h-10 rounded-full border">+</button>
  </div>
  {/* 구매 예약 요약 */}
  <div className="p-4 bg-surface rounded-xl">
    계좌 / 내 달러 수량 / 구매 주 수 / 총 구매 대금
  </div>
  <button className="w-full bg-primary text-white py-4 rounded-xl">구매하기</button>
</div>
```
