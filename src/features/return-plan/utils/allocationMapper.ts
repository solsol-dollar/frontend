import type { AllocationItem, DestinationType } from '../types/returnPlan'

/** AllocationSplitEditor가 다루는 [a, b] 2-cutpoint 구간을 서버가 요구하는 3개 비율로 변환 (5단위 스냅). */
export function splitsToAllocationItems([a, b]: [number, number]): AllocationItem[] {
  const round5 = (n: number) => Math.round(n / 5) * 5
  const securities = round5(a)
  const fxSavings = round5(b) - securities
  const fxAccount = 100 - securities - fxSavings

  return [
    { destinationType: 'SECURITIES', ratio: securities },
    { destinationType: 'FX_SAVINGS', ratio: fxSavings },
    { destinationType: 'FX_ACCOUNT', ratio: fxAccount },
  ]
}

export function allocationItemsToSplits(allocations: AllocationItem[]): [number, number] {
  const ratioOf = (type: DestinationType) =>
    allocations.find((a) => a.destinationType === type)?.ratio ?? 0
  const securities = ratioOf('SECURITIES')
  const fxSavings = ratioOf('FX_SAVINGS')
  return [securities, securities + fxSavings]
}
