/**
 * Where the site is served from: "/" locally and in Docker, "/isla-blanca/" on GitHub Pages
 * (Vite's `base`, set by VITE_BASE at build time).
 */
const BASE = import.meta.env.BASE_URL

/**
 * Files in public/ are referred to from the site root ("/images/rooms/x.jpg"), in the code and
 * in the database. This adds the base path so they also load when the site lives in a folder.
 * Full URLs (https://…, //cdn…) are returned unchanged.
 */
export const asset = (path: string) =>
  path.startsWith('/') && !path.startsWith('//') ? BASE + path.slice(1) : path
