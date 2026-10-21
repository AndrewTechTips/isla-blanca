import { motion, type MotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

import { Eyebrow } from '@/components/ui/Eyebrow'
import { galleryImages } from '@/data/content'
import { cn } from '@/lib/cn'
import { photo } from '@/lib/images'
import { sketch } from '@/lib/sketch'

/** Where each photo starts before the section scrolls into place. */
const scatter = [
  { rotate: -10, scale: 0.5, x: -30, y: -121 },
  { rotate: 10, scale: 0.5, x: 20, y: -122 },
  { rotate: 30, scale: 0.6, x: -10, y: -121 },
  { rotate: 10, scale: 0.3, x: -40, y: 69 },
  { rotate: -10, scale: 0.4, x: 0, y: 79 },
]

const layout = [
  'lg:col-span-2 lg:row-span-2 aspect-[4/3] lg:aspect-auto',
  'aspect-[4/3]',
  'aspect-[4/3]',
  'aspect-[4/3]',
  'aspect-[4/3]',
]

function CollagePhoto({
  src,
  alt,
  index,
  progress,
}: {
  src: string
  alt: string
  index: number
  progress: MotionValue<number>
}) {
  const start = scatter[index % scatter.length]
  const reduceMotion = useReducedMotion()
  // Progress 0.5 is the grid's centre at the screen's centre: the photos settle there and hold.
  // One `transform` (and opacity) lets Motion run this on the browser's scroll timeline.
  const opacity = useTransform(progress, [0, 0.5], reduceMotion ? [1, 1] : [0.5, 1])
  const transform = useTransform(
    progress,
    [0, 0.5],
    reduceMotion
      ? ['translateX(0px)', 'translateX(0px)']
      : [
          `translateX(${start.x}px) translateY(${start.y}px) rotate(${start.rotate}deg) scale(${start.scale})`,
          'translateX(0px) translateY(0px) rotate(0deg) scale(1)',
        ],
  )

  return (
    <motion.figure
      className={cn('overflow-hidden rounded-lg shadow-xl shadow-black/10', layout[index])}
      style={{ opacity, transform }}
    >
      <img
        {...photo(src, '(min-width: 810px) 40vw, 100vw')}
        alt={alt}
        loading="lazy"
        className="size-full object-cover"
      />
    </motion.figure>
  )
}

interface GalleryCollageProps {
  images?: { src: string; alt: string }[]
  headingLevel?: 'h1' | 'h2'
}

export function GalleryCollage({
  images = galleryImages,
  headingLevel = 'h2',
}: GalleryCollageProps) {
  const ref = useRef<HTMLDivElement>(null)
  // 0 when the grid's top enters the viewport, 0.5 when its centre reaches the centre, 1 when it
  // has left: the whole pass, which the browser can track natively (a "cover" view timeline).
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const Heading = headingLevel

  return (
    // `overflow-clip`, not `overflow-hidden`: it crops the scattered photos the same way, but a
    // hidden overflow makes the section a scroll container, and the photos' native scroll
    // timeline would then follow the section (which never scrolls) instead of the page.
    <section
      className="overflow-clip bg-cream sketch-bg section-y"
      style={sketch('/images/home/gallery-section-bg.jpg')}
    >
      <div className="container-site space-y-12">
        <div className="mx-auto flex max-w-[520px] flex-col items-center gap-4 text-center">
          <Eyebrow>Highlights</Eyebrow>
          <Heading className="text-heading text-ink">A Glimpse of Isla Blanca</Heading>
          <p>
            Whitewashed architecture, Mediterranean light and the sea in every view come together in
            a place unlike any other.
          </p>
        </div>
        <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {images.slice(0, 5).map((image, index) => (
            <CollagePhoto key={image.src} {...image} index={index} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  )
}
