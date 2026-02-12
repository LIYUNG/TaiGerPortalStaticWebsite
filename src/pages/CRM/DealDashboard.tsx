import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    FiberManualRecord as StatusIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import {
    isTerminalStatus,
    getDealId,
    getStatusColor
} from '@pages/CRM/components/statusUtils';
import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';

import { getCRMDealsQuery } from '@api/query';
import { updateCRMDeal } from '@/api';
import DealModal from '@pages/CRM/components/DealModal';
import StatusMenu from '@pages/CRM/components/StatusMenu';

// Simple currency formatter (defaults to TWD, no fraction digits)
const currencyFormatter = (value, options = {}) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return value ?? '';
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: 'TWD',
            maximumFractionDigits: 0,
            ...options
        }).format(n);
    } catch {
        return n.toLocaleString();
    }
};

const DealDashboard = () => {
    const { t } = useTranslation();
    TabTitle(
        `${t('breadcrumbs.crm', { ns: 'crm' })} - ${t('breadcrumbs.deals', { ns: 'crm' })}`
    );
    const [open, setOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);
    const [statusMenu, setStatusMenu] = useState({ anchorEl: null, row: null });

    const { user } = useAuth();
    // prepare query so we can reuse its key for invalidation
    const dealsQuery = getCRMDealsQuery();
    const { data, isLoading } = useQuery(dealsQuery);
    const queryClient = useQueryClient();
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, closedAt }) => {
            await updateCRMDeal(id, {
                status,
                ...(status === 'closed' && closedAt ? { closedAt } : {})
            });
            return { ok: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: dealsQuery.queryKey });
        }
    });

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const allDeals = data?.data?.data || [];

    const handleCreateDeal = () => {
        setEditingDeal(null);
        setOpen(true);
    };

    const handleEditDeal = (deal) => {
        setEditingDeal(deal);
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setEditingDeal(null);
    };

    const getSalesColor = (salesName) => {
        const colors = {
            David: 'primary',
            Winnie: 'success'
        };
        return colors[salesName] || 'default';
    };

    // status menu handlers
    const openStatusMenu = (event, row) => {
        if (isTerminalStatus(row?.status)) return; // don't open for closed/canceled
        setStatusMenu({ anchorEl: event.currentTarget, row });
    };
    const closeStatusMenu = () => setStatusMenu({ anchorEl: null, row: null });
    // Note: status changes are handled in StatusMenu onChoose

    const columns = [
        {
            accessorKey: 'status',
            header: t('common.status', { ns: 'crm' }),
            size: 140,
            Cell: ({ row, cell }) => {
                const value = cell.getValue();
                const id = getDealId(row.original);
                const isUpdating =
                    updateStatusMutation.isPending &&
                    updateStatusMutation.variables?.id === id;

                const terminal = isTerminalStatus(value);
                return (
                    <Stack alignItems="center" direction="row" spacing={0.5}>
                        <Tooltip
                            title={
                                terminal
                                    ? t('common.noNextStep', {
                                          ns: 'crm',
                                          defaultValue: 'No next step'
                                      })
                                    : t('actions.changeStatus', {
                                          ns: 'crm',
                                          defaultValue: 'Change status'
                                      })
                            }
                        >
                            <span>
                                <Chip
                                    clickable={!terminal}
                                    color={getStatusColor(value)}
                                    disabled={isUpdating || terminal}
                                    icon={<StatusIcon fontSize="small" />}
                                    label={t(`deals.statusLabels.${value}`, {
                                        ns: 'crm',
                                        defaultValue: value
                                    })}
                                    onClick={(e) => {
                                        if (terminal) return;
                                        e.stopPropagation();
                                        openStatusMenu(e, row.original);
                                    }}
                                    size="small"
                                    variant="outlined"
                                />
                            </span>
                        </Tooltip>
                    </Stack>
                );
            }
        },
        {
            accessorKey: 'leadFullName',
            header: t('common.lead', { ns: 'crm' }),
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
            header: t('common.sales', { ns: 'crm' }),
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
            header: t('common.dealSize', { ns: 'crm' }),
            size: 120,
            Cell: ({ cell }) => (
                <Typography variant="body2">
                    {currencyFormatter(cell.getValue())}
                </Typography>
            )
        },
        {
            accessorKey: 'closedAt',
            header: t('common.closedDate', { ns: 'crm' }),
            size: 140,
            Cell: ({ cell }) => (
                <Stack alignItems="center" direction="row" spacing={1}>
                    <ScheduleIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                        {cell.getValue()
                            ? new Date(cell.getValue()).toLocaleDateString()
                            : t('common.na', { ns: 'crm' })}
                    </Typography>
                </Stack>
            )
        },
        {
            accessorKey: 'note',
            header: t('common.note', { ns: 'crm' }),
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
                    {cell.getValue() || t('common.na', { ns: 'crm' })}
                </Typography>
            )
        },
        {
            accessorKey: 'actions',
            header: t('common.actions', { ns: 'crm' }),
            size: 80,
            enableSorting: false,
            Cell: ({ row }) => (
                <Tooltip title={t('actions.edit', { ns: 'crm' })}>
                    <IconButton
                        color="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditDeal(row.original);
                        }}
                        size="small"
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
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
                        {t('breadcrumbs.crm', { ns: 'crm' })}
                    </Link>
                    <Typography>
                        {t('breadcrumbs.deals', { ns: 'crm' })}
                    </Typography>
                </Breadcrumbs>
                <Button onClick={handleCreateDeal} variant="contained">
                    {t('actions.createDeal', { ns: 'crm' })}
                </Button>
            </Stack>

            <MaterialReactTable
                columns={columns}
                data={allDeals}
                enableExpanding
                initialState={{
                    density: 'compact',
                    pagination: { pageSize: 15, pageIndex: 0 }
                }}
                layoutMode="semantic"
                muiTableBodyCellProps={{ sx: { px: 1 } }}
                muiTableBodyRowProps={({ row }) => ({
                    hover: true,
                    sx: { cursor: 'pointer' },
                    onClick: (e) => {
                        // Ignore clicks from interactive elements (links, buttons, chips)
                        const el = e.target;
                        if (
                            el.closest &&
                            el.closest(
                                'a,button,[role="button"],.MuiChip-root,.MuiIconButton-root'
                            )
                        ) {
                            return;
                        }
                        row.toggleExpanded();
                    }
                })}
                muiTableHeadCellProps={{ sx: { px: 1 } }}
                muiTablePaginationProps={{
                    rowsPerPageOptions: [10, 15, 25, 50, 100]
                }}
                renderDetailPanel={({ row }) => {
                    const d = row.original || {};
                    // Build timeline events for statuses that have dates
                    const items = [
                        { key: 'initiatedAt', status: 'initiated' },
                        { key: 'sentAt', status: 'sent' },
                        { key: 'signedAt', status: 'signed' },
                        { key: 'closedAt', status: 'closed' },
                        { key: 'canceledAt', status: 'canceled' }
                    ];
                    const events = items.filter((it) => Boolean(d[it.key]));
                    if (events.length === 0) {
                        return (
                            <Box sx={{ p: 2 }}>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    {t('common.na', { ns: 'crm' })}
                                </Typography>
                            </Box>
                        );
                    }
                    return (
                        <Box sx={{ p: 1.5 }}>
                            <Stack spacing={1.25}>
                                {events.map((it, idx) => {
                                    const colorKey = getStatusColor(it.status);
                                    const date = new Date(d[it.key]);
                                    const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                                    return (
                                        <Stack
                                            alignItems="flex-start"
                                            direction="row"
                                            key={it.key}
                                            spacing={1.5}
                                        >
                                            {/* timeline rail + dot */}
                                            <Box
                                                sx={{
                                                    width: 20,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 2,
                                                        flex: 1,
                                                        bgcolor: (theme) =>
                                                            theme.palette
                                                                .divider,
                                                        visibility:
                                                            idx === 0
                                                                ? 'hidden'
                                                                : 'visible'
                                                    }}
                                                />
                                                <Box
                                                    sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '50%',
                                                        border: '2px solid #fff',
                                                        boxShadow: 1,
                                                        bgcolor: (theme) =>
                                                            colorKey ===
                                                            'default'
                                                                ? theme.palette
                                                                      .grey[500]
                                                                : theme.palette[
                                                                      colorKey
                                                                  ].main
                                                    }}
                                                />
                                                <Box
                                                    sx={{
                                                        width: 2,
                                                        flex: 1,
                                                        bgcolor: (theme) =>
                                                            theme.palette
                                                                .divider,
                                                        visibility:
                                                            idx ===
                                                            events.length - 1
                                                                ? 'hidden'
                                                                : 'visible'
                                                    }}
                                                />
                                            </Box>
                                            {/* content */}
                                            <Stack spacing={0.25}>
                                                <Typography
                                                    sx={{ fontWeight: 600 }}
                                                    variant="body2"
                                                >
                                                    {dateStr}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: (theme) =>
                                                            colorKey ===
                                                            'default'
                                                                ? theme.palette
                                                                      .text
                                                                      .secondary
                                                                : theme.palette[
                                                                      colorKey
                                                                  ].main
                                                    }}
                                                    variant="body2"
                                                >
                                                    {t(
                                                        `deals.statusLabels.${it.status}`,
                                                        {
                                                            ns: 'crm',
                                                            defaultValue:
                                                                it.status
                                                        }
                                                    )}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        </Box>
                    );
                }}
                state={{ isLoading }}
            />

            <StatusMenu
                anchorEl={statusMenu.anchorEl}
                currentStatus={statusMenu.row?.status}
                onChoose={(s) => {
                    const id = getDealId(statusMenu.row);
                    updateStatusMutation.mutate(
                        { id, status: s },
                        { onSettled: () => closeStatusMenu() }
                    );
                }}
                onClose={closeStatusMenu}
            />

            <DealModal
                deal={editingDeal}
                onClose={handleCloseModal}
                open={open}
            />
        </Box>
    );
};

export default DealDashboard;
