import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    Avatar,
    Stack
} from '@mui/material';
import {
    People as PeopleIcon,
    Email as EmailIcon,
    Source as SourceIcon,
    Schedule as ScheduleIcon,
    TrendingUp as TrendingUpIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { MaterialReactTable } from 'material-react-table';
import i18next from 'i18next';

import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { is_TaiGer_role } from '@taiger-common/core';
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

    // Calculate stats
    const totalLeads = leads.length;
    const todayLeads = leads.filter((lead) => {
        const today = new Date().toDateString();
        const leadDate = new Date(lead.createdAt).toDateString();
        return today === leadDate;
    }).length;

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
            accessorKey: 'email',
            header: 'Email',
            size: 250,
            Cell: ({ cell }) => (
                <Stack alignItems="center" direction="row" spacing={1}>
                    <EmailIcon color="action" fontSize="small" />
                    <Typography variant="body2">{cell.getValue()}</Typography>
                </Stack>
            )
        },
        {
            accessorKey: 'lineId',
            header: 'Line ID',
            size: 150,
            Cell: ({ cell }) =>
                cell.getValue() ? (
                    <Chip
                        color="info"
                        label={cell.getValue()}
                        size="small"
                        variant="outlined"
                    />
                ) : (
                    <Typography color="text.secondary" variant="body2">
                        -
                    </Typography>
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
            accessorKey: 'createdAt',
            header: 'Submitted At',
            size: 200,
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
        <Box data-testid="student_overview" sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
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
                    <Typography color="text.primary">
                        {i18next.t('Leads', { ns: 'common' })}
                    </Typography>
                </Breadcrumbs>

                <Typography
                    color="primary"
                    fontWeight="bold"
                    gutterBottom
                    variant="h4"
                >
                    Lead Management Dashboard
                </Typography>
                <Typography color="text.secondary" variant="body1">
                    Track and manage your leads efficiently
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item md={6} sm={6} xs={12}>
                    <Card
                        sx={{
                            background:
                                'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                            }
                        }}
                    >
                        <CardContent>
                            <Stack
                                alignItems="center"
                                direction="row"
                                justifyContent="space-between"
                            >
                                <Box>
                                    <Typography
                                        color="primary.main"
                                        fontWeight="bold"
                                        variant="h4"
                                    >
                                        {totalLeads}
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        fontWeight="medium"
                                        variant="body1"
                                    >
                                        Total Leads
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        bgcolor: 'primary.main',
                                        borderRadius: '50%',
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <PeopleIcon
                                        sx={{ fontSize: 32, color: 'white' }}
                                    />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item md={6} sm={6} xs={12}>
                    <Card
                        sx={{
                            background:
                                'linear-gradient(135deg, #fefcfb 0%, #fef2f2 100%)',
                            border: '1px solid #fecaca',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                            }
                        }}
                    >
                        <CardContent>
                            <Stack
                                alignItems="center"
                                direction="row"
                                justifyContent="space-between"
                            >
                                <Box>
                                    <Typography
                                        color="error.main"
                                        fontWeight="bold"
                                        variant="h4"
                                    >
                                        {todayLeads}
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        fontWeight="medium"
                                        variant="body1"
                                    >
                                        Today&apos;s Leads
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        bgcolor: 'error.main',
                                        borderRadius: '50%',
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <TrendingUpIcon
                                        sx={{ fontSize: 32, color: 'white' }}
                                    />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Main Table */}
            <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <CardContent>
                    <Typography gutterBottom sx={{ mb: 2 }} variant="h6">
                        Lead Details
                    </Typography>
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
