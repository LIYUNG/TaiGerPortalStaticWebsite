import { Navigate, useNavigate, Link as LinkDom } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import i18next from 'i18next';
import { MaterialReactTable } from 'material-react-table';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Button,
    Stack,
    Card,
    CardContent,
    Chip,
    Avatar,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Person as PersonIcon,
    PersonAdd as PersonAddIcon,
    Archive as ArchiveIcon
} from '@mui/icons-material';

import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import { getCRMMeetingsQuery } from '../../api/query';

const MeetingPage = () => {
    TabTitle('CRM - Meetings');
    const navigate = useNavigate();

    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMMeetingsQuery());
    const meetings = data?.data?.data || [];

    const columns = [
        {
            accessorKey: 'leadFullName',
            header: 'Lead',
            size: 150,
            Cell: ({ row }) => {
                const { leadId, leadFullName } = row.original;
                return leadId ? (
                    <Link
                        component={LinkDom}
                        sx={{
                            cursor: 'pointer',
                            fontWeight: 500,
                            color: 'primary.main',
                            '&:hover': { color: 'primary.dark' }
                        }}
                        to={`/crm/leads/${leadId}`}
                        underline="hover"
                    >
                        <Stack alignItems="center" direction="row" spacing={1}>
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: 'primary.main'
                                }}
                            >
                                <PersonIcon fontSize="small" />
                            </Avatar>
                            <Typography>{leadFullName || 'N/A'}</Typography>
                        </Stack>
                    </Link>
                ) : (
                    <Chip
                        color="warning"
                        label="No Lead Assigned"
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
        {
            accessorKey: 'title',
            header: 'Meeting Title',
            size: 250,
            Cell: ({ row }) => (
                <Link
                    component={LinkDom}
                    sx={{
                        cursor: 'pointer',
                        fontWeight: 500,
                        color: 'text.primary',
                        '&:hover': { color: 'primary.main' }
                    }}
                    to={`/crm/meetings/${row.original.id}`}
                    underline="hover"
                >
                    {row.original.title || 'Untitled Meeting'}
                </Link>
            )
        },
        {
            accessorKey: 'summary.gist',
            header: 'Summary',
            size: 300,
            Cell: ({ row }) => {
                const gist = row.original.summary?.gist;
                return (
                    <Typography
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                        variant="body2"
                    >
                        {gist || 'No summary available'}
                    </Typography>
                );
            }
        },
        {
            accessorKey: 'date',
            header: 'Datetime',
            size: 200,
            Cell: ({ cell }) => {
                const date = new Date(cell.getValue());
                return (
                    <Box>
                        <Typography fontWeight={500} variant="body2">
                            {date.toLocaleDateString()}
                        </Typography>
                        <Typography color="text.secondary" variant="caption">
                            {date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            size: 300,
            enableSorting: false,
            Cell: ({ row }) => {
                const { leadId } = row.original;
                return (
                    <Stack direction="row" spacing={1}>
                        {!leadId && (
                            <>
                                <Tooltip title="Assign to existing lead">
                                    <Button
                                        color="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            alert(
                                                'Assign to Existing Lead clicked (Not yet implemented)'
                                            );
                                        }}
                                        size="small"
                                        startIcon={<PersonIcon />}
                                        sx={{ borderRadius: 2 }}
                                        variant="outlined"
                                    >
                                        Assign
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Create new lead">
                                    <Button
                                        color="success"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            alert(
                                                'Create New Lead clicked (Not yet implemented)'
                                            );
                                        }}
                                        size="small"
                                        startIcon={<PersonAddIcon />}
                                        sx={{ borderRadius: 2 }}
                                        variant="outlined"
                                    >
                                        Create
                                    </Button>
                                </Tooltip>
                            </>
                        )}
                        <Tooltip title="Archive meeting">
                            <IconButton
                                color="warning"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    alert(
                                        'Archive clicked (Not yet implemented)'
                                    );
                                }}
                                size="small"
                            >
                                <ArchiveIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            }
        }
    ];

    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                <Link
                    color="inherit"
                    component="a"
                    href={`${DEMO.DASHBOARD_LINK}`}
                    sx={{ fontWeight: 500 }}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Link
                    color="inherit"
                    component="a"
                    href={`${DEMO.DASHBOARD_LINK}`}
                    sx={{ fontWeight: 500 }}
                    underline="hover"
                >
                    {i18next.t('CRM', { ns: 'common' })}
                </Link>
                <Typography>
                    {i18next.t('Meetings', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            {/* Table Section */}
            <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2.5 }}>
                        <Typography
                            color="text.primary"
                            fontWeight={600}
                            variant="h6"
                        >
                            Meeting Transcripts
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            Manage and review all meeting summaries and
                            transcripts
                        </Typography>
                    </Box>
                    <Divider />
                    <MaterialReactTable
                        columns={columns}
                        data={meetings}
                        initialState={{
                            pagination: { pageSize: 10 }
                        }}
                        muiTableBodyRowProps={({ row }) => ({
                            onClick: () => {
                                navigate(`/crm/meetings/${row.original.id}`);
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

export default MeetingPage;
