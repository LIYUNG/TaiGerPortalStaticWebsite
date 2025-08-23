import { Navigate, Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import { MaterialReactTable } from 'material-react-table';

import { Box, Breadcrumbs, Link, Typography, Chip, Stack } from '@mui/material';
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

import { getCRMDealsQuery } from '../../api/query';

const DealDashboard = () => {
    TabTitle('CRM - Deals');

    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMDealsQuery());
    const allDeals = data?.data?.data || [];

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
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
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
                <Typography>{i18next.t('Deals', { ns: 'common' })}</Typography>
            </Breadcrumbs>

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
        </Box>
    );
};

export default DealDashboard;
