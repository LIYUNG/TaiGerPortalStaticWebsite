import type { IApplicationPopulated } from '@taiger-common/model';

/** Form shape for one application’s portal A/B account + password fields */
export type PortalCredentialFields = {
    account_portal_a: string;
    account_portal_b: string;
    password_portal_a: string;
    password_portal_b: string;
};

export const EMPTY_PORTAL_CREDENTIAL_FIELDS: PortalCredentialFields = {
    account_portal_a: '',
    account_portal_b: '',
    password_portal_a: '',
    password_portal_b: ''
};

const TEXT_FIELD_ID_SUFFIXES: {
    suffix: string;
    field: keyof PortalCredentialFields;
}[] = [
    { suffix: '_application_portal_a_account', field: 'account_portal_a' },
    { suffix: '_application_portal_a_password', field: 'password_portal_a' },
    { suffix: '_application_portal_b_account', field: 'account_portal_b' },
    { suffix: '_application_portal_b_password', field: 'password_portal_b' }
];

/**
 * Parses TextField `id` values built as `${applicationId}_application_portal_*_*`.
 */
export function parsePortalCredentialTextFieldId(elementId: string): {
    applicationId: string;
    field: keyof PortalCredentialFields;
} | null {
    for (const { suffix, field } of TEXT_FIELD_ID_SUFFIXES) {
        if (elementId.endsWith(suffix)) {
            return {
                applicationId: elementId.slice(0, -suffix.length),
                field
            };
        }
    }
    return null;
}

export function buildCredentialsFromApplications(
    apps: IApplicationPopulated[] | undefined
): Record<string, PortalCredentialFields> {
    const credentials: Record<string, PortalCredentialFields> = {};
    if (!apps) {
        return credentials;
    }
    for (const application of apps) {
        const applicationId = application._id.toString();
        const portalCredentials = application.portal_credentials;
        credentials[applicationId] = {
            account_portal_a:
                portalCredentials?.application_portal_a?.account ?? '',
            account_portal_b:
                portalCredentials?.application_portal_b?.account ?? '',
            password_portal_a:
                portalCredentials?.application_portal_a?.password ?? '',
            password_portal_b:
                portalCredentials?.application_portal_b?.password ?? ''
        };
    }
    return credentials;
}

export function mergeServerCredentialsWithDelta(
    server: Record<string, PortalCredentialFields>,
    delta: Record<string, Partial<PortalCredentialFields>>
): Record<string, PortalCredentialFields> {
    const ids = new Set([...Object.keys(server), ...Object.keys(delta)]);
    const out: Record<string, PortalCredentialFields> = {};
    for (const id of ids) {
        const base = server[id];
        const patch = delta[id];
        out[id] = {
            account_portal_a:
                patch?.account_portal_a ?? base?.account_portal_a ?? '',
            account_portal_b:
                patch?.account_portal_b ?? base?.account_portal_b ?? '',
            password_portal_a:
                patch?.password_portal_a ?? base?.password_portal_a ?? '',
            password_portal_b:
                patch?.password_portal_b ?? base?.password_portal_b ?? ''
        };
    }
    return out;
}

export function buildBooleanFlagMapForApplications(
    applications: IApplicationPopulated[],
    flagsById: Record<string, boolean | undefined>,
    defaultValue: boolean
): Record<string, boolean> {
    const m: Record<string, boolean> = {};
    for (const app of applications) {
        const id = app._id.toString();
        m[id] = flagsById[id] ?? defaultValue;
    }
    return m;
}
