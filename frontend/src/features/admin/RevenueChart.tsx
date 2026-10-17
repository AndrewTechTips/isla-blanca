import { useState } from 'react'

import type { DashboardStats } from '@/lib/api/types'
import { formatPrice } from '@/lib/format'

type Month = DashboardStats['revenue_by_month'][number]

const HEIGHT = 220
const BAR_MAX = 24
const BAR_COLOR = '#6f7f73' // sage: passes 3:1 against the white card (gold does not)

const monthLabel = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short' })

/** Rounds the axis maximum up to a clean step: 4,186 → 5,000. */
function niceMax(value: number) {
  if (value <= 0) return 1000
  const magnitude = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / magnitude) * magnitude
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

/**
 * Revenue per month as columns. One series, so no legend: the card title names it.
 * Only the latest month carries a value label; hover any column for its numbers.
 */
export function RevenueChart({ data }: { data: Month[] }) {
  const [active, setActive] = useState<number | null>(null)
  if (data.length === 0) return <p className="text-sm">No revenue recorded yet.</p>

  const max = niceMax(Math.max(...data.map((m) => Number(m.revenue))))
  const ticks = [0, max / 2, max]
  const latest = data.length - 1

  return (
    <figure className="space-y-3">
      <div className="relative flex gap-3" style={{ height: HEIGHT }}>
        <div className="flex flex-col-reverse justify-between pb-6 text-right text-xs text-ink-soft">
          {ticks.map((tick) => (
            <span key={tick} className="-translate-y-1/2 leading-none first:translate-y-1/2">
              €{compact.format(tick)}
            </span>
          ))}
        </div>
        <div className="relative flex flex-1 flex-col">
          {/* Hairline grid: recessive, solid, one step off the surface. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
            {ticks.map((tick) => (
              <div key={tick} className="h-px bg-ink/10" />
            ))}
          </div>
          <div className="relative flex flex-1 items-end">
            {data.map((month, index) => {
              const height = (Number(month.revenue) / max) * 100
              return (
                <div
                  key={month.month}
                  className="relative flex h-full flex-1 cursor-default items-end justify-center"
                  onMouseEnter={() => setActive(index)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                  aria-label={`${monthLabel(month.month)}: ${formatPrice(month.revenue)}, ${month.bookings} bookings`}
                >
                  {index === latest && (
                    <span
                      className="absolute text-xs font-semibold text-ink"
                      style={{ bottom: `calc(${height}% + 6px)` }}
                    >
                      {formatPrice(month.revenue)}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t-[4px] transition-opacity"
                    style={{
                      maxWidth: BAR_MAX,
                      height: `${height}%`,
                      background: BAR_COLOR,
                      opacity: active === null || active === index ? 1 : 0.55,
                    }}
                  />
                  {active === index && (
                    <div
                      role="tooltip"
                      className="absolute z-10 rounded-[5px] bg-forest px-3 py-2 text-xs whitespace-nowrap text-cream shadow-lg"
                      style={{ bottom: `calc(${height}% + 28px)` }}
                    >
                      <p className="font-semibold">{monthLabel(month.month)}</p>
                      <p>{formatPrice(month.revenue)}</p>
                      <p className="text-sand/80">{month.bookings} bookings</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex h-6 items-end border-t border-ink/20">
            {data.map((month) => (
              <span key={month.month} className="flex-1 text-center text-xs text-ink-soft">
                {monthLabel(month.month)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>Revenue by month</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Revenue</th>
            <th>Bookings</th>
          </tr>
        </thead>
        <tbody>
          {data.map((month) => (
            <tr key={month.month}>
              <td>{month.month}</td>
              <td>{formatPrice(month.revenue)}</td>
              <td>{month.bookings}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
