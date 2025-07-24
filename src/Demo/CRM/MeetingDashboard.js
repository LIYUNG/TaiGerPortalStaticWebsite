import { Navigate, useNavigate, Link as LinkDom } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import i18next from 'i18next';
import { MaterialReactTable } from 'material-react-table';
import { useState } from 'react';
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
    Tooltip,
    Popover,
    TextField,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar
} from '@mui/material';
import {
    Person as PersonIcon,
    Archive as ArchiveIcon,
    ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';

import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import { getCRMMeetingsQuery, getCRMLeadsQuery } from '../../api/query';
import { updateCRMMeeting } from '../../api';

const MeetingPage = () => {
    TabTitle('CRM - Meetings');
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [assignMenuAnchor, setAssignMenuAnchor] = useState(null);
    const [selectedMeetingId, setSelectedMeetingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMMeetingsQuery());
    const { data: leadsData } = useQuery(getCRMLeadsQuery());

    const handleMeetingUpdate = async (meetingId, payload) => {
        try {
            await updateCRMMeeting(meetingId, payload);
            queryClient.invalidateQueries({ queryKey: ['crm/meetings'] });
        } catch (error) {
            console.error('Failed to update meeting:', error);
        }
    };

    const handleAssignClick = (event, meetingId) => {
        event.stopPropagation();
        event.preventDefault();
        setAssignMenuAnchor(event.currentTarget);
        setSelectedMeetingId(meetingId);
        setSearchTerm(''); // Reset search when opening
    };

    const handleLeadSelect = async (leadId) => {
        if (selectedMeetingId && leadId) {
            await handleMeetingUpdate(selectedMeetingId, { leadId });
        }
        setAssignMenuAnchor(null);
        setSelectedMeetingId(null);
        setSearchTerm('');
    };

    const handleMenuClose = () => {
        setAssignMenuAnchor(null);
        setSelectedMeetingId(null);
        setSearchTerm('');
    };

    // Filter out archived meetings for display
    const meetings =
        data?.data?.data?.filter((meeting) => !meeting.isArchived) || [];
    const leads = leadsData?.data?.data || [];

    // Filter leads based on search term
    const filteredLeads = leads.filter(
        (lead) =>
            (lead.fullName || '')
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            <Tooltip title="Assign to existing lead">
                                <Button
                                    color="primary"
                                    endIcon={<ArrowDropDownIcon />}
                                    onClick={(e) =>
                                        handleAssignClick(e, row.original.id)
                                    }
                                    size="small"
                                    startIcon={<PersonIcon />}
                                    sx={{ borderRadius: 2 }}
                                    variant="outlined"
                                >
                                    Assign
                                </Button>
                            </Tooltip>
                        )}
                        <Tooltip title="Archive meeting">
                            <IconButton
                                color="warning"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    await handleMeetingUpdate(row.original.id, {
                                        isArchived: true
                                    });
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

            {/* Lead Assignment Popover with Search */}
            <Popover
                PaperProps={{
                    sx: {
                        minWidth: 320,
                        maxWidth: 400,
                        maxHeight: 400
                    }
                }}
                anchorEl={assignMenuAnchor}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                onClose={handleMenuClose}
                open={Boolean(assignMenuAnchor)}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography sx={{ mb: 2 }} variant="h6">
                        Assign Lead to Meeting
                    </Typography>

                    {/* Search Input */}
                    <TextField
                        autoFocus
                        fullWidth
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search leads by name or email..."
                        size="small"
                        sx={{ mb: 1 }}
                        value={searchTerm}
                    />

                    {/* Filtered Leads List */}
                    <List sx={{ maxHeight: 250, overflow: 'auto', p: 0 }}>
                        {filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                                <ListItem disablePadding key={lead.id}>
                                    <ListItemButton
                                        onClick={() =>
                                            handleLeadSelect(lead.id)
                                        }
                                        sx={{ borderRadius: 1 }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: 'primary.main'
                                                }}
                                            >
                                                <PersonIcon fontSize="small" />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                lead.fullName || 'Unnamed Lead'
                                            }
                                            primaryTypographyProps={{
                                                fontWeight: 500
                                            }}
                                            secondary={lead.email || ''}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText
                                    primary={
                                        searchTerm
                                            ? 'No leads found'
                                            : 'No leads available'
                                    }
                                    sx={{
                                        textAlign: 'center',
                                        color: 'text.secondary'
                                    }}
                                />
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Popover>

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
