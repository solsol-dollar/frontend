import { useCountUp } from "../hooks/useCountUp";
import { ZONE_COLORS } from "../constants";

interface Props {
  ratios: [number, number, number];
  amount: number;
  message: string;
}

export function DonutGauge({ ratios, amount, message }: Props) {
  const progress = useCountUp(1, 900);

  const stops: string[] = [];
  let acc = 0;
  const GAP = 0.5;
  ratios.forEach((ratio, i) => {
    const start = (acc * progress) / 2;
    const end = ((acc + ratio) * progress) / 2;
    const gapStart = i === 0 ? 0 : GAP / 2;
    const gapEnd = i === ratios.length - 1 ? 0 : GAP / 2;
    stops.push(`white ${start}% ${start + gapStart}%`);
    stops.push(`${ZONE_COLORS[i]} ${start + gapStart}% ${end - gapEnd}%`);
    stops.push(`white ${end - gapEnd}% ${end}%`);
    acc += ratio;
  });

  return (
    <div className="relative w-56 h-28 mx-auto overflow-hidden">
      <div
        className="absolute top-0 left-0 w-56 h-56 rounded-full"
        style={{
          background: `conic-gradient(from -90deg, ${stops.join(", ")})`,
        }}
      />
      <div className="absolute top-4 left-4 w-[192px] h-[192px] rounded-full bg-white" />

      <div className="absolute inset-x-0 top-14 flex flex-col items-center justify-center text-center">
        <p className="text-xl font-bold text-text-primary">
          $
          {amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          <span className="text-sm font-medium text-text-tertiary"> 가</span>
        </p>
        <p className="text-lg font-bold text-primary">{message}</p>
      </div>
    </div>
  );
}
