export const LEAD_STATUS_OPTIONS = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'not-qualified', label: 'Not Qualified' },
    { value: 'closed', label: 'Closed' },
    { value: 'converted', label: 'Converted' }
];

const LEAD_STATUS_LABELS = LEAD_STATUS_OPTIONS.reduce<Record<string, string>>(
    (acc, option) => {
        acc[option.value] = option.label;
        return acc;
    },
    {}
);

export function getLeadStatusOptions() {
    return LEAD_STATUS_OPTIONS;
}

export function getLeadStatusLabel(status?: string | null): string | undefined {
    if (!status) return undefined;
    return LEAD_STATUS_LABELS[status] || status;
}

export function getAvailableLeadStatusOptions(status?: string | null) {
    const blockedValues = new Set(['converted']);

    if (status === 'open' || status == null) {
        blockedValues.add('open');
    }

    if (status === 'in-progress') {
        blockedValues.add('open');
        blockedValues.add('in-progress');
    }

    if (status === 'not-qualified') {
        blockedValues.add('open');
        blockedValues.add('in-progress');
        blockedValues.add('not-qualified');
    }

    if (
        status === 'closed' ||
        status === 'converted' ||
        status === 'migrated'
    ) {
        return [];
    }

    return LEAD_STATUS_OPTIONS.filter(
        (option) => !blockedValues.has(option.value)
    );
}
