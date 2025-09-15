import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button
} from '@mui/material';

import { getCRMLeadsQuery } from '../../../api/query';
import { createCRMDeal, updateCRMDeal } from '../../../api';
import { getCRMSalesReps } from '../../../api';

/**
 * DealModal - Create/Edit Deal Modal
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - deal?: object - If provided, modal will be in edit mode
 * - preselectedLeadId?: string
 * - preselectedSalesUserId?: string
 * - lockLeadSelect?: boolean
 * - lockSalesUserSelect?: boolean
 * - onCreated?: () => Promise<void> | void
 * - onUpdated?: () => Promise<void> | void
 */

const statusValues = ['initiated', 'sent', 'signed', 'closed', 'canceled'];

const DealModal = ({
    open,
    onClose,
    deal = null, // New prop for edit mode
    preselectedLeadId,
    preselectedSalesUserId,
    lockLeadSelect = false,
    lockSalesUserSelect = false,
    onCreated,
    onUpdated // New prop for update callback
}) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const isEditMode = !!deal;
    // Local UI status mirrors selected status for immediate UI updates
    const [uiStatus, setUiStatus] = useState(deal?.status || 'initiated');

    // Helper: format date/time for HTML datetime-local input (YYYY-MM-DDTHH:MM)
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        // Handle both ISO strings and Date objects
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const pad = (n) => String(n).padStart(2, '0');
        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const mi = pad(date.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
    };

    const { data: leadsData } = useQuery({
        ...getCRMLeadsQuery(),
        enabled: open && !isEditMode // Only fetch leads when creating, not editing
    });
    const allLeads = leadsData?.data?.data || [];

    // Fetch sales reps from API
    const { data: salesData } = useQuery({
        queryKey: ['crm/sales-reps'],
        enabled: open && !isEditMode, // Only fetch sales reps when creating, not editing
        queryFn: async () => {
            const res = await getCRMSalesReps();
            return res?.data?.data ?? res?.data ?? [];
        }
    });
    const salesOptions = (salesData || []).map((s) => ({
        userId: s.userId || s.value,
        label:
            s.label ||
            s.name ||
            s.fullName ||
            t('common.unknown', { ns: 'crm' })
    }));

    // TanStack Form instance
    const form = useForm({
        defaultValues: {
            leadId: deal?.leadId || preselectedLeadId || '',
            salesUserId: deal?.salesUserId || preselectedSalesUserId || '',
            dealSizeNtd: deal?.dealSizeNtd || '',
            status: deal?.status || 'initiated',
            note: deal?.note || '',
            initiatedAt: formatDateForInput(deal?.initiatedAt) || '',
            sentAt: formatDateForInput(deal?.sentAt) || '',
            signedAt: formatDateForInput(deal?.signedAt) || '',
            closedAt: formatDateForInput(deal?.closedAt) || ''
        },
        onSubmit: async ({ value }) => {
            await handleSubmitWithValues(value);
        }
    });

    const [errors, setErrors] = useState({});
    // Snapshot of initial values to compute diffs for update
    const initialRef = useRef(null);

    useEffect(() => {
        if (open) {
            if (isEditMode && deal) {
                // Pre-populate form with deal data for edit mode
                const init = {
                    leadId: deal.leadId,
                    salesUserId: deal.salesUserId,
                    dealSizeNtd: deal.dealSizeNtd || null,
                    status: deal.status || 'initiated',
                    note: deal.note || null,
                    initiatedAt: formatDateForInput(deal.initiatedAt) || null,
                    sentAt: formatDateForInput(deal.sentAt) || null,
                    signedAt: formatDateForInput(deal.signedAt) || null,
                    closedAt: formatDateForInput(deal.closedAt) || null
                };
                form.reset(init);
                initialRef.current = init;
                setUiStatus(init.status || 'initiated');
            } else {
                // Reset for create mode with explicit defaults
                const init = {
                    leadId: preselectedLeadId || '',
                    salesUserId: preselectedSalesUserId || '',
                    dealSizeNtd: '',
                    status: 'initiated',
                    note: '',
                    initiatedAt: '',
                    sentAt: '',
                    signedAt: '',
                    closedAt: ''
                };
                form.reset(init);
                initialRef.current = init;
                setUiStatus('initiated');
            }
            setErrors({});
        }
    }, [open, preselectedLeadId, preselectedSalesUserId, deal, isEditMode]);

    const resetForm = () => {
        if (isEditMode && deal) {
            // Reset to original deal data in edit mode
            const init = {
                leadId: deal.leadId,
                salesUserId: deal.salesUserId,
                dealSizeNtd: deal.dealSizeNtd || '',
                status: deal.status || 'initiated',
                note: deal.note || '',
                initiatedAt: formatDateForInput(deal.initiatedAt) || '',
                sentAt: formatDateForInput(deal.sentAt) || '',
                signedAt: formatDateForInput(deal.signedAt) || '',
                closedAt: formatDateForInput(deal.closedAt) || ''
            };
            form.reset(init);
            initialRef.current = init;
            setUiStatus(init.status || 'initiated');
        } else {
            // Reset to create mode defaults
            form.reset({
                leadId: preselectedLeadId || '',
                salesUserId: preselectedSalesUserId || '',
                dealSizeNtd: '',
                status: 'initiated',
                note: '',
                initiatedAt: '',
                sentAt: '',
                signedAt: '',
                closedAt: ''
            });
            initialRef.current = {
                leadId: preselectedLeadId || '',
                salesUserId: preselectedSalesUserId || '',
                dealSizeNtd: '',
                status: 'initiated',
                note: '',
                initiatedAt: '',
                sentAt: '',
                signedAt: '',
                closedAt: ''
            };
            setUiStatus('initiated');
        }
        setErrors({});
    };

    const handleCancel = () => {
        resetForm();
        onClose?.();
    };
    const toIso = (v) => {
        if (!v) return undefined;
        const d = new Date(v);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
    };

    const handleSubmitWithValues = async (values) => {
        const newErrors = {};

        // Only validate leadId and salesUserId in create mode
        if (!isEditMode) {
            if (!values.leadId)
                newErrors.leadId = t('deals.leadIsRequired', { ns: 'crm' });
            if (!values.salesUserId)
                newErrors.salesUserId = t('deals.salesRepIsRequired', {
                    ns: 'crm'
                });
        }

        if (!values.dealSizeNtd || Number(values.dealSizeNtd) <= 0)
            newErrors.dealSizeNtd = t('deals.mustBePositive', { ns: 'crm' });
        if (values.status === 'closed' && !values.closedAt)
            newErrors.closedAt = t('deals.closedAtRequired', { ns: 'crm' });

        setErrors(newErrors);
        if (Object.keys(newErrors).length) return;
        const payloadCreate = {
            leadId: values.leadId,
            salesUserId: values.salesUserId,
            dealSizeNtd: Number(values.dealSizeNtd),
            status: values.status,
            note: values.note || undefined,
            initiatedAt: toIso(values.initiatedAt),
            sentAt: toIso(values.sentAt),
            signedAt: toIso(values.signedAt),
            closedAt:
                values.status === 'closed' ? toIso(values.closedAt) : undefined
        };

        try {
            if (isEditMode) {
                // Update existing deal: send full payload (no diff)
                const isoOrNull = (v) =>
                    v === '' || v == null ? null : (toIso(v) ?? null);
                const payloadUpdate = {
                    leadId: values.leadId,
                    salesUserId: values.salesUserId,
                    dealSizeNtd:
                        values.dealSizeNtd === ''
                            ? null
                            : Number(values.dealSizeNtd),
                    status: values.status,
                    note: values.note ?? '',
                    initiatedAt: isoOrNull(values.initiatedAt),
                    sentAt: isoOrNull(values.sentAt),
                    signedAt: isoOrNull(values.signedAt),
                    closedAt: isoOrNull(values.closedAt)
                };
                await updateCRMDeal(deal.id, payloadUpdate);
                await queryClient.invalidateQueries({
                    queryKey: ['crm/deals']
                });
                if (values.leadId) {
                    await queryClient.invalidateQueries({
                        queryKey: ['crm/lead', values.leadId]
                    });
                }
                if (onUpdated) await onUpdated();
            } else {
                // Create new deal
                await createCRMDeal(payloadCreate);
                await queryClient.invalidateQueries({
                    queryKey: ['crm/deals']
                });
                if (values.leadId) {
                    await queryClient.invalidateQueries({
                        queryKey: ['crm/lead', values.leadId]
                    });
                }
                if (onCreated) await onCreated();
            }
            resetForm();
            onClose?.();
        } catch (e) {
            console.error(e);
        }
    };

    // Determine which datetime fields are editable based on status order (edit mode only)
    const currentStatus = uiStatus;
    const statusIndex = statusValues.indexOf(currentStatus);
    const dateKeysInOrder = ['initiatedAt', 'sentAt', 'signedAt', 'closedAt'];
    let allowedDateKeys = [];
    if (!isEditMode) {
        // In create mode allow all date fields
        allowedDateKeys = dateKeysInOrder;
    } else if (currentStatus === 'canceled') {
        // When canceled, allow edits up to signedAt only
        allowedDateKeys = ['initiatedAt', 'sentAt', 'signedAt'];
    } else if (statusIndex >= 0) {
        // Allow editing up to the current status (inclusive)
        allowedDateKeys = dateKeysInOrder.slice(
            0,
            Math.min(statusIndex + 1, dateKeysInOrder.length)
        );
    }
    const editableSet = new Set(allowedDateKeys);
    const canEditInitiatedAt = !isEditMode || editableSet.has('initiatedAt');
    const canEditSentAt = !isEditMode || editableSet.has('sentAt');
    const canEditSignedAt = !isEditMode || editableSet.has('signedAt');
    const canEditClosedAt = !isEditMode || editableSet.has('closedAt');

    return (
        <Dialog
            disableRestoreFocus
            fullWidth
            maxWidth="sm"
            onClose={onClose}
            open={open}
        >
            <DialogTitle>
                {isEditMode
                    ? t('deals.editDeal', { ns: 'crm' })
                    : t('deals.createDeal', { ns: 'crm' })}
            </DialogTitle>
            <DialogContent dividers>
                <Stack
                    component="form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    spacing={2}
                    sx={{ mt: 1 }}
                >
                    {/* Lead Selection - read-only in edit mode */}
                    {isEditMode ? (
                        <TextField
                            InputProps={{ readOnly: true }}
                            disabled
                            fullWidth
                            label={t('deals.lead', { ns: 'crm' })}
                            value={deal?.leadFullName || 'Unknown Lead'}
                        />
                    ) : (
                        <form.Field name="leadId">
                            {(field) => (
                                <FormControl
                                    disabled={lockLeadSelect}
                                    fullWidth
                                    required
                                >
                                    <InputLabel id="leadId-label">
                                        {t('deals.lead', { ns: 'crm' })}
                                    </InputLabel>
                                    <Select
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 280,
                                                    overflowY: 'auto'
                                                }
                                            },
                                            MenuListProps: { dense: true }
                                        }}
                                        error={Boolean(errors.leadId)}
                                        label={t('deals.lead', { ns: 'crm' })}
                                        labelId="leadId-label"
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        value={field.state.value}
                                    >
                                        {allLeads
                                            .filter(
                                                (l) => l.status !== 'closed'
                                            )
                                            .map((l) => (
                                                <MenuItem
                                                    key={l.id}
                                                    value={l.id}
                                                >
                                                    {l.fullName}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            )}
                        </form.Field>
                    )}

                    {/* Sales Representative Selection */}
                    {isEditMode ? (
                        <TextField
                            InputProps={{ readOnly: true }}
                            disabled
                            fullWidth
                            label={t('deals.salesRepresentative', {
                                ns: 'crm'
                            })}
                            value={deal?.salesLabel || 'Unknown Sales Rep'}
                        />
                    ) : (
                        <form.Field name="salesUserId">
                            {(field) => (
                                <FormControl
                                    disabled={lockSalesUserSelect}
                                    fullWidth
                                    required
                                >
                                    <InputLabel id="salesUserId-label">
                                        {t('deals.salesRepresentative', {
                                            ns: 'crm'
                                        })}
                                    </InputLabel>
                                    <Select
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 280,
                                                    overflowY: 'auto'
                                                }
                                            },
                                            MenuListProps: { dense: true }
                                        }}
                                        error={Boolean(errors.salesUserId)}
                                        label={t('deals.salesRepresentative', {
                                            ns: 'crm'
                                        })}
                                        labelId="salesUserId-label"
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                        value={field.state.value}
                                    >
                                        {salesOptions.map((s) => (
                                            <MenuItem
                                                key={s.userId}
                                                value={s.userId}
                                            >
                                                {s.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </form.Field>
                    )}

                    <form.Field name="dealSizeNtd">
                        {(field) => (
                            <TextField
                                error={Boolean(errors.dealSizeNtd)}
                                fullWidth
                                helperText={errors.dealSizeNtd}
                                inputProps={{
                                    inputMode: 'numeric',
                                    min: 0,
                                    step: 1
                                }}
                                label={t('deals.dealSizeNtd', { ns: 'crm' })}
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                placeholder={t('deals.placeholderDealSize', {
                                    ns: 'crm'
                                })}
                                required
                                type="number"
                                value={field.state.value}
                            />
                        )}
                    </form.Field>

                    <form.Field name="status">
                        {(field) => (
                            <FormControl fullWidth>
                                <InputLabel id="status-label">
                                    {t('deals.status', { ns: 'crm' })}
                                </InputLabel>
                                <Select
                                    label={t('deals.status', { ns: 'crm' })}
                                    labelId="status-label"
                                    onChange={(e) => {
                                        const newStatus = e.target.value;
                                        field.handleChange(newStatus);
                                        setUiStatus(newStatus);
                                        // Reset datetime fields that come after the selected status in the order
                                        const order = [
                                            'initiated',
                                            'sent',
                                            'signed',
                                            'closed',
                                            'canceled'
                                        ];
                                        const idx = order.indexOf(newStatus);
                                        const dateKeysInOrder = [
                                            'initiatedAt',
                                            'sentAt',
                                            'signedAt',
                                            'closedAt'
                                        ];
                                        let toReset = [];
                                        if (newStatus === 'canceled') {
                                            // Ensure closedAt is cleared when switching to canceled
                                            toReset = ['closedAt'];
                                        } else if (idx >= 0) {
                                            toReset = dateKeysInOrder.slice(
                                                idx + 1
                                            );
                                        }
                                        for (const k of toReset) {
                                            // Clear to empty string so submit maps it to null
                                            form.setFieldValue(k, '');
                                        }
                                    }}
                                    value={field.state.value}
                                >
                                    {statusValues.map((s) => (
                                        <MenuItem key={s} value={s}>
                                            {t(`deals.statusLabels.${s}`, {
                                                ns: 'crm'
                                            })}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </form.Field>

                    <form.Field name="note">
                        {(field) => (
                            <TextField
                                fullWidth
                                label={t('deals.note', { ns: 'crm' })}
                                minRows={2}
                                multiline
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                                value={field.state.value}
                            />
                        )}
                    </form.Field>

                    {/* Dates */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <form.Field name="initiatedAt">
                            {(field) => (
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    disabled={!canEditInitiatedAt}
                                    fullWidth
                                    label={t('deals.initiatedAt', {
                                        ns: 'crm',
                                        defaultValue: 'Initiated at'
                                    })}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    type="datetime-local"
                                    value={field.state.value}
                                />
                            )}
                        </form.Field>
                        <form.Field name="sentAt">
                            {(field) => (
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    disabled={!canEditSentAt}
                                    fullWidth
                                    label={t('deals.sentAt', {
                                        ns: 'crm',
                                        defaultValue: 'Sent at'
                                    })}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    type="datetime-local"
                                    value={field.state.value}
                                />
                            )}
                        </form.Field>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <form.Field name="signedAt">
                            {(field) => (
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    disabled={!canEditSignedAt}
                                    fullWidth
                                    label={t('deals.signedAt', {
                                        ns: 'crm',
                                        defaultValue: 'Signed at'
                                    })}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    type="datetime-local"
                                    value={field.state.value}
                                />
                            )}
                        </form.Field>
                        <form.Field name="closedAt">
                            {(field) => (
                                <TextField
                                    InputLabelProps={{ shrink: true }}
                                    disabled={!canEditClosedAt}
                                    error={Boolean(errors.closedAt)}
                                    fullWidth
                                    helperText={
                                        uiStatus === 'closed'
                                            ? errors.closedAt
                                            : undefined
                                    }
                                    label={t('deals.closedAt', {
                                        ns: 'crm',
                                        defaultValue: 'Closed at'
                                    })}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    type="datetime-local"
                                    value={field.state.value}
                                />
                            )}
                        </form.Field>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>
                    {t('actions.cancel', { ns: 'crm' })}
                </Button>
                <Button
                    form={undefined}
                    onClick={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    type="submit"
                    variant="contained"
                >
                    {isEditMode
                        ? t('actions.save', { ns: 'crm' })
                        : t('actions.create', { ns: 'crm' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DealModal;
