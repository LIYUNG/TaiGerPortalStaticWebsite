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
    Tooltip,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    FiberManualRecord as StatusIcon,
    Edit as EditIcon,
    ArrowForward as ArrowForwardIcon,
    Check as CheckIcon
} from '@mui/icons-material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import { getCRMDealsQuery } from '../../api/query';
import { updateCRMDeal } from '../../api';
import DealModal from './components/DealModal';

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
    } catch (e) {
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
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    // prepare query so we can reuse its key for invalidation
    const dealsQuery = getCRMDealsQuery();
    const { data, isLoading } = useQuery(dealsQuery);
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

    const STATUS_FLOW = ['initiated', 'sent', 'signed', 'closed'];
    // terminal states shouldn't be changeable inline
    const isTerminalStatus = (status) =>
        status === 'closed' || status === 'canceled';
    const getDealId = (deal) => deal?.id ?? deal?.dealId ?? deal?._id;

    const getSalesColor = (salesName) => {
        const colors = {
            David: 'primary',
            Winnie: 'success'
        };
        return colors[salesName] || 'default';
    };

    const getStatusColor = (status) => {
        const colors = {
            initiated: 'info',
            sent: 'warning',
            signed: 'success',
            closed: 'default',
            canceled: 'error'
        };
        return colors[status] || 'default';
    };

    // status menu handlers
    const openStatusMenu = (event, row) => {
        if (isTerminalStatus(row?.status)) return; // don't open for closed/canceled
        setStatusMenu({ anchorEl: event.currentTarget, row });
    };
    const closeStatusMenu = () => setStatusMenu({ anchorEl: null, row: null });
    const handleChooseStatus = (status) => {
        const row = statusMenu.row;
        const id = getDealId(row);
        // If moving to 'closed' and we don't have a closedDate, open modal to capture it
        if (status === 'closed' && !row?.closedDate) {
            setEditingDeal({ ...row, status: 'closed' });
            setOpen(true);
            closeStatusMenu();
            return;
        }
        updateStatusMutation.mutate(
            { id, status },
            { onSettled: () => closeStatusMenu() }
        );
    };

    // Mutation to update deal status (adjust endpoint if needed)
    const queryClient = useQueryClient();
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, closedDate }) => {
            await updateCRMDeal(id, {
                status,
                ...(status === 'closed' && closedDate ? { closedDate } : {})
            });
            return { ok: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: dealsQuery.queryKey });
        }
    });

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
                                    label={value}
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
            accessorKey: 'closedDate',
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

            {/* Status selection menu */}
            <Menu
                anchorEl={statusMenu.anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                onClose={closeStatusMenu}
                open={Boolean(statusMenu.anchorEl)}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                {(() => {
                    const current = statusMenu.row?.status;
                    if (
                        !current ||
                        current === 'closed' ||
                        current === 'canceled'
                    )
                        return null;
                    const currentIdx = STATUS_FLOW.indexOf(current);
                    const nextOptions =
                        currentIdx >= 0
                            ? STATUS_FLOW.slice(currentIdx + 1)
                            : [];
                    return (
                        <>
                            <MenuItem disabled>
                                <ListItemIcon>
                                    <CheckIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('common.current', {
                                        ns: 'crm',
                                        defaultValue: 'Current'
                                    })}
                                    secondary={current}
                                />
                            </MenuItem>
                            {nextOptions.length > 0 && <Divider />}
                            {nextOptions.map((s) => (
                                <MenuItem
                                    key={s}
                                    onClick={() => handleChooseStatus(s)}
                                >
                                    <ListItemIcon>
                                        <ArrowForwardIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={s} />
                                </MenuItem>
                            ))}
                            {/* Cancel option available from any non-terminal status */}
                            <Divider />
                            <MenuItem
                                onClick={() => handleChooseStatus('canceled')}
                            >
                                <ListItemIcon>
                                    <CancelIcon
                                        color="error"
                                        fontSize="small"
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('actions.cancel', {
                                        ns: 'crm',
                                        defaultValue: 'Cancel'
                                    })}
                                />
                            </MenuItem>
                        </>
                    );
                })()}
            </Menu>

            <DealModal
                deal={editingDeal}
                onClose={handleCloseModal}
                open={open}
            />
        </Box>
    );
};

export default DealDashboard;
