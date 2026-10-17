export const site = {
  name: 'Isla Blanca',
  tagline: 'Luxury stays, quiet sunsets and the true spirit of Ibiza.',
  location: 'Ibiza, Spain',
  address: ['Camí de Sa Caleta 12', '07829 Sant Josep de sa Talaia', 'Ibiza, Spain'],
  phone: '+34 971 555 120',
  email: 'hello@islablanca.es',
  website: 'www.islablanca.es',
  mapQuery: 'Sant Josep de sa Talaia, Ibiza',
  credit: {
    label: 'Design based on Aurelia by Slashdown',
    url: 'https://www.framer.com/@slashdown/',
  },
}

export const navigation = [
  { label: 'Home', to: '/' },
  { label: 'Rooms', to: '/rooms' },
  { label: 'Services', to: '/services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
]

export const socials = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
] as const
