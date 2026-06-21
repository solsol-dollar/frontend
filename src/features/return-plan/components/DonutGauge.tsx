import { useCountUp } from '../hooks/useCountUp'

export const ZONE_COLORS = ['#4F46E5', '#7C3AED', '#0D9488']

interface Props {
  ratios: [number, number, number]
  amount: number
  message: string
}

export function DonutGauge({ ratios, amount, message }: Props) {
  // 도넛이 0%에서 실제 비율까지 채워지는 애니메이션
  const progress = useCountUp(1, 900)

  // 반원만 보여지므로(상단 절반 = 전체 원의 0~50%), 데이터 비율(0~100%)을 0~50% 구간에 매핑
  const stops: string[] = []
  let acc = 0
  ratios.forEach((ratio, i) => {
    stops.push(`${ZONE_COLORS[i]} ${(acc * progress) / 2}% ${((acc + ratio) * progress) / 2}%`)
    acc += ratio
  })

  return (
    <div className="relative w-56 h-28 mx-auto overflow-hidden">
      <div
        className="absolute top-0 left-0 w-56 h-56 rounded-full"
        style={{ background: `conic-gradient(from -90deg, ${stops.join(', ')})` }}
      />
      <div className="absolute top-6 left-6 w-[176px] h-[176px] rounded-full bg-white" />

      <div className="absolute inset-x-0 bottom-0 text-center pb-1">
        <p className="text-xl font-bold text-text-primary">
          ${amount.toLocaleString('en-US')}.00
          <span className="text-sm font-medium text-text-tertiary"> 가</span>
        </p>
        <p className="text-lg font-bold text-primary">{message}</p>
      </div>
    </div>
  )
}
