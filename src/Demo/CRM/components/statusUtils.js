// Shared CRM deal status utilities

export const STATUS_FLOW = ['initiated', 'sent', 'signed', 'closed'];

export const isTerminalStatus = (status) =>
    status === 'closed' || status === 'canceled';

export const getStatusColor = (status) =>
    ({
        initiated: 'info',
        sent: 'warning',
        signed: 'success',
        closed: 'default',
        canceled: 'error'
    })[status] || 'default';

export const getDealId = (deal) =>
    deal?.id ?? deal?.dealId ?? deal?._id ?? deal?.uuid;
