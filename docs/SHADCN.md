# shadcn/ui 사용 가이드

shadcn/ui는 Radix UI 기반의 컴포넌트 라이브러리입니다.
npm 패키지가 아니라 **소스 코드를 직접 프로젝트에 복사**하는 방식으로 동작합니다.
`src/components/ui/`에 생성되며, 자유롭게 수정 가능합니다.

---

## 컴포넌트 추가 방법

```bash
pnpm dlx shadcn@latest add {컴포넌트명}
```

추가된 파일은 `src/components/ui/{name}.tsx`에 생성됩니다.

---

## Eclipse에서 쓰는 컴포넌트 목록

| 컴포넌트 | 명령어 | 주요 사용 화면 |
|----------|--------|--------------|
| Button | `add button` | CTA 버튼 전체 |
| Input | `add input` | 청약 금액, 송금 금액 입력 |
| Sheet | `add sheet` | 바텀 시트 (구매 팝업, 계좌 선택) |
| Dialog | `add dialog` | 확인 모달 (청약 신청 확인 등) |
| Tabs | `add tabs` | IPO 캘린더 탭, 증권 탭 |
| Badge | `add badge` | 청약가능, D-2, result_status 표시 |
| Skeleton | `add skeleton` | 데이터 로딩 중 UI |
| Toast | `add toast` | 성공/실패 알림 |
| Select | `add select` | 계좌 선택 드롭다운 |
| Slider | `add slider` | 리턴플랜 금액 배분 슬라이더 |
| Progress | `add progress` | News Score 진행바 |

한 번에 여러 개 추가:
```bash
pnpm dlx shadcn@latest add button input sheet dialog tabs badge skeleton toast select slider progress
```

---

## 컴포넌트별 사용 예시

### Button

```tsx
import { Button } from '@/components/ui/button'

// Primary CTA
<Button className="w-full bg-primary hover:bg-primary/90">청약신청</Button>

// Secondary (취소)
<Button variant="outline" className="w-full">취소</Button>

// 비활성화
<Button disabled>청약 마감</Button>

// 두 버튼 나란히 (취소 + 확인)
<div className="flex gap-3">
  <Button variant="outline" className="flex-1">취소</Button>
  <Button className="flex-1 bg-primary">청약신청</Button>
</div>
```

---

### Input

```tsx
import { Input } from '@/components/ui/input'

// 기본
<Input placeholder="USD 100 이상 입력" type="number" />

// 레이블 포함
<div className="space-y-1.5">
  <label className="text-sm text-text-secondary">청약신청금액</label>
  <Input placeholder="USD100 이상, USD1 단위" />
</div>

// React Hook Form 연동
<Input {...register('amount')} />
{errors.amount && (
  <p className="text-xs text-up mt-1">{errors.amount.message}</p>
)}
```

---

### Sheet (바텀 시트)

모바일에서 아래에서 위로 올라오는 패널입니다. 구매 팝업, 계좌 선택 등에 사용합니다.

```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

<Sheet>
  <SheetTrigger asChild>
    <Button className="w-full bg-primary">구매</Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8">
    <SheetHeader>
      <SheetTitle>마이크로소프트 구매</SheetTitle>
    </SheetHeader>
    {/* 구매 폼 */}
    <div className="mt-4 space-y-4">
      <Input placeholder="수량 입력" type="number" />
      <Button className="w-full bg-primary">구매 확인</Button>
    </div>
  </SheetContent>
</Sheet>
```

---

### Dialog (모달)

청약 신청 최종 확인, 송금 확인 등에 사용합니다.

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-[90%] rounded-2xl">
    <DialogHeader>
      <DialogTitle>청약을 신청하시겠어요?</DialogTitle>
    </DialogHeader>
    <p className="text-sm text-text-secondary">
      CoreWeave USD 20,000 청약대행증거금이 출금됩니다.
    </p>
    <DialogFooter className="flex-row gap-3 mt-4">
      <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
        취소
      </Button>
      <Button className="flex-1 bg-primary" onClick={handleConfirm}>
        확인
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Tabs

IPO 캘린더 청약일정/청약내역, 증권 MY홈/해외/ETF 탭에 사용합니다.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

<Tabs defaultValue="schedule">
  <TabsList className="w-full border-b border-border bg-transparent rounded-none h-auto p-0">
    <TabsTrigger
      value="schedule"
      className="flex-1 py-3 rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:text-text-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-text-tertiary"
    >
      청약 일정
    </TabsTrigger>
    <TabsTrigger
      value="history"
      className="flex-1 py-3 rounded-none border-b-2 data-[state=active]:border-primary data-[state=active]:text-text-primary data-[state=inactive]:border-transparent data-[state=inactive]:text-text-tertiary"
    >
      청약내역/취소
    </TabsTrigger>
  </TabsList>
  <TabsContent value="schedule">
    {/* 캘린더 */}
  </TabsContent>
  <TabsContent value="history">
    {/* 청약 내역 목록 */}
  </TabsContent>
</Tabs>
```

---

### Badge

청약 상태, D-day 카운트다운 등에 사용합니다.

```tsx
import { Badge } from '@/components/ui/badge'

// 청약가능
<Badge variant="outline" className="border-primary text-primary text-xs">
  청약가능
</Badge>

// D-2 (마감 임박)
<Badge className="bg-up text-white text-xs">D-2</Badge>

// result_status별 배지
const statusConfig = {
  PENDING:   { label: '배정 대기', className: 'bg-surface text-text-secondary' },
  ALLOCATED: { label: '배정 완료', className: 'bg-teal text-white' },
  REFUNDED:  { label: '환불 완료', className: 'bg-sky-blue text-white' },
}

<Badge className={statusConfig[status].className}>
  {statusConfig[status].label}
</Badge>
```

---

### Skeleton (로딩 UI)

API 응답 대기 중 콘텐츠 자리를 잡아줍니다.

```tsx
import { Skeleton } from '@/components/ui/skeleton'

// React Query isLoading과 함께 사용
function IpoCard() {
  const { data, isLoading } = useIpoList()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return <>{/* 실제 콘텐츠 */}</>
}
```

---

### Toast

송금 완료, 청약 신청 완료, 에러 등의 피드백에 사용합니다.

```tsx
// main.tsx에 Toaster 추가 필요
import { Toaster } from '@/components/ui/toaster'

// main.tsx
<QueryClientProvider client={queryClient}>
  <RouterProvider router={router} />
  <Toaster />
</QueryClientProvider>
```

```tsx
// 사용하는 곳에서
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

// 성공
toast({ title: '청약 신청 완료', description: 'CoreWeave USD 20,000 청약이 접수되었습니다.' })

// 에러
toast({ title: '오류', description: '잠시 후 다시 시도해주세요.', variant: 'destructive' })
```

---

### Progress (News Score 진행바)

IPO 종목 상세의 News Score 시각화에 사용합니다.

```tsx
import { Progress } from '@/components/ui/progress'

// News Score: 62/100
<div className="space-y-2">
  <div className="flex justify-between items-center">
    <span className="font-bold">News Score</span>
    <span className="font-bold">62<span className="text-text-tertiary text-sm">/100</span></span>
  </div>
  <Progress value={62} className="h-2 bg-surface [&>div]:bg-primary" />
</div>
```

---

### Slider (리턴플랜 금액 배분)

```tsx
import { Slider } from '@/components/ui/slider'

const [ratio, setRatio] = useState([50])

<div className="space-y-3">
  <div className="flex justify-between text-sm text-text-secondary">
    <span>CMA 계좌</span>
    <span>외화통장</span>
  </div>
  <Slider
    value={ratio}
    onValueChange={setRatio}
    min={0}
    max={100}
    step={5}
    className="[&>span]:bg-primary"
  />
  <div className="flex justify-between text-sm font-medium">
    <span>{ratio[0]}%</span>
    <span>{100 - ratio[0]}%</span>
  </div>
</div>
```

---

## Tailwind 클래스 커스터마이징

shadcn/ui 컴포넌트의 기본 스타일을 Eclipse 디자인에 맞게 바꾸려면 `className`을 직접 덮어씁니다.

```tsx
// data-[state] 셀렉터로 활성/비활성 상태 제어
<TabsTrigger className="data-[state=active]:text-primary data-[state=active]:border-primary">
```

```tsx
// [&>...] 셀렉터로 자식 요소 스타일 제어
<Progress className="[&>div]:bg-primary" />
<Slider className="[&>span:first-child]:bg-surface [&>span:last-child]:bg-primary" />
```

---

## 주의사항

- shadcn/ui 컴포넌트는 `src/components/ui/`에 생성됩니다. 이 파일들은 수정해도 됩니다.
- `pnpm dlx shadcn@latest add`를 다시 실행하면 기존 파일을 덮어씁니다. 수정한 내용이 있다면 백업 후 실행하세요.
- Radix UI 기반이므로 키보드 접근성(포커스 이동, ESC 닫기)이 기본 제공됩니다.
