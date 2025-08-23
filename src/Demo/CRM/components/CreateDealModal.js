import { useEffect, useState } from 'react';
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
import { request } from '../../../api/request';

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
const CreateDealModal = ({
    open,
    onClose,
    preselectedLeadId,
    preselectedSalesUserId,
    lockLeadSelect = false,
    lockSalesUserSelect = false,
    onCreated
}) => {
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
            const res = await request.get('/api/crm/sales-reps');
            // Support either { data: { data: [...] }} or { data: [...] }
            return res?.data?.data ?? res?.data ?? [];
        }
    });
    const salesOptions = (salesData || []).map((s) => ({
        userId: s.userId || s.value,
        label: s.label || s.name || s.fullName || 'Unknown'
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
        if (!form.leadId) newErrors.leadId = 'Lead is required';
        if (!form.salesUserId)
            newErrors.salesUserId = 'Sales representative is required';
        if (!form.dealSizeNtd || Number(form.dealSizeNtd) <= 0)
            newErrors.dealSizeNtd = 'Enter a valid amount';
        if (form.status === 'closed' && !form.closedDate)
            newErrors.closedDate = 'Closed date required when status is closed';

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
            <DialogTitle>Create Deal</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <FormControl disabled={lockLeadSelect} fullWidth required>
                        <InputLabel id="leadId-label">Lead</InputLabel>
                        <Select
                            MenuProps={{
                                PaperProps: {
                                    sx: { maxHeight: 280, overflowY: 'auto' }
                                },
                                MenuListProps: { dense: true }
                            }}
                            error={Boolean(errors.leadId)}
                            label="Lead"
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
                            Sales representative
                        </InputLabel>
                        <Select
                            MenuProps={{
                                PaperProps: {
                                    sx: { maxHeight: 280, overflowY: 'auto' }
                                },
                                MenuListProps: { dense: true }
                            }}
                            error={Boolean(errors.salesUserId)}
                            label="Sales Rep"
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
                        InputProps={{ inputMode: 'numeric' }}
                        error={Boolean(errors.dealSizeNtd)}
                        fullWidth
                        helperText={errors.dealSizeNtd}
                        label="Deal Size (NTD)"
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                dealSizeNtd: e.target.value
                            }))
                        }
                        placeholder="e.g. 69999"
                        required
                        type="number"
                        value={form.dealSizeNtd}
                    />

                    <FormControl fullWidth>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            label="Status"
                            labelId="status-label"
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    status: e.target.value
                                }))
                            }
                            value={form.status}
                        >
                            {['initiated', 'sent', 'signed', 'closed'].map(
                                (s) => (
                                    <MenuItem key={s} value={s}>
                                        {s}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Note"
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
                        label="Closed Date"
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
                    Cancel
                </Button>
                <Button onClick={handleCreate} variant="contained">
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateDealModal;
