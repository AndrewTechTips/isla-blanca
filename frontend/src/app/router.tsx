import { createBrowserRouter } from 'react-router'

import { RootLayout, type RouteHandle } from '@/components/layout/RootLayout'
import { PageLoader } from '@/components/ui/PageLoader'
import { GuestOnly, RequireAdmin, RequireAuth } from '@/features/auth/guards'
import { HomePage } from '@/pages/HomePage'

const filledNavbar: RouteHandle = { navbar: 'filled' }

/** Turns `import('./X').then(m => m.X)` into the shape React Router's `lazy` expects. */
const page =
  <M,>(load: () => Promise<M>, pick: (module: M) => React.ComponentType) =>
  () =>
    load().then((module) => ({ Component: pick(module) }))

// The home page ships with the first load; every other page is its own chunk,
// downloaded the first time someone opens it.
export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      // Shown while the first page's code downloads (when the app opens on a lazy route).
      hydrateFallbackElement: <PageLoader className="min-h-svh" />,
      children: [
        { index: true, element: <HomePage /> },
        {
          path: 'rooms',
          handle: filledNavbar,
          lazy: page(
            () => import('@/pages/RoomsPage'),
            (m) => m.RoomsPage,
          ),
        },
        {
          path: 'rooms/:slug',
          lazy: page(
            () => import('@/pages/RoomDetailPage'),
            (m) => m.RoomDetailPage,
          ),
        },
        {
          path: 'services',
          lazy: page(
            () => import('@/pages/ServicesPage'),
            (m) => m.ServicesPage,
          ),
        },
        {
          path: 'gallery',
          handle: filledNavbar,
          lazy: page(
            () => import('@/pages/GalleryPage'),
            (m) => m.GalleryPage,
          ),
        },
        {
          path: 'club',
          lazy: page(
            () => import('@/pages/ClubPage'),
            (m) => m.ClubPage,
          ),
        },
        {
          path: 'contact',
          lazy: page(
            () => import('@/pages/ContactPage'),
            (m) => m.ContactPage,
          ),
        },
        {
          path: 'book/:slug',
          handle: filledNavbar,
          lazy: page(
            () => import('@/features/booking/BookingPage'),
            (m) => m.BookingPage,
          ),
        },

        // Sign in and sign up: skipped when already signed in.
        {
          element: <GuestOnly />,
          children: [
            {
              path: 'login',
              lazy: page(
                () => import('@/features/auth/LoginPage'),
                (m) => m.LoginPage,
              ),
            },
            {
              path: 'register',
              lazy: page(
                () => import('@/features/auth/RegisterPage'),
                (m) => m.RegisterPage,
              ),
            },
          ],
        },

        // Guest area: any signed-in user.
        {
          element: <RequireAuth />,
          handle: filledNavbar,
          children: [
            {
              path: 'account',
              lazy: page(
                () => import('@/features/account/AccountLayout'),
                (m) => m.AccountLayout,
              ),
              children: [
                {
                  index: true,
                  lazy: page(
                    () => import('@/features/account/MyBookingsPage'),
                    (m) => m.MyBookingsPage,
                  ),
                },
                {
                  path: 'bookings/:reference',
                  lazy: page(
                    () => import('@/features/account/BookingDetailPage'),
                    (m) => m.BookingDetailPage,
                  ),
                },
                {
                  path: 'club',
                  lazy: page(
                    () => import('@/features/account/ClubCardPage'),
                    (m) => m.ClubCardPage,
                  ),
                },
                {
                  path: 'profile',
                  lazy: page(
                    () => import('@/features/account/ProfilePage'),
                    (m) => m.ProfilePage,
                  ),
                },
              ],
            },
          ],
        },

        // Staff area: admins only.
        {
          element: <RequireAdmin />,
          handle: filledNavbar,
          children: [
            {
              path: 'admin',
              lazy: page(
                () => import('@/features/admin/AdminLayout'),
                (m) => m.AdminLayout,
              ),
              children: [
                {
                  index: true,
                  lazy: page(
                    () => import('@/features/admin/DashboardPage'),
                    (m) => m.DashboardPage,
                  ),
                },
                {
                  path: 'bookings',
                  lazy: page(
                    () => import('@/features/admin/AdminBookingsPage'),
                    (m) => m.AdminBookingsPage,
                  ),
                },
                {
                  path: 'rooms',
                  lazy: page(
                    () => import('@/features/admin/AdminRoomsPage'),
                    (m) => m.AdminRoomsPage,
                  ),
                },
                {
                  path: 'services',
                  lazy: page(
                    () => import('@/features/admin/AdminServicesPage'),
                    (m) => m.AdminServicesPage,
                  ),
                },
                {
                  path: 'amenities',
                  lazy: page(
                    () => import('@/features/admin/AdminAmenitiesPage'),
                    (m) => m.AdminAmenitiesPage,
                  ),
                },
                {
                  path: 'guests',
                  lazy: page(
                    () => import('@/features/admin/AdminGuestsPage'),
                    (m) => m.AdminGuestsPage,
                  ),
                },
              ],
            },
          ],
        },

        {
          path: '*',
          handle: filledNavbar,
          lazy: page(
            () => import('@/pages/NotFoundPage'),
            (m) => m.NotFoundPage,
          ),
        },
      ],
    },
  ],
  // Serves the app from a sub-path on GitHub Pages (Vite's `base`).
  { basename: import.meta.env.BASE_URL },
)
