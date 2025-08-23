import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import i18next from 'i18next';
import { MaterialReactTable } from 'material-react-table';
import { useState } from 'react';

import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Chip,
    Stack,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    FiberManualRecord as StatusIcon
} from '@mui/icons-material';

import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import { getCRMDealsQuery, getCRMLeadsQuery } from '../../api/query';
import { createCRMDeal } from '../../api';

const DealDashboard = () => {
    TabTitle('CRM - Deals');
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        leadId: '',
        salesUserId: '',
        dealSizeNtd: '',
        status: 'initiated',
        note: '',
        closedDate: ''
    });
    const [errors, setErrors] = useState({});

    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMDealsQuery());
    const { data: leadsData } = useQuery(getCRMLeadsQuery());
    const allDeals = data?.data?.data || [];
    const allLeads = leadsData?.data?.data || [];
    const salesOptions = Array.from(
        new Map(
            allLeads
                .map((l) => l.salesMember)
                .filter((s) => s && (s.value || s.userId))
                .map((s) => [
                    s.value || s.userId,
                    { userId: s.value || s.userId, label: s.label }
                ])
        ).values()
    );

    // Showing all deals; no tabs/filters

    const getSalesColor = (salesName) => {
        const colors = {
            David: 'primary',
            Winnie: 'success'
        };
        return colors[salesName] || 'default';
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'info',
            contacted: 'warning',
            qualified: 'success',
            converted: 'primary',
            lost: 'error',
            closed: 'default'
        };
        return colors[status] || 'default';
    };

    const currencyFormatter = (value) => {
        if (value == null) return '—';
        const num = Number(value);
        if (Number.isNaN(num)) return value;
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            maximumFractionDigits: 0
        }).format(num);
    };

    const columns = [
        {
            accessorKey: 'status',
            header: 'Status',
            size: 100,
            Cell: ({ cell }) => {
                const value = cell.getValue();
                return (
                    <Chip
                        color={getStatusColor(value)}
                        icon={<StatusIcon fontSize="small" />}
                        label={value}
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
        {
            accessorKey: 'leadFullName',
            header: 'Lead',
            size: 160,
            muiTableBodyCellProps: ({ cell }) => ({
                sx: {
                    maxWidth: 220,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                },
                title: cell.getValue()
            }),
            Cell: ({ cell }) => (
                <Stack alignItems="center" direction="row" spacing={1}>
                    <PersonIcon color="action" fontSize="small" />
                    <Link
                        component={RouterLink}
                        sx={{
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                        to={`/crm/leads/${cell.row.original.leadId}`}
                        underline="hover"
                        variant="body2"
                    >
                        {cell.getValue()}
                    </Link>
                </Stack>
            )
        },
        {
            accessorKey: 'salesLabel',
            header: 'Sales',
            size: 100,
            Cell: ({ cell }) => (
                <Chip
                    color={getSalesColor(cell.getValue())}
                    label={cell.getValue()}
                    size="small"
                />
            )
        },
        {
            accessorKey: 'dealSizeNtd',
            header: 'Deal Size',
            size: 120,
            Cell: ({ cell }) => (
                <Typography variant="body2">
                    {currencyFormatter(cell.getValue())}
                </Typography>
            )
        },
        {
            accessorKey: 'closedDate',
            header: 'Closed Date',
            size: 140,
            Cell: ({ cell }) => (
                <Stack alignItems="center" direction="row" spacing={1}>
                    <ScheduleIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                        {cell.getValue()
                            ? new Date(cell.getValue()).toLocaleDateString()
                            : '—'}
                    </Typography>
                </Stack>
            )
        },
        {
            accessorKey: 'note',
            header: 'Note',
            size: 350,
            muiTableBodyCellProps: ({ cell }) => ({
                sx: {
                    maxWidth: 360,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                },
                title: cell.getValue()
            }),
            Cell: ({ cell }) => (
                <Typography noWrap sx={{ minWidth: 0 }} variant="body2">
                    {cell.getValue() || '—'}
                </Typography>
            )
        }
    ];

    return (
        <Box>
            <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}
            >
                <Breadcrumbs aria-label="breadcrumb">
                    <Link
                        color="inherit"
                        component="a"
                        href={`${DEMO.DASHBOARD_LINK}`}
                        underline="hover"
                    >
                        {appConfig.companyName}
                    </Link>
                    <Link
                        color="inherit"
                        component="a"
                        href={`${DEMO.DASHBOARD_LINK}`}
                        underline="hover"
                    >
                        {i18next.t('CRM', { ns: 'common' })}
                    </Link>
                    <Typography>
                        {i18next.t('Deals', { ns: 'common' })}
                    </Typography>
                </Breadcrumbs>
                <Button onClick={() => setOpen(true)} variant="contained">
                    Create Deal
                </Button>
            </Stack>

            <MaterialReactTable
                columns={columns}
                data={allDeals}
                initialState={{
                    density: 'compact',
                    pagination: { pageSize: 15, pageIndex: 0 },
                    sorting: [{ id: 'closedDate', desc: true }]
                }}
                layoutMode="semantic"
                muiTableBodyCellProps={{ sx: { px: 1 } }}
                // No row click navigation; lead name is a link
                muiTableHeadCellProps={{ sx: { px: 1 } }}
                muiTablePaginationProps={{
                    rowsPerPageOptions: [10, 15, 25, 50, 100]
                }}
                state={{ isLoading }}
            />

            <Dialog
                fullWidth
                maxWidth="sm"
                onClose={() => setOpen(false)}
                open={open}
            >
                <DialogTitle>Create Deal</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <FormControl fullWidth required>
                            <InputLabel id="leadId-label">Lead</InputLabel>
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

                        <FormControl fullWidth required>
                            <InputLabel id="salesUserId-label">
                                Sales Member
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
                                label="Sales Member"
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
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={async () => {
                            const newErrors = {};
                            if (!form.leadId)
                                newErrors.leadId = 'Lead is required';
                            if (!form.salesUserId)
                                newErrors.salesUserId =
                                    'Sales member is required';
                            if (
                                !form.dealSizeNtd ||
                                Number(form.dealSizeNtd) <= 0
                            )
                                newErrors.dealSizeNtd = 'Enter a valid amount';
                            if (form.status === 'closed' && !form.closedDate)
                                newErrors.closedDate =
                                    'Closed date required when status is closed';
                            setErrors(newErrors);
                            if (Object.keys(newErrors).length) return;

                            const payload = {
                                leadId: form.leadId,
                                salesUserId: form.salesUserId,
                                dealSizeNtd: Number(form.dealSizeNtd),
                                status: form.status,
                                note: form.note || undefined,
                                closedDate:
                                    form.status === 'closed'
                                        ? form.closedDate
                                        : undefined
                            };
                            try {
                                await createCRMDeal(payload);
                                setOpen(false);
                                setForm({
                                    leadId: '',
                                    salesUserId: '',
                                    dealSizeNtd: '',
                                    status: 'initiated',
                                    note: '',
                                    closedDate: ''
                                });
                                await queryClient.invalidateQueries({
                                    queryKey: ['crm/deals']
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                        variant="contained"
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DealDashboard;
