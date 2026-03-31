/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VIEWER_API_BASE_URL: string
  readonly VITE_DEPLOYMENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
