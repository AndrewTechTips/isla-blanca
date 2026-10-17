/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin in production, e.g. https://isla-blanca-api.onrender.com (no /api/v1). */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
