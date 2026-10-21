const euros = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})
const eurosAndCents = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' })

/** API money values arrive as decimal strings ("389.00"). Cents show only when there are
 * any, e.g. after a club discount, so every line of a bill adds up exactly. */
export const formatPrice = (value: string | number) => {
  const amount = Number(value)
  return (Number.isInteger(amount) ? euros : eurosAndCents).format(amount)
}

const bedLabels: Record<string, string> = {
  single: 'Single bed',
  double: 'Double bed',
  queen: 'Queen-size bed',
  king: 'King-size bed',
}

export const formatBed = (bedType: string) => bedLabels[bedType] ?? bedType

export const formatGuests = (count: number) => `${count} ${count === 1 ? 'guest' : 'guests'}`
