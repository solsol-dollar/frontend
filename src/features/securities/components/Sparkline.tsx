interface SparklineProps {
  data: number[]
  isUp?: boolean
  width?: number
  height?: number
}

export function Sparkline({ data, isUp = true, width = 56, height = 28 }: SparklineProps) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 2) - 1,
  }))
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={d} fill="none" stroke={isUp ? '#E53935' : '#1565C0'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function mockSparkData(seed: number, isUp: boolean, len = 12): number[] {
  let v = 100
  return Array.from({ length: len }, (_, i) => {
    const rand = Math.sin(seed * 13 + i * 7.3) * 0.5 + 0.5
    v += (rand - 0.48) * 4 + (isUp ? 0.3 : -0.3)
    return v
  })
}
