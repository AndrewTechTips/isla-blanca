/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full API base URL in production, e.g. https://isla-blanca-api.onrender.com/api/v1 */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
