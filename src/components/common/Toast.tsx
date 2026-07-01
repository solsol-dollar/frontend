import { useEffect } from 'react'

interface ToastProps {
  message: string
  visible: boolean
  onClose?: () => void
}

export function Toast({ message, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (visible && onClose) {
      const timer = setTimeout(onClose, 2500)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-[#333333] text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-medium whitespace-nowrap text-center">
        {message}
      </div>
    </div>
  )
}
