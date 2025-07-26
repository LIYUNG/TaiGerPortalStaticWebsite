import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
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
    Avatar,
    Stack,
    Tabs,
    Tab
} from '@mui/material';
import {
    Source as SourceIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    FiberManualRecord as StatusIcon,
    School as SchoolIcon,
    Timeline as DirectionIcon
} from '@mui/icons-material';

import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import { getCRMLeadsQuery } from '../../api/query';

const LeadDashboard = () => {
    TabTitle('CRM - Leads');
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);

    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMLeadsQuery());
    const allLeads = data?.data?.data || [];

    // Split leads based on status
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

    const getSourceColor = (source) => {
        const colors = {
            Website: 'primary',
            'Social Media': 'secondary',
            Referral: 'success',
            Advertisement: 'warning',
            Other: 'default'
        };
        return colors[source] || 'default';
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

    const columns = [
        {
            accessorKey: 'fullName',
            header: 'Full Name',
            size: 200,
            Cell: ({ cell }) => (
                <Stack alignItems="center" direction="row" spacing={2}>
                    <Avatar
                        sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                    >
                        <PersonIcon fontSize="small" />
                    </Avatar>
                    <Typography fontWeight="medium" variant="body2">
                        {cell.getValue()}
                    </Typography>
                </Stack>
            )
        },
        {
            accessorKey: 'intendedStartTime',
            header: 'Start Time',
            size: 150,
            Cell: ({ cell }) => (
                <Stack alignItems="center" direction="row" spacing={1}>
                    <ScheduleIcon color="action" fontSize="small" />
                    <Typography variant="body2">{cell.getValue()}</Typography>
                </Stack>
            )
        },
        {
            accessorKey: 'intendedProgramLevel',
            header: 'Intended Degree',
            size: 150,
            Cell: ({ cell }) => (
                <Stack alignItems="center" direction="row" spacing={1}>
                    <SchoolIcon color="action" fontSize="small" />
                    <Typography variant="body2">{cell.getValue()}</Typography>
                </Stack>
            )
        },
        {
            accessorKey: 'intendedDirection',
            header: 'Intended Direction',
            size: 350,
            minSize: 200,
            maxSize: 400,
            Cell: ({ cell }) => (
                <Stack alignItems="center" direction="row" spacing={1}>
                    <DirectionIcon color="action" fontSize="small" />
                    <Typography
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                        title={cell.getValue()}
                        variant="body2"
                    >
                        {cell.getValue()}
                    </Typography>
                </Stack>
            )
        },
        {
            accessorKey: 'source',
            header: 'Source',
            size: 150,
            Cell: ({ cell }) => (
                <Chip
                    color={getSourceColor(cell.getValue())}
                    icon={<SourceIcon fontSize="small" />}
                    label={cell.getValue()}
                    size="small"
                />
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 120,
            Cell: ({ cell }) => (
                <Chip
                    color={getStatusColor(cell.getValue())}
                    icon={<StatusIcon fontSize="small" />}
                    label={cell.getValue()}
                    size="small"
                    variant="outlined"
                />
            )
        },
        {
            accessorKey: 'createdAt',
            header: 'Submitted At',
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
                return openLeads;
            case 1:
                return contactedLeads;
            case 2:
                return convertedLeads;
            case 3:
                return closedLeads;
            default:
                return openLeads;
        }
    };

    const getTabTitle = () => {
        switch (tabValue) {
            case 0:
                return 'Open Leads';
            case 1:
                return 'Contacted Leads';
            case 2:
                return 'Converted Leads';
            case 3:
                return 'Closed Leads';
            default:
                return 'Open Leads';
        }
    };

    const getTabDescription = () => {
        switch (tabValue) {
            case 0:
                return 'Open leads submitted by users through the google survey.';
            case 1:
                return 'Contacted leads with scheduled meetings.';
            case 2:
                return 'Leads that have been Converted or completed.';
            case 3:
                return 'Leads that have been closed.';
            default:
                return 'Open leads submitted by users through the google survey.';
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
                    {i18next.t('CRM', { ns: 'common' })}
                </Link>
                <Typography>{i18next.t('Leads', { ns: 'common' })}</Typography>
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
                                label={`Open Leads (${openLeads.length})`}
                                sx={{ textTransform: 'none' }}
                            />
                            <Tab
                                label={`Contacted Leads (${contactedLeads.length})`}
                                sx={{ textTransform: 'none' }}
                            />
                            <Tab
                                label={`Converted Leads (${convertedLeads.length})`}
                                sx={{ textTransform: 'none' }}
                            />
                            <Tab
                                label={`Closed Leads (${closedLeads.length})`}
                                sx={{ textTransform: 'none' }}
                            />
                        </Tabs>
                    </Box>

                    <MaterialReactTable
                        columns={columns}
                        data={getCurrentLeads()}
                        muiTableBodyRowProps={({ row }) => ({
                            onClick: () => {
                                navigate(`/crm/leads/${row.original.id}`);
                            },
                            sx: {
                                cursor: 'pointer'
                            }
                        })}
                        state={{ isLoading }}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default LeadDashboard;
