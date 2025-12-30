import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MaterialReactTable } from 'material-react-table';
import { useState } from 'react';

import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Card,
    CardContent,
    Chip,
    Stack,
    Tabs,
    Tab
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    FiberManualRecord as StatusIcon,
    School as SchoolIcon
} from '@mui/icons-material';

import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import { getCRMLeadsQuery } from '../../api/query';

const LeadDashboard = () => {
    const { t } = useTranslation();
    TabTitle(
        `${t('breadcrumbs.crm', { ns: 'crm' })} - ${t('breadcrumbs.leads', { ns: 'crm' })}`
    );
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(1);

    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMLeadsQuery());
    const leads = data?.data?.data || [];
    const allLeads = leads.filter((lead) => lead.status !== 'migrated');

    const openLeads = allLeads.filter(
        (lead) => lead.status === 'open' && lead.meetingCount === 0
    );
    const contactedLeads = allLeads.filter(
        (lead) => lead.status === 'open' && lead.meetingCount !== 0
    );
    const convertedLeads = allLeads.filter(
        (lead) => lead.status === 'converted'
    );
    const closedLeads = allLeads.filter((lead) => lead.status === 'closed');
    const migratedLeads = leads.filter((lead) => lead.status === 'migrated');

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

    const getCloseLikelihoodColor = (closeLikelihood) => {
        const colors = {
            high: 'success',
            medium: 'warning',
            low: 'error'
        };
        return colors[closeLikelihood] || 'default';
    };

    const columns = [
        {
            accessorKey: 'closeLikelihood',
            header: t('leads.chance', { ns: 'crm' }),
            size: 100,
            Cell: ({ cell }) => {
                const value = cell.getValue();
                if (!value) return null;
                return (
                    <Chip
                        color={getCloseLikelihoodColor(value)}
                        icon={<StatusIcon fontSize="small" />}
                        label={value}
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
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
            accessorKey: 'fullName',
            header: t('leads.fullName', { ns: 'crm' }),
            size: 120,
            muiTableBodyCellProps: ({ cell }) => ({
                sx: {
                    maxWidth: 160,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                },
                title: cell.getValue()
            }),
            Cell: ({ cell }) => (
                <Typography fontWeight="medium" noWrap variant="body2">
                    {cell.getValue()}
                </Typography>
            )
        },
        {
            accessorKey: 'intendedStartTime',
            header: t('leads.startTime', { ns: 'crm' }),
            size: 150,
            Cell: ({ cell }) => (
                <Stack alignItems="center" direction="row" spacing={1}>
                    <ScheduleIcon color="action" fontSize="small" />
                    <Typography variant="body2">{cell.getValue()}</Typography>
                </Stack>
            )
        },
        {
            id: 'intendedProgram',
            header: t('leads.intendedProgram', { ns: 'crm' }),
            size: 350,
            accessorFn: (row) => {
                const level = row.intendedProgramLevel?.trim();
                const direction = row.intendedDirection?.trim();
                if (level && direction) return `${level} — ${direction}`;
                return level || direction || '';
            },
            muiTableBodyCellProps: ({ cell }) => ({
                sx: {
                    maxWidth: 350,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                },
                title: cell.getValue()
            }),
            Cell: ({ cell }) => (
                <Stack
                    alignItems="center"
                    direction="row"
                    spacing={1}
                    sx={{ minWidth: 0 }}
                >
                    <SchoolIcon color="action" fontSize="small" />
                    <Typography noWrap sx={{ minWidth: 0 }} variant="body2">
                        {cell.getValue()}
                    </Typography>
                </Stack>
            )
        },
        {
            accessorFn: (row) =>
                row.salesRep?.label ?? t('common.na', { ns: 'crm' }),
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
            accessorKey: 'salesNote',
            header: t('common.salesNote', { ns: 'crm' }),
            size: 350,
            muiTableBodyCellProps: ({ cell }) => ({
                sx: {
                    maxWidth: 320,
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
        },
        {
            accessorKey: 'createdAt',
            header: t('common.submittedAt', { ns: 'crm' }),
            size: 150,
            Cell: ({ cell }) => (
                <Stack alignItems="center" direction="row" spacing={1}>
                    <ScheduleIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                        {new Date(cell.getValue()).toLocaleDateString()}
                    </Typography>
                </Stack>
            )
        }
    ];

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getCurrentLeads = () => {
        switch (tabValue) {
            case 0:
                return allLeads;
            case 1:
                return openLeads;
            case 2:
                return contactedLeads;
            case 3:
                return convertedLeads;
            case 4:
                return closedLeads;
            case 5:
                return migratedLeads;
            default:
                return openLeads;
        }
    };

    const getTabTitle = () => {
        switch (tabValue) {
            case 0:
                return t('leads.allLeads', { ns: 'crm' });
            case 1:
                return t('leads.openLeads', { ns: 'crm' });
            case 2:
                return t('leads.contactedLeads', { ns: 'crm' });
            case 3:
                return t('leads.convertedLeads', { ns: 'crm' });
            case 4:
                return t('leads.closedLeads', { ns: 'crm' });
            case 5:
                return t('leads.migratedLeads', { ns: 'crm' });
            default:
                return t('leads.openLeads', { ns: 'crm' });
        }
    };

    const getTabDescription = () => {
        switch (tabValue) {
            case 0:
                return t('leads.desc.all', { ns: 'crm' });
            case 1:
                return t('leads.desc.open', { ns: 'crm' });
            case 2:
                return t('leads.desc.contacted', { ns: 'crm' });
            case 3:
                return t('leads.desc.converted', { ns: 'crm' });
            case 4:
                return t('leads.desc.closed', { ns: 'crm' });
            case 5:
                return t('leads.desc.migrated', { ns: 'crm' });
            default:
                return t('leads.desc.open', { ns: 'crm' });
        }
    };

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
                    {t('breadcrumbs.crm', { ns: 'crm' })}
                </Link>
                <Typography>{t('breadcrumbs.leads', { ns: 'crm' })}</Typography>
            </Breadcrumbs>

            {/* Main Table */}
            <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2.5 }}>
                        <Typography
                            color="text.primary"
                            fontWeight={600}
                            variant="h6"
                        >
                            {getTabTitle()}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            {getTabDescription()}
                        </Typography>
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs onChange={handleTabChange} value={tabValue}>
                            <Tab
                                label={`${t('leads.allLeads', { ns: 'crm' })} (${allLeads.length})`}
                                sx={{ textTransform: 'none' }}
                            />
                            <Tab
                                label={`${t('leads.openLeads', { ns: 'crm' })} (${openLeads.length})`}
                                sx={{ textTransform: 'none' }}
                            />
                            <Tab
                                label={`${t('leads.contactedLeads', { ns: 'crm' })} (${contactedLeads.length})`}
                                sx={{ textTransform: 'none' }}
                            />
                            <Tab
                                label={`${t('leads.convertedLeads', { ns: 'crm' })} (${convertedLeads.length})`}
                                sx={{ textTransform: 'none' }}
                            />
                            <Tab
                                label={`${t('leads.closedLeads', { ns: 'crm' })} (${closedLeads.length})`}
                                sx={{ textTransform: 'none' }}
                            />
                            <Tab
                                label={`${t('leads.migratedLeads', { ns: 'crm' })} (${migratedLeads.length})`}
                                sx={{ textTransform: 'none' }}
                            />
                        </Tabs>
                    </Box>

                    <MaterialReactTable
                        columns={columns}
                        data={getCurrentLeads()}
                        initialState={{
                            density: 'compact',
                            pagination: { pageSize: 15, pageIndex: 0 } // default rows per page
                        }}
                        layoutMode="semantic"
                        muiTableBodyCellProps={{ sx: { px: 1 } }}
                        muiTableBodyRowProps={({ row }) => ({
                            onClick: () => {
                                navigate(`/crm/leads/${row.original.id}`);
                            },
                            sx: { cursor: 'pointer' }
                        })}
                        muiTableHeadCellProps={{ sx: { px: 1 } }}
                        muiTablePaginationProps={{
                            rowsPerPageOptions: [10, 15, 25, 50, 100] // include 15 in the selector
                        }}
                        state={{ isLoading }}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default LeadDashboard;
