export type SubscriptionStatus = '청약예정' | '청약가능' | '청약종료'

const STATUS_BADGE_CLASS: Record<SubscriptionStatus, string> = {
  청약예정: 'border-warning text-warning',
  청약가능: 'border-primary text-primary',
  청약종료: 'border-border text-text-secondary',
}

const STATUS_TEXT_CLASS: Record<SubscriptionStatus, string> = {
  청약예정: 'text-warning',
  청약가능: 'text-primary',
  청약종료: 'text-text-secondary',
}

function parseMilestoneDate(str: string): Date {
  return new Date(str.replace(/\./g, '-'))
}

export function getSubscriptionStatus(
  milestones: { label: string; date: string }[],
): SubscriptionStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = parseMilestoneDate(milestones[0].date)
  const end = parseMilestoneDate(milestones[1].date)
  if (today < start) return '청약예정'
  if (today <= end) return '청약가능'
  return '청약종료'
}

export function getSubscriptionDday(milestones: { label: string; date: string }[]): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = parseMilestoneDate(milestones[0].date)
  const end = parseMilestoneDate(milestones[1].date)
  const target = today < start ? start : end
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'D-Day'
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`
}

export function getSubscriptionStatusBadgeClass(status: SubscriptionStatus): string {
  return STATUS_BADGE_CLASS[status]
}

export function getSubscriptionStatusTextClass(status: SubscriptionStatus): string {
  return STATUS_TEXT_CLASS[status]
}
