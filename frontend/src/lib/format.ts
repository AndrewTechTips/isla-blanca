const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

/** API money values arrive as decimal strings ("389.00"). */
export const formatPrice = (value: string | number) => currency.format(Number(value))

const bedLabels: Record<string, string> = {
  single: 'Single bed',
  double: 'Double bed',
  queen: 'Queen-size bed',
  king: 'King-size bed',
}

export const formatBed = (bedType: string) => bedLabels[bedType] ?? bedType

export const formatGuests = (count: number) => `${count} ${count === 1 ? 'guest' : 'guests'}`
