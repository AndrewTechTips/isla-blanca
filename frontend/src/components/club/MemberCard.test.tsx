import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MemberCard } from './MemberCard'

describe('MemberCard', () => {
  it('prints the guest, their tier and their number in two groups', () => {
    render(<MemberCard tier="gold" name="Sofia Carter" number="20260002" since="2026" />)

    expect(
      screen.getByRole('img', {
        name: 'Isla Blanca Club Gold card for Sofia Carter, member number 20260002',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('2026 0002')).toBeInTheDocument()
    expect(screen.getByText('Since 2026')).toBeInTheDocument()
  })

  it('shows a placeholder name on the showcase cards', () => {
    render(<MemberCard tier="platinum" interactive={false} />)

    expect(screen.getByText('Your Name')).toBeInTheDocument()
    expect(screen.getByText('Platinum')).toBeInTheDocument()
  })
})
