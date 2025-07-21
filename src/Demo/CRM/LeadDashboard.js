import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import i18next from 'i18next';
import { MaterialReactTable } from 'material-react-table';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Card,
    CardContent,
    Chip,
    Divider,
    Avatar,
    Stack
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

import { request } from '../../api/request';

const LeadDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        request
            .get('/api/crm/leads')
            .then((data) => {
                setLeads(data?.data?.data || []);
            })
            .catch((error) => {
                console.error('Failed to fetch leads:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

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
            new: 'info',
            contacted: 'warning',
            qualified: 'success',
            converted: 'primary',
            lost: 'error'
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
            accessorKey: 'intendedProgramLevel',
            header: 'Program Level',
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
            size: 250,
            Cell: ({ cell }) => (
                <Stack alignItems="center" direction="row" spacing={1}>
                    <DirectionIcon color="action" fontSize="small" />
                    <Typography
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px'
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

    TabTitle(i18next.t('Leads', { ns: 'common' }));

    return (
        <Box>
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
                <Typography>{i18next.t('Leads', { ns: 'common' })}</Typography>
            </Breadcrumbs>

            {/* Main Table */}
            <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2 }}>
                        <Typography
                            color="text.primary"
                            fontWeight={600}
                            variant="h6"
                        >
                            Lead Details
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            Leads submitted by users through the google survey.
                        </Typography>
                    </Box>
                    <Divider />
                    <Typography gutterBottom variant="h6" />
                    <MaterialReactTable
                        columns={columns}
                        data={leads}
                        enableColumnFilterChangeMode
                        enablePagination
                        enableSorting
                        initialState={{
                            pagination: { pageSize: 10 }
                        }}
                        muiTableBodyRowProps={({ row }) => ({
                            onClick: () => {
                                navigate(`/crm/leads/${row.original.id}`);
                            },
                            sx: {
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }
                            }
                        })}
                        muiTableHeadCellProps={{
                            sx: {
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                fontWeight: 'bold'
                            }
                        }}
                        muiTablePaperProps={{
                            elevation: 0,
                            sx: {
                                border: 'none'
                            }
                        }}
                        state={{ isLoading }}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default LeadDashboard;
