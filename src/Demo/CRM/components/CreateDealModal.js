import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { createCRMDeal } from '../../../api';
import { getCRMSalesReps } from '../../../api';

/**
 * CreateDealModal
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - preselectedLeadId?: string
 * - preselectedSalesUserId?: string
 * - lockLeadSelect?: boolean
 * - lockSalesUserSelect?: boolean
 * - onCreated?: () => Promise<void> | void
 */

const statusValues = ['initiated', 'sent', 'signed', 'closed', 'canceled'];

const CreateDealModal = ({
    open,
    onClose,
    preselectedLeadId,
    preselectedSalesUserId,
    lockLeadSelect = false,
    lockSalesUserSelect = false,
    onCreated
}) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { data: leadsData } = useQuery({
        ...getCRMLeadsQuery(),
        enabled: open
    });
    const allLeads = leadsData?.data?.data || [];

    // Fetch sales reps from API
    const { data: salesData } = useQuery({
        queryKey: ['crm/sales-reps'],
        enabled: open,
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

    const [form, setForm] = useState({
        leadId: preselectedLeadId || '',
        salesUserId: '',
        dealSizeNtd: '',
        status: 'initiated',
        note: '',
        closedDate: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setForm((f) => ({
                ...f,
                leadId: preselectedLeadId || '',
                salesUserId: preselectedSalesUserId || ''
            }));
            setErrors({});
        }
    }, [open, preselectedLeadId, preselectedSalesUserId]);

    const resetForm = () => {
        setForm({
            leadId: preselectedLeadId || '',
            salesUserId: preselectedSalesUserId || '',
            dealSizeNtd: '',
            status: 'initiated',
            note: '',
            closedDate: ''
        });
        setErrors({});
    };

    const handleCreate = async () => {
        const newErrors = {};
        if (!form.leadId)
            newErrors.leadId = t('deals.leadIsRequired', { ns: 'crm' });
        if (!form.salesUserId)
            newErrors.salesUserId = t('deals.salesRepIsRequired', {
                ns: 'crm'
            });
        if (!form.dealSizeNtd || Number(form.dealSizeNtd) <= 0)
            newErrors.dealSizeNtd = t('deals.mustBePositive', { ns: 'crm' });
        if (form.status === 'closed' && !form.closedDate)
            newErrors.closedDate = t('deals.closedDateRequired', { ns: 'crm' });

        setErrors(newErrors);
        if (Object.keys(newErrors).length) return;

        const payload = {
            leadId: form.leadId,
            salesUserId: form.salesUserId,
            dealSizeNtd: Number(form.dealSizeNtd),
            status: form.status,
            note: form.note || undefined,
            closedDate: form.status === 'closed' ? form.closedDate : undefined
        };

        try {
            await createCRMDeal(payload);
            await queryClient.invalidateQueries({ queryKey: ['crm/deals'] });
            if (form.leadId)
                await queryClient.invalidateQueries({
                    queryKey: ['crm/lead', form.leadId]
                });
            if (onCreated) await onCreated();
            resetForm();
            onClose?.();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
            <DialogTitle>{t('deals.createDeal', { ns: 'crm' })}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <FormControl disabled={lockLeadSelect} fullWidth required>
                        <InputLabel id="leadId-label">
                            {t('deals.lead', { ns: 'crm' })}
                        </InputLabel>
                        <Select
                            MenuProps={{
                                PaperProps: {
                                    sx: { maxHeight: 280, overflowY: 'auto' }
                                },
                                MenuListProps: { dense: true }
                            }}
                            error={Boolean(errors.leadId)}
                            label={t('deals.lead', { ns: 'crm' })}
                            labelId="leadId-label"
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    leadId: e.target.value
                                }))
                            }
                            value={form.leadId}
                        >
                            {allLeads
                                .filter((l) => l.status != 'closed')
                                .map((l) => (
                                    <MenuItem key={l.id} value={l.id}>
                                        {l.fullName}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>

                    <FormControl
                        disabled={lockSalesUserSelect}
                        fullWidth
                        required
                    >
                        <InputLabel id="salesUserId-label">
                            {t('deals.salesRepresentative', { ns: 'crm' })}
                        </InputLabel>
                        <Select
                            MenuProps={{
                                PaperProps: {
                                    sx: { maxHeight: 280, overflowY: 'auto' }
                                },
                                MenuListProps: { dense: true }
                            }}
                            error={Boolean(errors.salesUserId)}
                            label={t('deals.salesRepresentative', {
                                ns: 'crm'
                            })}
                            labelId="salesUserId-label"
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    salesUserId: e.target.value
                                }))
                            }
                            value={form.salesUserId}
                        >
                            {salesOptions.map((s) => (
                                <MenuItem key={s.userId} value={s.userId}>
                                    {s.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        error={Boolean(errors.dealSizeNtd)}
                        fullWidth
                        helperText={errors.dealSizeNtd}
                        inputProps={{ inputMode: 'numeric', min: 0, step: 1 }}
                        label={t('deals.dealSizeNtd', { ns: 'crm' })}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                dealSizeNtd: e.target.value
                            }))
                        }
                        placeholder={t('deals.placeholderDealSize', {
                            ns: 'crm'
                        })}
                        required
                        type="number"
                        value={form.dealSizeNtd}
                    />

                    <FormControl fullWidth>
                        <InputLabel id="status-label">
                            {t('deals.status', { ns: 'crm' })}
                        </InputLabel>
                        <Select
                            label={t('deals.status', { ns: 'crm' })}
                            labelId="status-label"
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    status: e.target.value
                                }))
                            }
                            value={form.status}
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

                    <TextField
                        fullWidth
                        label={t('deals.note', { ns: 'crm' })}
                        minRows={2}
                        multiline
                        onChange={(e) =>
                            setForm((f) => ({ ...f, note: e.target.value }))
                        }
                        value={form.note}
                    />

                    <TextField
                        InputLabelProps={{ shrink: true }}
                        disabled={form.status !== 'closed'}
                        error={Boolean(errors.closedDate)}
                        fullWidth
                        helperText={
                            form.status === 'closed'
                                ? errors.closedDate
                                : undefined
                        }
                        label={t('deals.closedDate', { ns: 'crm' })}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                closedDate: e.target.value
                            }))
                        }
                        type="date"
                        value={form.closedDate}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        resetForm();
                        onClose?.();
                    }}
                >
                    {t('actions.cancel', { ns: 'crm' })}
                </Button>
                <Button onClick={handleCreate} variant="contained">
                    {t('actions.create', { ns: 'crm' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateDealModal;
