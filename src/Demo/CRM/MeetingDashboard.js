import { useEffect, useState } from 'react';
import { Navigate, Link as LinkDom } from 'react-router-dom';
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
    Archive as ArchiveIcon,
    MeetingRoom as MeetingRoomIcon,
    CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import { request } from '../../api/request';

const MeetingPage = () => {
    const { user } = useAuth();

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const [transcripts, setTranscripts] = useState([]);

    useEffect(() => {
        request
            .get('/api/crm/meetings')
            .then((data) => {
                setTranscripts(data?.data?.data || []);
            })
            .catch((error) => {
                console.error('Failed to fetch transcripts:', error);
            });
    }, []);

    TabTitle('Meetings');

    const columns = [
        {
            accessorKey: 'leadFullName',
            header: 'Lead',
            size: 150,
            Cell: ({ row }) =>
                row.original.leadId ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main'
                            }}
                        >
                            <PersonIcon fontSize="small" />
                        </Avatar>
                        <Link
                            component={LinkDom}
                            sx={{
                                cursor: 'pointer',
                                fontWeight: 500,
                                color: 'primary.main',
                                '&:hover': { color: 'primary.dark' }
                            }}
                            to={`/crm/leads/${row.original.leadId}`}
                            underline="hover"
                        >
                            {row.original.leadFullName || ''}
                        </Link>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                            <PersonIcon fontSize="small" />
                        </Avatar>
                        <Chip
                            color="warning"
                            label="No Lead Assigned"
                            size="small"
                            variant="outlined"
                        />
                    </Box>
                )
        },
        {
            accessorKey: 'title',
            header: 'Meeting Title',
            size: 250,
            Cell: ({ row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MeetingRoomIcon color="action" fontSize="small" />
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
                </Box>
            )
        },
        {
            accessorKey: 'date',
            header: 'Date & Time',
            size: 200,
            Cell: ({ cell }) => {
                const date = new Date(cell.getValue());
                const isRecent =
                    Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon color="action" fontSize="small" />
                        <Box>
                            <Typography fontWeight={500} variant="body2">
                                {date.toLocaleDateString()}
                            </Typography>
                            <Typography
                                color="text.secondary"
                                variant="caption"
                            >
                                {date.toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Typography>
                            {isRecent && (
                                <Chip
                                    color="success"
                                    label="Recent"
                                    size="small"
                                    sx={{ ml: 1, height: 16 }}
                                />
                            )}
                        </Box>
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
                const leadId = row.original.leadId;
                return (
                    <Stack direction="row" spacing={1}>
                        {!leadId && (
                            <>
                                <Tooltip title="Assign to existing lead">
                                    <Button
                                        color="primary"
                                        onClick={() =>
                                            alert(
                                                'Assign to Existing Lead clicked'
                                            )
                                        }
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
                                        onClick={() =>
                                            alert('Create New Lead clicked')
                                        }
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
                                onClick={() => alert('Archive clicked')}
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
                        data={transcripts}
                        initialState={{
                            density: 'comfortable',
                            pagination: { pageSize: 10 }
                        }}
                        muiTablePaperProps={{
                            elevation: 0,
                            sx: { borderRadius: 0 }
                        }}
                        muiTableProps={{
                            sx: {
                                '& .MuiTableHead-root': {
                                    '& .MuiTableCell-head': {
                                        fontWeight: 600,
                                        color: 'text.primary'
                                    }
                                },
                                '& .MuiTableBody-root': {
                                    '& .MuiTableRow-root:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }
                            }
                        }}
                        positionToolbarAlertBanner="bottom"
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default MeetingPage;
