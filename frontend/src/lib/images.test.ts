import { describe, expect, it } from 'vitest'

import { photo } from './images'

describe('photo', () => {
  it('offers the WebP copies of a site photo', () => {
    expect(photo('/images/rooms/detail-01.jpg', '50vw')).toEqual({
      src: '/images/rooms/detail-01.jpg',
      srcSet:
        '/images/rooms/detail-01-400.webp 400w, /images/rooms/detail-01-800.webp 800w, ' +
        '/images/rooms/detail-01-1200.webp 1200w, /images/rooms/detail-01-1600.webp 1600w',
      sizes: '50vw',
      decoding: 'async',
    })
  })

  it('leaves other images alone', () => {
    expect(photo('https://example.com/room.jpg')).toEqual({
      src: 'https://example.com/room.jpg',
      decoding: 'async',
    })
    expect(photo('/images/home/about-video-poster.webp')).toEqual({
      src: '/images/home/about-video-poster.webp',
      decoding: 'async',
    })
    expect(photo('/images/tour/panorama-360.jpg')).toEqual({
      src: '/images/tour/panorama-360.jpg',
      decoding: 'async',
    })
    expect(photo('/images/tour/panorama-360-small.jpg')).toHaveProperty('srcSet')
  })
})
