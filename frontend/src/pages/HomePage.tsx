import { About } from '@/components/sections/About'
import { BookingBar } from '@/components/sections/BookingBar'
import { CtaBand } from '@/components/sections/CtaBand'
import { Experiences } from '@/components/sections/Experiences'
import { Faq } from '@/components/sections/Faq'
import { GalleryCollage } from '@/components/sections/GalleryCollage'
import { PageHero } from '@/components/sections/PageHero'
import { Reviews } from '@/components/sections/Reviews'
import { RoomsShowcase } from '@/components/sections/RoomsShowcase'
import { ButtonLink } from '@/components/ui/Button'
import { usePageTitle } from '@/hooks/usePageTitle'

export function HomePage() {
  usePageTitle()

  return (
    <>
      <PageHero
        image="/images/home/hero.jpg"
        eyebrow="Welcome to Isla Blanca"
        title={
          <>
            Experience
            <br /> Timeless Luxury
          </>
        }
        text="Where elegance meets the island. A sanctuary of calm, exceptional service and unforgettable sunsets."
        actions={
          <ButtonLink to="/rooms" variant="ghost">
            Discover Rooms
          </ButtonLink>
        }
        footer={<BookingBar />}
      />
      <About />
      <CtaBand />
      <RoomsShowcase />
      <Experiences />
      <GalleryCollage />
      <Reviews />
      <Faq />
    </>
  )
}
