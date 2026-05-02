export const sanitizeInternalPath = (value: string | null): string | null => {
    if (!value) {
        return null;
    }

    if (
        value.startsWith('//') ||
        value.includes('://') ||
        value.includes('\\')
    ) {
        return null;
    }

    return value.startsWith('/') ? value : `/${value}`;
};

export const getPostLoginRedirectPath = (
    searchParams: URLSearchParams
): string | null => {
    return (
        sanitizeInternalPath(searchParams.get('state')) ??
        sanitizeInternalPath(searchParams.get('p'))
    );
};
