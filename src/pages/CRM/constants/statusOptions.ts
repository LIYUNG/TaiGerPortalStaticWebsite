export const LEAD_STATUS_OPTIONS = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'not-qualified', label: 'Not Qualified' },
    { value: 'closed', label: 'Closed' },
    { value: 'converted', label: 'Converted' }
];

export function getLeadStatusOptions() {
    return LEAD_STATUS_OPTIONS;
}
