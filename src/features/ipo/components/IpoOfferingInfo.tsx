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

const today = new Date()
today.setHours(0, 0, 0, 0)

export function IpoOfferingInfo({
  offeringPrice,
  offeringShares,
  milestones,
  footnote,
}: IpoOfferingInfoProps) {
  const activeFlags = milestones.map((m) => today >= parseMilestoneDate(m.date))

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center">
          <span className="text-sm text-text-secondary w-24 flex-shrink-0">공모(예정)가</span>
          <span className="text-sm font-semibold text-text-primary">{offeringPrice}</span>
        </div>
        {offeringShares && (
          <div className="flex items-center">
            <span className="text-sm text-text-secondary w-24 flex-shrink-0">공모주식수</span>
            <span className="text-sm font-semibold text-text-primary">{offeringShares}</span>
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
                      'w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5',
                      activeFlags[i] ? 'bg-primary' : 'border-2 border-border bg-white',
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
                    'text-sm pb-4 leading-5',
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

      {footnote && <p className="text-xs text-text-tertiary text-right mt-3">{footnote}</p>}
    </>
  )
}
