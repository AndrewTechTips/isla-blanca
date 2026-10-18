import { motion } from 'motion/react'

import { GalleryCollage } from '@/components/sections/GalleryCollage'
import { galleryImages } from '@/data/content'
import { usePageTitle } from '@/hooks/usePageTitle'
import { photo } from '@/lib/images'
import { inViewOnce, spring } from '@/lib/motion'

const moreImages = [
  { src: '/images/gallery/gallery-06.jpg', alt: 'Spa treatment room open to the sea' },
  { src: '/images/rooms/infinity-pool-villa.jpg', alt: 'Infinity Pool Villa' },
  { src: '/images/rooms/detail-01.jpg', alt: 'Suite bathroom with a freestanding tub' },
  { src: '/images/rooms/executive-ocean-residence.jpg', alt: 'Executive Ocean Residence' },
  { src: '/images/rooms/detail-02.jpg', alt: 'Kitchenette in a garden suite' },
  { src: '/images/rooms/detail-03.jpg', alt: 'Lounge with a sea view' },
]

export function GalleryPage() {
  usePageTitle('Gallery')

  return (
    <>
      <GalleryCollage images={galleryImages} headingLevel="h1" />
      <section className="bg-cream pb-16 lg:pb-40">
        <ul className="container-site columns-1 gap-4 sm:columns-2 lg:columns-3">
          {moreImages.map((image, index) => (
            <motion.li
              key={image.src}
              className="mb-4 break-inside-avoid overflow-hidden rounded-lg"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inViewOnce}
              transition={spring(1.5, 0.2, (index % 3) * 0.15)}
            >
              <img
                {...photo(image.src, '(min-width: 1200px) 33vw, (min-width: 640px) 50vw, 100vw')}
                alt={image.alt}
                loading="lazy"
                className="w-full"
              />
            </motion.li>
          ))}
        </ul>
      </section>
    </>
  )
}
