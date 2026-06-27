import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { Share2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import { Header } from '@/components/common/Header'
import type { IpoNewsItem } from '@/features/ipo/api/ipoApi'

const SOURCE_LOGO_MAP: Record<string, string> = {
  'Yahoo Finance': '/icons/Yahoo Finance.png',
  'uk.finance.yahoo.com': '/icons/Yahoo Finance.png',
  'sg.finance.yahoo.com': '/icons/Yahoo Finance.png',
  'Seeking Alpha': '/icons/Seeking Alpha.jpg',
  'Nasdaq': '/icons/Seeking Alpha.jpg',
  'GlobeNewsWire': '/icons/GlobeNewsWire.jpg',
  'CNBC': '/icons/CNBC.png',
  'investing.com': '/icons/investing.webp',
  'u.today': '/icons/utoday.png',
}

type Lang = '한' | 'EN'

const MOCK_TITLE_KO = '레드클라우드 홀딩스, 1억 2,000만 달러 규모 레드AI 합작 설립... 인도 시장 진출'
const MOCK_TITLE_EN = 'RedCloud Holdings Strikes $120 Million RedAI Joint Venture to Enter Indian Market'

const MOCK_BODY_KO = [
  "레드클라우드 홀딩스(RedCloud Holdings)가 인공지능 합작법인 '레드AI(RedAI)'를 설립하며 인도 시장 진출을 공식화했다. 이번 합작에는 총 1억 2,000만 달러(약 1,600억 원)가 투입되며, 인도 현지 파트너사인 인피니티 테크놀로지스와 공동으로 운영될 예정이다.",
  "레드AI는 인도 내 중소기업을 대상으로 AI 기반 공급망 최적화 솔루션을 제공할 계획이다. 인도는 현재 전 세계에서 가장 빠르게 성장하는 디지털 경제권 중 하나로, 관련 시장 규모는 2028년까지 약 800억 달러에 달할 것으로 전망된다.",
  "레드클라우드의 CEO 제임스 오코너는 \"인도는 우리가 오랫동안 주목해온 전략적 시장\"이라며 \"레드AI를 통해 현지 기업들의 디지털 전환을 가속화하는 핵심 파트너가 될 것\"이라고 밝혔다.",
  "한편 레드클라우드 홀딩스는 이번 발표 이후 나스닥 시장에서 주가가 장중 최대 8.3% 상승하며 투자자들의 긍정적인 반응을 이끌어냈다. 증권가에서는 이번 합작이 레드클라우드의 아시아 시장 확장 전략의 첫 단추가 될 것으로 평가하고 있다.",
]

const MOCK_BODY_EN = [
  "RedCloud Holdings has officially entered the Indian market with the establishment of an AI joint venture, RedAI. The deal, valued at $120 million, will be co-operated with Indian local partner Infinity Technologies.",
  "RedAI plans to offer AI-powered supply chain optimization solutions targeting small and medium-sized businesses across India. India is currently one of the fastest-growing digital economies in the world, with the related market projected to reach approximately $80 billion by 2028.",
  "RedCloud CEO James O'Connor stated, \"India is a strategic market we have long had our eye on,\" adding that \"through RedAI, we aim to become a core partner accelerating the digital transformation of local businesses.\"",
  "Following the announcement, RedCloud Holdings saw its Nasdaq-listed shares surge as much as 8.3% intraday, drawing a positive response from investors. Analysts view the joint venture as the first step in RedCloud's broader Asia expansion strategy.",
]

const MOCK_OTHER_NEWS: IpoNewsItem[] = [
  { id: 101, title: '레드클라우드, 2분기 매출 전년比 42% 증가... 시장 예상치 상회', source: 'Yahoo Finance', publishedAt: '2026-06-20T09:30:00', url: '#', summary: '' },
  { id: 102, title: '인도 AI 시장, 2028년까지 연평균 35% 성장 전망', source: 'Seeking Alpha', publishedAt: '2026-06-18T14:00:00', url: '#', summary: '' },
  { id: 103, title: '레드AI 합작법인, 뭄바이에 첫 번째 데이터센터 착공 예정', source: 'CNBC', publishedAt: '2026-06-15T11:00:00', url: '#', summary: '' },
]

export function IpoNewsDetailPage() {
  const navigate = useNavigate()
  const { ipoId } = useParams()
  const { state } = useLocation()
  const news: IpoNewsItem | undefined = state?.news
  const [lang, setLang] = useState<Lang>('한')
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!news) { navigate(-1); return }
    scrollRef.current?.scrollTo({ top: 0 })
    setLang('한')
    setSummaryExpanded(false)
  }, [news?.id])

  if (!news) return null

  const sourceLogo = SOURCE_LOGO_MAP[news.source]
  const displayTitle = lang === 'EN' ? (news.titleKo ? news.title : MOCK_TITLE_EN) : (news.titleKo ?? MOCK_TITLE_KO)

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: news.title, url: news.url }).catch(() => {})
    }
  }

  return (
    <div className="mobile-container flex flex-col h-screen bg-[#F6F6F9]">
      <Header
        showBack
        showNotification={false}
        showMypage={false}
        rightAction={
          <button onClick={handleShare} className="mr-1">
            <Share2 size={21} className="text-[#111827]" />
          </button>
        }
      />

      <div className="flex items-center justify-between px-4 py-[10px] bg-[#F6F6F9] shrink-0">
        <span className="text-[13px] text-[#535965] font-medium">{lang === 'EN' ? '기사 원문을 보고있어요' : 'SOLSOL 달러 AI가 번역했어요'}</span>
        <div className="flex bg-[#E9E9E9] rounded-[6px] p-0.5">
          {(['한', 'EN'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLang(l); navigator.vibrate?.(10) }}
              className={cn(
                'px-[6px] py-[1px] rounded-[6px] text-[11px] transition-colors',
                lang === l
                  ? 'bg-white text-black font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.15)]'
                  : 'text-[#999EA4] font-medium',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4 bg-white">
        <div className="flex gap-2 mb-5">
          {sourceLogo && (
            <div className="flex items-center">
              <img src={sourceLogo} alt={news.source} className="h-5 object-contain" />
            </div>
          )}
          <span className="text-[12px] font-bold text-[#535965] flex items-end pb-[1px]">{news.source}</span>
        </div>

        <h1 className="text-[22px] font-semibold text-[#111827] leading-[1.35] mb-5">{displayTitle}</h1>

        {news.summary && (
          <div className="bg-[#F5F4FF] border border-[#E4E0FF] rounded-[14px] p-4 mb-5">
            <div className="flex items-center gap-[6px] mb-[10px]">
              <span className="text-[14px] font-bold text-[#3045BB]">✦ 기사를 분석했어요</span>
              <span className="w-[16px] h-[16px] rounded-full border border-[#C8CAD0] flex items-center justify-center text-[10px] text-[#9AA0AB] leading-none">?</span>
            </div>
            <p className={cn('text-[14px] text-[#535965] leading-[1.6]', !summaryExpanded && 'line-clamp-3')}>
              {news.summary}
            </p>
            {!summaryExpanded && (
              <button
                className="flex items-center gap-[2px] text-[13px] text-[#9AA0AB] mt-2"
                onClick={() => setSummaryExpanded(true)}
              >
                더 보기 <ChevronDown size={14} />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center text-[13px] text-[#9AA0AB] mb-5">
          <span>{dayjs(news.publishedAt).format('YYYY년 M월 D일 HH:mm')}</span>
        </div>

        <div className="text-[15px] text-[#111827] leading-[1.9] space-y-5">
          {(lang === 'EN' ? MOCK_BODY_EN : MOCK_BODY_KO).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="h-[13px] bg-[#F6F6F9] -mx-5 mt-5" />
        <section className="bg-white pt-5 -mx-5 px-5">
          <p className="text-[15px] font-bold text-[#111827] mb-3">관련 뉴스</p>
          <div>
            {MOCK_OTHER_NEWS.filter((n) => n.id !== news.id).slice(0, 2).map((n) => (
              <button
                key={n.id}
                onClick={() => navigate(`/ipo/${ipoId}/news/${n.id}`, { state: { news: n } })}
                className="block w-full text-left py-3 px-3 -mx-3 rounded-sm border-b border-[#F0F1F4] last:border-0 transition-all duration-200 active:transition-none active:scale-[0.97] active:bg-[#F2F3F5] select-none"
              >
                <p className="text-[14px] font-semibold text-[#111827] leading-snug">{n.title}</p>
                <p className="text-[12px] text-[#9AA0AB] mt-1">
                  {n.source} · {dayjs(n.publishedAt).format('MM.DD')}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
