/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly VITE_DEV_URL: string;
    readonly VITE_PROD_URL: string;
    readonly VITE_DEV_TENANT_ID: string;
    readonly VITE_TENANT_ID: string;
    readonly VITE_GOOGLE_OAUTH_CLIENT_ID: string;
    readonly VITE_GOOGLE_OAUTH_REDIRECT_URL: string;
    readonly VITE_PUBLIC_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
