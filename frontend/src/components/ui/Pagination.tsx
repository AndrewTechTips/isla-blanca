import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pages: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, pages, total, onChange }: PaginationProps) {
  if (pages <= 1) return null
  const button =
    'grid size-9 cursor-pointer place-items-center rounded-[5px] border border-ink/15 bg-white text-ink transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 text-sm">
      <p>
        Page {page} of {pages} · {total} results
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className={button}
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          className={button}
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  )
}
