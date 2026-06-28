import { cn } from '@/lib/utils'

interface Milestone {
  label: string
  date: string
}

interface IpoOfferingInfoProps {
  offeringPrice: string
  offeringShares?: string
  milestones: Milestone[]
  footnote?: string
}

function parseMilestoneDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('.').map(Number)
  return new Date(year, month - 1, day)
}

export function IpoOfferingInfo({
  offeringPrice,
  offeringShares,
  milestones,
  footnote,
}: IpoOfferingInfoProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const activeFlags = milestones.map((m) => today >= parseMilestoneDate(m.date))
  const allActive = activeFlags.every(Boolean)
  const lastActiveIndex = activeFlags.reduce((acc, flag, i) => (flag ? i : acc), -1)
  const pulseIndex = allActive ? -1 : lastActiveIndex === -1 ? 0 : lastActiveIndex

  return (
    <>
      <style>{`
        @keyframes milestone-pulse {
          0% { box-shadow: 0 0 0 0 rgba(9, 34, 172, 0.6); }
          70% { box-shadow: 0 0 0 8px rgba(9, 34, 172, 0); }
          100% { box-shadow: 0 0 0 0 rgba(9, 34, 172, 0); }
        }
        .milestone-pulse { animation: milestone-pulse 1.6s ease-out infinite; }
      `}</style>
      <div className="space-y-[14px]">
        <div className="flex items-center">
          <span className="text-sm text-text-secondary w-24 flex-shrink-0">공모(예정)가</span>
          <span className="text-base font-semibold text-text-primary">{offeringPrice}</span>
        </div>
        {offeringShares && (
          <div className="flex items-center">
            <span className="text-sm text-text-secondary w-24 flex-shrink-0">공모주식수</span>
            <span className="text-base font-semibold text-text-primary">{offeringShares}</span>
          </div>
        )}

        <div className="flex items-start">
          <span className="text-sm text-text-secondary w-24 flex-shrink-0 pt-0.5">청약일정</span>
          <div className="flex-1">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-[9px] h-[9px] rounded-full flex-shrink-0 mt-[6px]',
                      activeFlags[i] ? 'bg-primary' : 'bg-text-tertiary',
                      i === pulseIndex && 'milestone-pulse',
                    )}
                  />
                  {i < milestones.length - 1 && (
                    <div
                      className={cn(
                        'w-px flex-1 mt-1',
                        activeFlags[i] && activeFlags[i + 1] ? 'bg-primary' : 'bg-[#C8CAD0]',
                      )}
                    />
                  )}
                </div>
                <p
                  className={cn(
                    'text-sm pb-4 leading-5 pt-[1px]',
                    activeFlags[i] ? 'font-semibold text-text-primary' : 'text-text-tertiary',
                  )}
                >
                  {m.date} {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {footnote && <p className="text-[11px] text-text-tertiary text-right mt-3 mb-[-8px] mr-[-8px]">{footnote}</p>}
    </>
  )
}
