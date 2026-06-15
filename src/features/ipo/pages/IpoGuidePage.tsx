import { Header } from '@/components/common/Header'

const STEPS = [
  {
    step: 'Step 1',
    title: '신한인증서로 본인 인증',
    desc: '신한 그룹 통합인증을 통해 안전하게 로그인합니다.\n(신한인증서 가입 시 한 번만 진행)',
  },
  {
    step: 'Step 2',
    title: '(청약시작일~마감일) 공모주 청약 신청',
    desc: 'USD 청약금액을 입력하면 자동으로 원화 환전 후\nIPO 청약대행 증거금이 출금됩니다.',
  },
  {
    step: 'Step 3',
    title: '27+1 주름 운영 및 기다리기',
    desc: '청약 후 배정일까지 기다립니다. 배정 결과는\n상장일 당일 알림으로 받을 수 있어요.',
  },
  {
    step: 'Step 4',
    title: '(상장+2일) 최종 결제 및 거래',
    desc: '배정받은 주식이 증권 계좌로 입고됩니다.\n미배정 금액은 외화 계좌로 환불됩니다.',
  },
]

const COMPARISON = [
  { label: '청약 방식', solsol: 'USD 직접 청약', other: '원화 → 환전 → 청약' },
  { label: '환전 수수료', solsol: '없음', other: '있음' },
  { label: '최소 청약금액', solsol: 'USD 100~', other: '약 100만원~' },
  { label: '청약 시간', solsol: '24시간', other: '영업시간 내' },
]

export function IpoGuidePage() {
  return (
    <div className="page-content">
      <Header showBack title="IPO 가이드" showNotification={false} showMypage={false} />

      <div className="px-4 pt-6 pb-4">
        <h2 className="text-xl font-bold text-text-primary">이렇게 미국 주식에 청약할 수 있어요</h2>
        <p className="text-sm text-text-secondary mt-2">SOL SOL 달러만의 간편한 청약 방법을 안내드려요</p>
      </div>

      {/* 청약 흐름 다이어그램 */}
      <section className="px-4 mb-6">
        <div className="bg-surface rounded-2xl p-4 flex items-center justify-between text-center text-xs">
          {['신한인증', '계좌연동', 'IPO 청약', '배정확인'].map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {i + 1}
                </div>
                <span className="mt-1 text-text-secondary">{step}</span>
              </div>
              {i < 3 && <span className="text-text-tertiary mx-1">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* 단계별 설명 */}
      <section className="px-4 space-y-5 mb-6">
        {STEPS.map((s) => (
          <div key={s.step} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {s.step.replace('Step ', '')}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{s.title}</p>
              <p className="text-xs text-text-secondary mt-1 whitespace-pre-line">{s.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 비교 표 */}
      <section className="px-4 mb-6">
        <h3 className="text-base font-bold text-text-primary mb-3">주요 공모주 신청 비교</h3>
        <div className="rounded-xl overflow-hidden border border-border">
          <div className="grid grid-cols-3 bg-surface p-3 text-xs text-text-secondary">
            <span>구분</span>
            <span className="text-center text-primary font-semibold">SOL SOL달러</span>
            <span className="text-center">타사 MTS</span>
          </div>
          {COMPARISON.map((row) => (
            <div key={row.label} className="grid grid-cols-3 text-xs p-3 border-t border-border">
              <span className="text-text-secondary">{row.label}</span>
              <span className="text-center font-semibold text-primary">{row.solsol}</span>
              <span className="text-center text-text-secondary">{row.other}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 mb-6">
        <h3 className="text-base font-bold text-text-primary mb-3">주요 공모주 신청, 저희가 도와드립니다</h3>
        {[
          '미국 공모주 청약은 어떤 절차로 진행되나요?',
          'IPO 청약 시 필요한 최소 금액은 얼마인가요?',
          '배정 후 환불금은 어디로 입금되나요?',
        ].map((q) => (
          <button key={q} className="w-full text-left py-3.5 border-b border-border text-sm text-text-primary flex items-center justify-between">
            <span>{q}</span>
            <span className="text-text-tertiary">+</span>
          </button>
        ))}
      </section>
    </div>
  )
}
