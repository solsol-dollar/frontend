import { useState } from 'react'
import { Header } from '@/components/common/Header'
import { cn } from '@/lib/utils'

type GuideTab = '서비스 안내' | '일정 안내'

type ComparisonRow = {
  label: string
  domestic: { main: string; sub?: string }
  foreign: { main: string; sub?: string; bold?: boolean }
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: '신한투자증권\n역할',
    domestic: { main: 'IPO 및 청약 업무 주관' },
    foreign: { main: '단순 대행', bold: true },
  },
  {
    label: '대상종목',
    domestic: { main: '거래소, 코스닥 시장 상장예정인 종목' },
    foreign: {
      main: 'NYSE, 나스닥, 아멕스\n상장예정인 종목',
      sub: '- 단, 당사와 제휴한\nIPO중개회사에서\n진행하는 종목에 한함',
    },
  },
  {
    label: '청약증거금',
    domestic: { main: '50%' },
    foreign: { main: '101%', bold: true },
  },
  {
    label: '청약경쟁률',
    domestic: { main: '공개' },
    foreign: { main: '미공개', bold: true },
  },
  {
    label: '배정방식',
    domestic: { main: '균등배정,\n비례배정' },
    foreign: { main: '미국현지 IPO중개회사\n내부기준에 따른 배정' },
  },
  {
    label: '청약수수료\n(온라인기준)',
    domestic: {
      main: '2,000원/건',
      sub: '- SOL 멤버십 베스트\n이상 고객 면제',
    },
    foreign: { main: '배정금액의\n0.5%', bold: true },
  },
]


export function IpoGuidePage() {
  const [activeTab, setActiveTab] = useState<GuideTab>('서비스 안내')

  return (
    <div className="mobile-container flex flex-col h-screen bg-[#F6F6F9]">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
        centerContent={<span className="text-base font-bold text-text-primary">SOL SOL 달러 가이드</span>}
      />

      <div className="flex bg-white border-b border-[#E5E7EB] flex-shrink-0">
        {(['서비스 안내', '일정 안내'] as GuideTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-3 text-[15px] font-bold transition-colors',
              activeTab === tab
                ? 'text-[#111111] border-b-2 border-[#111111]'
                : 'text-[#999EA4]',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className="fixed bottom-[79px] left-1/2 -translate-x-1/2 w-full max-w-mobile pointer-events-none z-[10]"
        style={{ height: '1px', boxShadow: '0 -8px 20px rgba(0,0,0,0.22)' }}
      />
      <div className="flex-1 overflow-y-auto scrollbar-hide overscroll-none">
        {activeTab === '서비스 안내' ? (
          <>
            {/* 1. 서비스 소개 */}
            <section className="px-4 pt-6 pb-4 bg-white">
              <h2 className="text-[20px] font-bold text-[#111827] leading-[1.6] mb-5 whitespace-pre-line">
                {'이제 미국 주식을\n청약으로 배정받을 수 있어요!'}
              </h2>
              <p className="text-[14px] font-bold text-[#424242] mb-2">
                미국 공모주 청약대행 서비스란?
              </p>
              <p className="text-[12px] text-[#6B7280] leading-relaxed mt-3">
                신한투자증권이 미국 현지 IPO 중개회사와 제휴하여 미국 공모주 청약에 직접 참여할 수 있도록 청약업무를 대행해 드리는 서비스입니다.
              </p>
            </section>

            {/* 2. 구조도 */}
            <section className="px-4 pt-5 pb-6 bg-white mt-[13px]">
              <p className="text-[14px] font-bold text-[#424242] mb-4">
                미국 공모주 청약대행 구조는?
              </p>
              <div className="bg-[#F6F6F9] rounded-xl px-3 py-4">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <div className="bg-white rounded-[5px] px-2.5 py-1.5 text-[12px] font-semibold text-[#111827] shadow-sm text-center min-w-[44px]">고객</div>
                    <div className="bg-[#2563EB] rounded-[5px] px-2 py-1.5 text-[12px] font-semibold text-white text-center">신한투자증권</div>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <span className="text-[9px] text-[#6B7280] leading-tight text-center whitespace-pre-line">{'청약\n대행신청'}</span>
                    <span className="text-[#D1D5DB] text-sm leading-none">→</span>
                    <span className="text-[#D1D5DB] text-sm leading-none">←</span>
                    <span className="text-[9px] text-[#6B7280] leading-tight">배정</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-[#2563EB] rounded-[5px] px-2 py-1.5 text-[12px] font-semibold text-white text-center">IPO 중개사</div>
                    <div className="bg-white rounded-[5px] px-2.5 py-1.5 text-[12px] font-semibold text-[#111827] shadow-sm text-center min-w-[44px]">주관사</div>
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-[#6B7280] leading-relaxed mt-4">
                ※ 본 서비스는 당사의 미국 현지 IPO중개회사와 업무제휴를 통해 진행되며, 당사는 고객의 요청에 따라 청약의 접수 및 자금이체 등을 대행할 뿐 일체의 "청약권유" 및 "투자권유"를 하지 않습니다. 즉, 서비스 소개 외 청약 및 투자를 권유할 수 없습니다. 고객님은 청약을 신청함에 있어 전적으로 본인의 판단하에 투자하여야 합니다.
              </p>
            </section>

            {/* 3. 이런 점이 좋아요 */}
            <section className="px-4 pt-5 pb-6 bg-white mt-[13px]">
              <p className="text-[14px] font-bold text-[#424242] mb-4 whitespace-pre-line">
                {'미국 공모주 청약대행 서비스 이런 점이 좋아요!'}
              </p>
              <div className="space-y-3">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex gap-3">
                  <div className="w-10 h-10 flex-shrink-0">
                    <img src="/icons/money.svg" alt="" className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-[13px] text-[#8A8A95]">개인투자자 참여가 어려운</p>
                    <p className="text-[15px] font-bold text-[#1A1A1A]">미국 IPO에 직접 참여 가능</p>
                  </div>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex gap-3">
                  <div className="w-10 h-10 flex-shrink-0">
                    <img src="/icons/graph.svg" alt="" className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#1A1A1A] mt-1 mb-1">
                      상장일 당일 배정주식수 확인 및 매도 가능
                    </p>
                    <p className="text-[13px] text-[#8A8A95]">- 상장일에 배정주식수 확인 및 거래 가능</p>
                    <p className="text-[13px] text-[#8A8A95]">- T 영업일에 주식입고 / 출고 가능</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. 비교표 */}
            <section className="px-4 pt-5 pb-6 bg-white mt-[13px]">
              <p className="text-[14px] font-bold text-[#424242] mb-4">
                국내 공모주 vs. 해외 공모주 청약 비교
              </p>
              <div className="rounded-xl overflow-hidden border border-[#E5E7EB]">
                <div className="grid grid-cols-3 bg-[#F6F6F9]">
                  <div className="px-2 py-3 text-[13px] font-medium text-[#5C6178]">구분</div>
                  <div className="px-2 py-3 text-[13px] font-medium text-[#5C6178] border-l border-[#E5E7EB] text-center">국내 IPO공모주청약</div>
                  <div className="px-2 py-3 text-[13px] font-medium text-[#5C6178] border-l border-[#E5E7EB] text-center">미국 IPO공모주청약</div>
                </div>
                {COMPARISON_ROWS.map((row, i) => (
                  <div key={i} className="grid grid-cols-3 border-t border-[#E5E7EB]">
                    <div className="px-2 py-3 bg-[#F6F6F9] text-[12px] font-medium text-[#5C6178] whitespace-pre-line">{row.label}</div>
                    <div className="px-2 py-3 border-l border-[#E5E7EB]">
                      <p className="text-[13px] text-[#3A3A4A] whitespace-pre-line">{row.domestic.main}</p>
                      {row.domestic.sub && (
                        <p className="text-[11px] text-[#8A8A95] mt-1 whitespace-pre-line">{row.domestic.sub}</p>
                      )}
                    </div>
                    <div className="px-2 py-3 border-l border-[#E5E7EB]">
                      <p className={cn('whitespace-pre-line', row.foreign.bold ? 'text-[14px] font-bold text-[#1A1A1A]' : 'text-[13px] text-[#1A1A1A]')}>
                        {row.foreign.main}
                      </p>
                      {row.foreign.sub && (
                        <p className="text-[11px] text-[#8A8A95] mt-1 whitespace-pre-line">{row.foreign.sub}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. 유의사항 */}
            <section className="px-4 pt-5 pb-32 bg-white mt-[13px]">
              <p className="text-[14px] font-bold text-[#424242] mb-4 whitespace-pre-line">
                {'미국 공모주 청약대행 신청시,\n이런 점을 유의하세요!'}
              </p>
              <div className="bg-[#F6F6F9] rounded-xl p-4 space-y-2.5">
                {[
                  <span key={0} className="text-[12px] font-medium text-[#6B7280] leading-snug whitespace-pre-line">{'해당 기업에 정보를 충분히 파악하고 결정하는 것이\n중요합니다.'}</span>,
                  <span key={1} className="text-[12px] font-medium text-[#6B7280] leading-snug">미국 공모주 청약에 대한 배정은 국내와 달리 <span className="font-bold text-[#1A1A1A]">미국 현지 IPO중개회사 내부기준에 따라 진행되며, 배정받지 못할 수도 있습니다.</span></span>,
                  <span key={2} className="text-[12px] font-medium text-[#6B7280] leading-snug">현지 사정으로 청약이 취소(중단)될 수 있습니다.</span>,
                ].map((content, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[12px] text-[#6B7280] flex-shrink-0">•</span>
                    <p className="leading-snug">{content}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {[
              {
                step: 'STEP 1',
                title: '[청약기간(~ T-1)] 청약 대행 신청',
                body: '청약 전에 충분히 청약종목의 투자정보를\n확인하고 청약을 진행해주세요.',
                infoBox: {
                  highlight: '청약 가능 시간 : 9:00 ~ 17:00',
                  desc: '주요정보변경 및 공모가 범위 20% 초과 등의 경우에는 청약의사를 재확인하고 청약신청을 확정합니다.',
                  descBlue: '※ 청약확정등록을 하지 않는 경우 청약이 자동취소됨',
                },
              },
              {
                step: 'STEP 2',
                title: '[상장일(T)] 배정 주식수 확인 및 리턴 플랜',
                body: '청약내역 화면에서 배정 주식수를 확인할 수 있습니다.\n예정된 환불금을 리턴 플랜을 통해 분배해보세요!',
                note: '※ 배정결과는 통상 상장(예정)일 정규시장 개장 후 1~3시간\n이내 확인 가능합니다.',
              },
              {
                step: 'STEP 3',
                title: '[상장일(T)] 주식 입고 및 거래',
                body: '잔고 화면에서 배정받은 주식을 확인할 수 있고,\n즉시 출고 및 거래할 수 있습니다.',
              },
              {
                step: 'STEP 4',
                title: '[(T+1)] 환불 및 리턴 플랜 분배',
                body: '청약 내역에서 환불내역을 확인할 수 있으며,\n예약된 리턴 플랜을 통해 환불금이 분배되어\n외화예수금, 적립예금, 카드로 이동합니다.',
              },
            ].map(({ step, title, body, infoBox, note }: { step: string; title: string; body: string; infoBox?: { highlight: string; desc: string; descBlue?: string }; note?: string }, i) => (
              <section key={i} className={cn('px-5 pt-8 pb-10 bg-white text-center', i > 0 && 'mt-[13px]')}>
                <div className="inline-flex items-center justify-center bg-[#EBEFFF] rounded-full px-3 h-[24px] mb-4">
                  <span className="text-[11px] font-bold text-[#5565BF]" style={{ lineHeight: 1, paddingTop: '0.5px' }}>{step}</span>
                </div>
                <p className="text-[14px] font-bold text-[#111827] mb-3">{title}</p>
                <p className="text-[13px] font-medium text-[#6B7280] whitespace-pre-line leading-relaxed mb-2">{body}</p>
                {infoBox && (
                  <div className="border-[1.5px] border-[#E5E7EB] rounded-xl px-4 py-3 text-center mt-4">
                    <p className="text-[13px] font-bold text-[#0922AC] mb-1">{infoBox.highlight}</p>
                    <p className="text-[12px] text-[#6B7280] leading-relaxed text-left">{infoBox.desc}</p>
                    {infoBox.descBlue && <p className="text-[12px] text-[#0922AC] leading-relaxed text-left">{infoBox.descBlue}</p>}
                  </div>
                )}
                {note && (
                  <p className="text-[12px] text-[#0922AC] leading-relaxed text-center whitespace-pre-line">{note}</p>
                )}
              </section>
            ))}
            <div className="h-24 bg-white" />
          </>
        )}
      </div>
    </div>
  )
}
