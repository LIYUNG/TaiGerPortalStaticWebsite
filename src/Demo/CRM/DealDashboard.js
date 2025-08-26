import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import { getCRMDealsQuery } from '../../api/query';
import DealModal from './components/DealModal';

const DealDashboard = () => {
    const { t } = useTranslation();
    TabTitle(
        `${t('breadcrumbs.crm', { ns: 'crm' })} - ${t('breadcrumbs.deals', { ns: 'crm' })}`
    );
    const [open, setOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);

    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMDealsQuery());
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
        if (!value) return t('common.na', { ns: 'crm' });
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
            header: t('common.status', { ns: 'crm' }),
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

            <DealModal
                deal={editingDeal}
                onClose={handleCloseModal}
                open={open}
            />
        </Box>
    );
};

export default DealDashboard;
