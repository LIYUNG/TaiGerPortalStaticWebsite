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

export function getLeadStatusLabel(status?: string | null) {
    if (!status) return 'N/A';
    return LEAD_STATUS_LABELS[status] || status;
}
