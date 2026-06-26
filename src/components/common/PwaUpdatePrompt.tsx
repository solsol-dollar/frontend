import { useRegisterSW } from 'virtual:pwa-register/react'

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-[#1C1FE8] px-5 py-3 text-white shadow-lg">
      <span className="text-sm font-medium">새 버전이 있어요</span>
      <button
        className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-[#1C1FE8]"
        onClick={() => updateServiceWorker(true)}
      >
        업데이트
      </button>
      <button
        className="text-xs text-white/70"
        onClick={() => setNeedRefresh(false)}
      >
        나중에
      </button>
    </div>
  )
}
