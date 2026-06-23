import { useState, useRef, useCallback } from 'react'

export interface AnimatedChar {
  char: string
  id: number
  exiting: boolean
}

export function useAnimatedInput() {
  const [chars, setChars] = useState<AnimatedChar[]>([])
  const nextId = useRef(0)

  const amount = chars.filter((c) => !c.exiting).map((c) => c.char).join('')

  const pushChar = useCallback((ch: string) => {
    const id = nextId.current++
    setChars((prev) => [...prev, { char: ch, id, exiting: false }])
  }, [])

  const popChar = useCallback(() => {
    setChars((prev) => {
      const last = [...prev].reverse().find((c) => !c.exiting)
      if (!last) return prev
      const updated = prev.map((c) => (c.id === last.id ? { ...c, exiting: true } : c))
      setTimeout(() => {
        setChars((p) => p.filter((c) => c.id !== last.id))
      }, 130)
      return updated
    })
  }, [])

  const clear = useCallback(() => setChars([]), [])

  return { chars, amount, pushChar, popChar, clear }
}
