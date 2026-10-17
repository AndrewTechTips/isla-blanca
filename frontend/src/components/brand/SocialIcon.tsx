/** Brand marks drawn as simple outlines (lucide no longer ships brand logos). */
export function SocialIcon({ name, className }: { name: string; className?: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  }

  switch (name) {
    case 'Instagram':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
      )
    case 'Facebook':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M13.5 21v-7h2.5l.4-3h-2.9V9.3c0-.8.3-1.3 1.4-1.3h1.6V5.4a18 18 0 0 0-2.3-.1c-2.3 0-3.7 1.4-3.7 3.9V11H8v3h2.5v7" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 3c.4 2.6 2.2 4.4 5 4.6" />
        </svg>
      )
  }
}
