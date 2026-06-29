import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { Share2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import { Header } from '@/components/common/Header'
import type { IpoNewsItem } from '@/features/ipo/api/ipoApi'
import { useIpoNewsDetail } from '@/features/ipo/hooks/useIpo'

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



export function IpoNewsDetailPage() {
  const navigate = useNavigate()
  const { ipoId, newsId } = useParams()
  const { state } = useLocation()
  const news: IpoNewsItem | undefined = state?.news
  const { data: detailData } = useIpoNewsDetail(Number(ipoId), Number(newsId))
  const detail = detailData?.data
  const [lang, setLang] = useState<Lang>('한')
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    if (!news) { navigate(-1); return }
    scrollRef.current?.scrollTo({ top: 0 })
    setLang('한')
    setSummaryExpanded(false)
  }, [news?.id])

  useEffect(() => {
    const idx = lang === '한' ? 0 : 1
    const el = tabRefs.current[idx]
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
  }, [lang])

  if (!news) return null

  const sourceLogo = SOURCE_LOGO_MAP[news.source]
  const titleKo = detail?.titleKo ?? news.titleKo
  const displayTitle = lang === 'EN' ? (detail?.title ?? news.title) : (titleKo ?? news.title)

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

      <div className="flex items-center justify-between px-4 py-[14px] bg-[#F6F6F9] shrink-0">
        <span className="text-[13px] text-[#535965] font-medium">{lang === 'EN' ? '기사 원문을 보고있어요' : 'SOLSOL 달러 AI가 번역했어요'}</span>
        <div className="relative flex bg-[#E9E9E9] rounded-[7px] p-0.5">
          <div
            className="absolute top-0.5 bottom-0.5 rounded-[6px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out"
            style={{ left: indicator.left, width: indicator.width }}
          />
          {(['한', 'EN'] as Lang[]).map((l, i) => (
            <button
              key={l}
              ref={el => { tabRefs.current[i] = el }}
              onClick={() => { setLang(l); navigator.vibrate?.(10) }}
              className={cn(
                'relative z-10 px-[9px] py-[3px] rounded-[6px] text-[12px] transition-colors duration-200',
                lang === l ? 'text-black font-semibold' : 'text-[#999EA4] font-medium',
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-5 bg-white">
        <div className="flex gap-2 mb-5">
          {sourceLogo && (
            <div className="flex items-center">
              <img src={sourceLogo} alt={news.source} className="h-5 object-contain" />
            </div>
          )}
          <span className="text-[12px] font-bold text-[#535965] flex items-end pb-[1px]">{news.source}</span>
        </div>

        <h1 className="text-[22px] font-semibold text-[#111827] leading-[1.35] mb-5">{displayTitle}</h1>

        {lang === 'EN' && (detail?.summary ?? news.summary) && (
          <div className="bg-[#F5F4FF] border border-[#E4E0FF] rounded-[14px] p-4 mb-5">
            <div className="flex items-center gap-[6px] mb-[10px]">
              <span className="text-[14px] font-bold text-[#3045BB]">✦ 기사를 분석했어요</span>
              <span className="w-[16px] h-[16px] rounded-full border border-[#C8CAD0] flex items-center justify-center text-[10px] text-[#9AA0AB] leading-none">?</span>
            </div>
            <p className={cn('text-[14px] text-[#535965] leading-[1.6]', !summaryExpanded && 'line-clamp-3')}>
              {detail?.summary ?? news.summary}
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
          {(lang === 'EN'
            ? (detail?.content ?? '').split(/\n+/)
            : (detail?.contentKo ?? '').split(/\n+/)
          ).filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

      </div>
    </div>
  )
}
