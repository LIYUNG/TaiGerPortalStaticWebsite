/**
 * Jest mock for src/env.ts – uses only process.env (no import.meta).
 * Real env.ts uses import.meta.env in Vite, which Jest cannot parse.
 */
const env = typeof process !== 'undefined' ? process.env : ({} as NodeJS.ProcessEnv);

export const isDev =
    env.MODE === 'development' ||
    env.NODE_ENV === 'development' ||
    (!env.NODE_ENV && !env.MODE);

export const baseUrl = isDev ? env.VITE_DEV_URL : env.VITE_PROD_URL;
export const tenantId = isDev ? env.VITE_DEV_TENANT_ID : env.VITE_TENANT_ID;
export const publicUrl =
    (env as Record<string, string | undefined>).VITE_PUBLIC_URL ??
    (env as Record<string, string | undefined>).BASE_URL ??
    '';

export const googleOAuthClientId = env.VITE_GOOGLE_OAUTH_CLIENT_ID;
export const googleOAuthRedirectUrl = env.VITE_GOOGLE_OAUTH_REDIRECT_URL;
