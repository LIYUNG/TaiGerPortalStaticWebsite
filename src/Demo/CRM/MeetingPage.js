import { useParams, Navigate, Link as LinkDom } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    List,
    ListItem,
    ListItemText,
    Button,
    Stack,
    IconButton,
    Tooltip,
    Popover,
    TextField,
    ListItemButton,
    ListItemAvatar,
    Avatar
} from '@mui/material';
import {
    AccessTime,
    Person,
    VideoCall,
    CalendarToday,
    Archive as ArchiveIcon,
    Unarchive as UnarchiveIcon,
    PersonAdd as PersonAddIcon,
    PersonRemove as PersonRemoveIcon,
    SwapHoriz as SwapHorizIcon,
    ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';

import DEMO from '../../store/constant';
import { TabTitle } from '../Utils/TabTitle';
import Loading from '../../components/Loading/Loading';
import { useAuth } from '../../components/AuthProvider';
import { is_TaiGer_role } from '@taiger-common/core';
import { appConfig } from '../../config';
import { getCRMMeetingQuery, getCRMLeadsQuery } from '../../api/query';
import { updateCRMMeeting } from '../../api';

const MeetingPage = () => {
    TabTitle('CRM - Meeting Details');
    const { meetingId } = useParams();
    const queryClient = useQueryClient();
    const [assignMenuAnchor, setAssignMenuAnchor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMMeetingQuery(meetingId));
    const { data: leadsData } = useQuery(getCRMLeadsQuery());
    const meeting = data?.data?.data || {};
    const leads = leadsData?.data?.data || [];

    const handleMeetingUpdate = async (payload) => {
        try {
            await updateCRMMeeting(meetingId, payload);
            await queryClient.refetchQueries({
                queryKey: ['crm/meeting', meetingId],
                exact: true
            });
        } catch (error) {
            console.error('Failed to update meeting:', error);
        }
    };

    const handleAssignClick = (event) => {
        event.stopPropagation();
        event.preventDefault();

        const buttonRect = event.currentTarget.getBoundingClientRect();
        const virtualAnchor = {
            getBoundingClientRect: () => buttonRect,
            nodeType: 1
        };

        setAssignMenuAnchor(virtualAnchor);
        setSearchTerm('');
    };

    const handleLeadSelect = async (leadId) => {
        await handleMeetingUpdate({ leadId });
        setAssignMenuAnchor(null);
        setSearchTerm('');
    };

    const handleMenuClose = () => {
        setAssignMenuAnchor(null);
        setSearchTerm('');
    };

    const filteredLeads = leads.filter(
        (lead) =>
            (lead.fullName || '')
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1.5 }}>
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
                        href="/crm"
                        underline="hover"
                    >
                        CRM
                    </Link>
                    <Link
                        color="inherit"
                        component="a"
                        href="/crm/meetings"
                        underline="hover"
                    >
                        Meetings
                    </Link>
                    <Typography color="text.primary">
                        {meeting.title}
                    </Typography>
                </Breadcrumbs>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography color="primary" fontWeight="bold" variant="h5">
                        Meeting Details
                    </Typography>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1}>
                        <Tooltip
                            title={
                                meeting.isArchived
                                    ? 'Unarchive meeting'
                                    : 'Archive meeting'
                            }
                        >
                            <IconButton
                                color={
                                    meeting.isArchived ? 'success' : 'warning'
                                }
                                onClick={() =>
                                    handleMeetingUpdate({
                                        isArchived: !meeting.isArchived
                                    })
                                }
                                size="small"
                            >
                                {meeting.isArchived ? (
                                    <UnarchiveIcon />
                                ) : (
                                    <ArchiveIcon />
                                )}
                            </IconButton>
                        </Tooltip>

                        <Tooltip
                            title={
                                meeting.leadId
                                    ? 'Change or remove lead assignment'
                                    : 'Assign to existing lead'
                            }
                        >
                            <Button
                                endIcon={<ArrowDropDownIcon />}
                                onClick={handleAssignClick}
                                size="small"
                                startIcon={
                                    meeting.leadId ? (
                                        <SwapHorizIcon />
                                    ) : (
                                        <PersonAddIcon />
                                    )
                                }
                                sx={{ borderRadius: 2 }}
                                variant={
                                    meeting.leadId ? 'outlined' : 'contained'
                                }
                            >
                                {meeting.leadId ? 'Change' : 'Assign'}
                            </Button>
                        </Tooltip>
                    </Stack>
                </Box>
            </Box>

            {/* Lead Assignment Popover with Search */}
            <Popover
                anchorEl={assignMenuAnchor}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
                onClose={handleMenuClose}
                open={Boolean(assignMenuAnchor)}
                slotProps={{
                    paper: {
                        sx: {
                            minWidth: 320,
                            maxWidth: 400,
                            maxHeight: 400
                        }
                    }
                }}
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
                        {/* Remove Assignment Option - Only show if meeting has a lead assigned */}
                        {meeting.leadId && (
                            <>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => handleLeadSelect(null)}
                                        sx={{
                                            borderRadius: 1,
                                            backgroundColor: 'error.50',
                                            '&:hover': {
                                                backgroundColor: 'error.100'
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: 'error.main'
                                                }}
                                            >
                                                <PersonRemoveIcon fontSize="small" />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary="Remove Assignment"
                                            primaryTypographyProps={{
                                                fontWeight: 500,
                                                color: 'error.main'
                                            }}
                                            secondary="Unassign lead from this meeting"
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <Box sx={{ height: 8 }} />
                            </>
                        )}

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
                                                <Person fontSize="small" />
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

            {meeting && Object.keys(meeting).length > 0 ? (
                <Grid container spacing={3}>
                    {/* Meeting Overview */}
                    <Grid item md={8} xs={12}>
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography gutterBottom variant="h6">
                                    Meeting Overview
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2
                                    }}
                                >
                                    <CalendarToday
                                        sx={{ mr: 1, color: 'primary.main' }}
                                    />
                                    <Typography variant="body1">
                                        {formatDate(meeting.date)}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2
                                    }}
                                >
                                    <AccessTime
                                        sx={{ mr: 1, color: 'primary.main' }}
                                    />
                                    <Typography variant="body1">
                                        Duration:{' '}
                                        {formatDuration(meeting.duration)}
                                    </Typography>
                                </Box>
                                {meeting.transcriptUrl && (
                                    <Button
                                        href={meeting.transcriptUrl}
                                        startIcon={<VideoCall />}
                                        sx={{ mt: 1 }}
                                        target="_blank"
                                        variant="outlined"
                                    >
                                        View Transcript
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Meeting Summary */}
                        {meeting.summary && (
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography gutterBottom variant="h6">
                                        Meeting Summary
                                    </Typography>

                                    {meeting.summary.gist && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography
                                                fontWeight="bold"
                                                gutterBottom
                                                variant="subtitle1"
                                            >
                                                Gist
                                            </Typography>
                                            <Typography variant="body2">
                                                {meeting.summary.gist}
                                            </Typography>
                                        </Box>
                                    )}

                                    {meeting.summary.keywords && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography
                                                fontWeight="bold"
                                                gutterBottom
                                                variant="subtitle1"
                                            >
                                                Keywords
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: 1
                                                }}
                                            >
                                                {meeting.summary.keywords.map(
                                                    (keyword, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={keyword}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )
                                                )}
                                            </Box>
                                        </Box>
                                    )}

                                    {meeting.summary.overview && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography
                                                fontWeight="bold"
                                                gutterBottom
                                                variant="subtitle1"
                                            >
                                                Overview
                                            </Typography>
                                            <Typography
                                                sx={{ whiteSpace: 'pre-line' }}
                                                variant="body2"
                                            >
                                                {meeting.summary.overview}
                                            </Typography>
                                        </Box>
                                    )}

                                    {meeting.summary.action_items && (
                                        <Box>
                                            <Typography
                                                fontWeight="bold"
                                                gutterBottom
                                                variant="subtitle1"
                                            >
                                                Action Items
                                            </Typography>
                                            <Typography
                                                sx={{ whiteSpace: 'pre-line' }}
                                                variant="body2"
                                            >
                                                {meeting.summary.action_items}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </Grid>

                    {/* Participants & Speakers */}
                    <Grid item md={4} xs={12}>
                        {/* Lead Details */}
                        {meeting.leadId && (
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography gutterBottom variant="h6">
                                        Assigned Lead
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2
                                        }}
                                    >
                                        <Link
                                            component={LinkDom}
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                color: 'primary.main',
                                                '&:hover': {
                                                    color: 'primary.dark'
                                                }
                                            }}
                                            to={`/crm/leads/${meeting.leadId}`}
                                            underline="hover"
                                        >
                                            <Stack
                                                alignItems="center"
                                                direction="row"
                                                spacing={1}
                                            >
                                                <Person
                                                    sx={{
                                                        mr: 1,
                                                        color: 'primary.main'
                                                    }}
                                                />
                                                <Typography variant="body1">
                                                    {meeting.leadFullName ||
                                                        'Lead Name'}
                                                </Typography>
                                            </Stack>
                                        </Link>
                                    </Box>
                                    {meeting.leadEmail && (
                                        <Typography
                                            color="text.secondary"
                                            variant="body2"
                                        >
                                            {meeting.leadEmail}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Speakers */}
                        {meeting.speakers && meeting.speakers.length > 0 && (
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography gutterBottom variant="h6">
                                        Speakers
                                    </Typography>
                                    <List dense>
                                        {meeting.speakers.map((speaker) => (
                                            <ListItem
                                                key={speaker.id}
                                                sx={{ px: 0 }}
                                            >
                                                <Person
                                                    sx={{
                                                        mr: 1,
                                                        color: 'primary.main'
                                                    }}
                                                />
                                                <ListItemText
                                                    primary={speaker.name}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        )}

                        {/* Meeting Attendees */}
                        {meeting.meetingAttendees &&
                            meeting.meetingAttendees.length > 0 && (
                                <Card sx={{ mb: 3 }}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h6">
                                            Attendees
                                        </Typography>
                                        <List dense>
                                            {meeting.meetingAttendees.map(
                                                (attendee, index) => (
                                                    <ListItem
                                                        key={index}
                                                        sx={{ px: 0 }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                attendee.displayName ||
                                                                attendee.name ||
                                                                attendee.email
                                                            }
                                                            secondary={
                                                                attendee.email !==
                                                                (attendee.displayName ||
                                                                    attendee.name)
                                                                    ? attendee.email
                                                                    : null
                                                            }
                                                        />
                                                    </ListItem>
                                                )
                                            )}
                                        </List>
                                    </CardContent>
                                </Card>
                            )}
                    </Grid>
                </Grid>
            ) : (
                <Typography color="text.secondary" variant="body1">
                    Loading meeting details...
                </Typography>
            )}
        </Box>
    );
};

export default MeetingPage;
