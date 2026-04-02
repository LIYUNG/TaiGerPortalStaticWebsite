import { MouseEvent, SyntheticEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Card,
    CardContent,
    Chip,
    type ChipProps,
    Stack,
    Tabs,
    Tab,
    Tooltip
} from '@mui/material';
import {
    Schedule as ScheduleIcon,
    FiberManualRecord as StatusIcon,
    School as SchoolIcon
} from '@mui/icons-material';

import { is_TaiGer_role } from '@taiger-common/core';
import type { CRMLeadItem } from '@taiger-common/model';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { appConfig } from '../../config';
import {
    getAvailableLeadStatusOptions,
    getLeadStatusLabel
} from '@pages/CRM/constants/statusOptions';
import LeadStatusMenu from '@pages/CRM/components/LeadStatusMenu';

import { request } from '@/api';
import { getCRMLeadsQuery } from '@/api/query';

const LeadDashboard = () => {
    const { t } = useTranslation();
    TabTitle(
        `${t('breadcrumbs.crm', { ns: 'crm' })} - ${t('breadcrumbs.leads', { ns: 'crm' })}`
    );
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(1);
    const [statusMenu, setStatusMenu] = useState<{
        anchorEl: HTMLElement | null;
        row: CRMLeadItem | null;
    }>({ anchorEl: null, row: null });

    const { user } = useAuth();
    const { data, isLoading } = useQuery(getCRMLeadsQuery());
    const updateLeadStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await request.put(`/api/crm/leads/${id}`, { status });
            return res.data || res;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['crm/leads'] })
    });

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    const leads: CRMLeadItem[] = data?.data?.data || [];
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

    const getSalesColor = (salesName: string): ChipProps['color'] => {
        const colors: Record<string, ChipProps['color']> = {
            David: 'primary',
            Winnie: 'success'
        };
        return colors[salesName] || 'default';
    };

    const getStatusColor = (status: string): ChipProps['color'] => {
        const colors: Record<string, ChipProps['color']> = {
            open: 'warning',
            'not-qualified': 'error',
            migrated: 'success',
            converted: 'primary',
            'in-progress': 'info',
            closed: 'default'
        };
        return colors[status] || 'default';
    };

    const getCloseLikelihoodColor = (
        closeLikelihood: string
    ): ChipProps['color'] => {
        const colors: Record<string, ChipProps['color']> = {
            high: 'success',
            medium: 'warning',
            low: 'error'
        };
        return colors[closeLikelihood] || 'default';
    };

    const openStatusMenu = (
        event: MouseEvent<HTMLElement>,
        row: CRMLeadItem
    ) => {
        setStatusMenu({ anchorEl: event.currentTarget, row });
    };
    const closeStatusMenu = () => setStatusMenu({ anchorEl: null, row: null });

    const columns: MRT_ColumnDef<CRMLeadItem>[] = [
        {
            accessorKey: 'closeLikelihood',
            header: t('leads.chance', { ns: 'crm' }),
            size: 100,
            Cell: ({ cell }) => {
                const value = cell.getValue() as string | null | undefined;
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
            Cell: ({ row, cell }) => {
                const value = cell.getValue() as string | undefined;
                if (!value) return null;
                const availableStatusOptions =
                    getAvailableLeadStatusOptions(value);
                const id = row.original.id;
                const isUpdating =
                    updateLeadStatusMutation.isPending &&
                    (
                        updateLeadStatusMutation.variables as
                            | { id?: string }
                            | undefined
                    )?.id === id;

                return (
                    <Tooltip
                        title={t('actions.changeStatus', {
                            ns: 'crm',
                            defaultValue: 'Change status'
                        })}
                    >
                        <span>
                            <Chip
                                clickable={availableStatusOptions.length > 0}
                                color={getStatusColor(value)}
                                disabled={
                                    isUpdating ||
                                    availableStatusOptions.length === 0
                                }
                                icon={<StatusIcon fontSize="small" />}
                                label={getLeadStatusLabel(value)}
                                onClick={(
                                    event: MouseEvent<HTMLDivElement>
                                ) => {
                                    if (availableStatusOptions.length === 0)
                                        return;
                                    event.stopPropagation();
                                    openStatusMenu(event, row.original);
                                }}
                                size="small"
                                variant="outlined"
                            />
                        </span>
                    </Tooltip>
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
                (row.salesRep as unknown as { label?: string })?.label ??
                t('common.na', { ns: 'crm' }),
            header: t('common.sales', { ns: 'crm' }),
            size: 100,
            Cell: ({ cell }) => {
                const value = cell.getValue() as string;
                return (
                    <Chip
                        color={getSalesColor(value)}
                        label={value}
                        size="small"
                    />
                );
            }
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

    const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
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
                    <LeadStatusMenu
                        anchorEl={statusMenu.anchorEl}
                        currentStatus={statusMenu.row?.status}
                        onChoose={(status) => {
                            const leadId = statusMenu.row?.id;
                            if (!leadId) return;
                            updateLeadStatusMutation.mutate(
                                { id: leadId, status },
                                { onSettled: () => closeStatusMenu() }
                            );
                        }}
                        onClose={closeStatusMenu}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default LeadDashboard;
