import { ButtonLink } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { usePageTitle } from '@/hooks/usePageTitle'
import { sketch } from '@/lib/sketch'

export function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <section
      className="grid min-h-[70svh] place-items-center sketch-bg py-24 text-center"
      style={sketch('/images/home/about-bg.jpg')}
    >
      <div className="container-site flex flex-col items-center gap-5">
        <Eyebrow>Error 404</Eyebrow>
        <h1 className="text-heading text-ink">Lost at sea</h1>
        <p className="max-w-[380px]">
          The page you are looking for has drifted away. Let’s get you back to shore.
        </p>
        <ButtonLink to="/" variant="sage">
          Back to Home
        </ButtonLink>
      </div>
    </section>
  )
}
