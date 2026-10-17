import { createBrowserRouter } from 'react-router'

import { RootLayout, type RouteHandle } from '@/components/layout/RootLayout'
import { HomePage } from '@/pages/HomePage'

const filledNavbar: RouteHandle = { navbar: 'filled' }

// The home page ships with the first load; every other page is its own chunk,
// downloaded the first time someone opens it.
export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { index: true, element: <HomePage /> },
        {
          path: 'rooms',
          handle: filledNavbar,
          lazy: () => import('@/pages/RoomsPage').then((m) => ({ Component: m.RoomsPage })),
        },
        {
          path: 'rooms/:slug',
          lazy: () =>
            import('@/pages/RoomDetailPage').then((m) => ({ Component: m.RoomDetailPage })),
        },
        {
          path: 'services',
          lazy: () => import('@/pages/ServicesPage').then((m) => ({ Component: m.ServicesPage })),
        },
        {
          path: 'gallery',
          handle: filledNavbar,
          lazy: () => import('@/pages/GalleryPage').then((m) => ({ Component: m.GalleryPage })),
        },
        {
          path: 'contact',
          lazy: () => import('@/pages/ContactPage').then((m) => ({ Component: m.ContactPage })),
        },
        {
          path: '*',
          handle: filledNavbar,
          lazy: () => import('@/pages/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })),
        },
      ],
    },
  ],
  // Serves the app from a sub-path on GitHub Pages (Vite's `base`).
  { basename: import.meta.env.BASE_URL },
)
