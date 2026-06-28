import type { AllocationItem, DestinationType } from '../types/returnPlan'

const DEST_TYPES: DestinationType[] = ['SECURITIES', 'SAVINGS', 'DEPOSIT']

/**
 * activeTypes: 실제 연동된 계좌 타입 배열 (순서대로)
 * ratios: 각 계좌에 대한 비율 (합 = 100)
 * 연동되지 않은 계좌는 ratio 0으로 채워 항상 3개를 서버에 보낸다.
 */
export function ratiosToAllocationItems(
  activeTypes: DestinationType[],
  ratios: number[],
): AllocationItem[] {
  const round5 = (n: number) => Math.round(n / 5) * 5
  const map = new Map<DestinationType, number>()
  activeTypes.forEach((type, i) => map.set(type, round5(ratios[i] ?? 0)))

  // 합이 100이 되도록 첫 번째 타입에서 오차 보정
  const sum = Array.from(map.values()).reduce((a, b) => a + b, 0)
  if (sum !== 100 && activeTypes[0]) {
    map.set(activeTypes[0], (map.get(activeTypes[0]) ?? 0) + (100 - sum))
  }

  return DEST_TYPES.map((type) => ({
    destinationType: type,
    ratio: map.get(type) ?? 0,
  }))
}

/** 레거시 호환용 (3계좌 고정 splits → AllocationItems) */
export function splitsToAllocationItems([a, b]: [number, number]): AllocationItem[] {
  const round5 = (n: number) => Math.round(n / 5) * 5
  const securities = round5(a)
  const fxSavings = round5(b) - securities
  const fxAccount = 100 - securities - fxSavings

  return [
    { destinationType: 'SECURITIES', ratio: securities },
    { destinationType: 'SAVINGS', ratio: fxSavings },
    { destinationType: 'DEPOSIT', ratio: fxAccount },
  ]
}

export function allocationItemsToSplits(allocations: AllocationItem[]): [number, number] {
  const ratioOf = (type: DestinationType) =>
    allocations.find((a) => a.destinationType === type)?.ratio ?? 0
  const securities = ratioOf('SECURITIES')
  const fxSavings = ratioOf('SAVINGS')
  return [securities, securities + fxSavings]
}
