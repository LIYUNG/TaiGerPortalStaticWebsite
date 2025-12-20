import { Navigate, useNavigate, Link as LinkDom } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
    CircularProgress,
    Avatar,
    IconButton,
    Tooltip,
    Popover,
    TextField,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    Archive as ArchiveIcon,
    ArrowDropDown as ArrowDropDownIcon,
    Unarchive as UnarchiveIcon,
    PersonRemove as PersonRemoveIcon,
    PersonAdd as PersonAddIcon,
    SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';

import { is_TaiGer_role } from '@taiger-common/core';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';

import { getCRMMeetingsQuery, getCRMLeadsQuery } from '../../api/query';
import { updateCRMMeeting, instantInviteTA } from '../../api';
import { useSnackBar } from '../../contexts/use-snack-bar';

import { sanitizeMeetingTitle } from './components/meetingUtils';

const MeetingPage = () => {
    const { t } = useTranslation();
    TabTitle(
        `${t('breadcrumbs.crm', { ns: 'crm' })} - ${t('breadcrumbs.meetings', { ns: 'crm' })}`
    );
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [assignMenuAnchor, setAssignMenuAnchor] = useState(null);
    const [selectedMeetingId, setSelectedMeetingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    });

    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const [openInviteDialog, setOpenInviteDialog] = useState(false);
    const [inviteTitle, setInviteTitle] = useState('');
    const [inviteLink, setInviteLink] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    const handleInstantInvite = async () => {
        setIsInviting(true);
        try {
            const { data } = await instantInviteTA(inviteTitle, inviteLink);
            setOpenInviteDialog(false);
            setInviteTitle('');
            setInviteLink('');
            if (data.success) {
                setMessage(t('meetings.invitationSentSuccess', { ns: 'crm' }));
                setSeverity('success');
                setOpenSnackbar(true);
            } else {
                setMessage(
                    t('meetings.failedToInviteTA', { ns: 'crm' }) +
                        (data.message ||
                            t('meetings.unknownError', { ns: 'crm' }))
                );
                setSeverity('error');
            }
            setOpenSnackbar(true);
        } catch (error) {
            console.error('Failed to invite:', error);
            setMessage(t('meetings.failedToSendInvitation', { ns: 'crm' }));
            setSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setIsInviting(false);
        }
    };

    const { user } = useAuth();
    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { data, isLoading } = useQuery(getCRMMeetingsQuery());
    const { data: leadsData } = useQuery(getCRMLeadsQuery());

    const handleMeetingUpdate = async (meetingId, payload) => {
        try {
            // Optimistic update - immediately update the cache
            queryClient.setQueryData(['crm/meetings'], (oldData) => {
                if (!oldData?.data?.data) return oldData;

                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        data: oldData.data.data.map((meeting) =>
                            meeting.id === meetingId
                                ? { ...meeting, ...payload }
                                : meeting
                        )
                    }
                };
            });

            // Make the API call
            await updateCRMMeeting(meetingId, payload);

            // Refresh data from server to ensure consistency
            await queryClient.invalidateQueries({
                queryKey: ['crm/meetings'],
                exact: true
            });
        } catch (error) {
            console.error('Failed to update meeting:', error);

            // Revert optimistic update on error
            await queryClient.invalidateQueries({
                queryKey: ['crm/meetings'],
                exact: true
            });

            // You might want to show an error message to the user here
            // Example: setError('Failed to update meeting. Please try again.');
        }
    };

    const handleAssignClick = (event, meetingId) => {
        event.stopPropagation();
        event.preventDefault();

        // Store the current button position
        const buttonRect = event.currentTarget.getBoundingClientRect();
        const virtualAnchor = {
            getBoundingClientRect: () => buttonRect,
            nodeType: 1
        };

        setAssignMenuAnchor(virtualAnchor);
        setSelectedMeetingId(meetingId);
        setSearchTerm(''); // Reset search when opening
    };

    const handleLeadSelect = async (leadId) => {
        if (selectedMeetingId) {
            // Optimistic update for lead assignment
            queryClient.setQueryData(['crm/meetings'], (oldData) => {
                if (!oldData?.data?.data) return oldData;

                const leadName = leadId
                    ? leads.find((lead) => lead.id === leadId)?.fullName
                    : null;

                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        data: oldData.data.data.map((meeting) =>
                            meeting.id === selectedMeetingId
                                ? {
                                      ...meeting,
                                      leadId: leadId,
                                      leadFullName: leadName
                                  }
                                : meeting
                        )
                    }
                };
            });

            // Close popover immediately for better UX
            setAssignMenuAnchor(null);
            setSelectedMeetingId(null);
            setSearchTerm('');

            try {
                await updateCRMMeeting(selectedMeetingId, { leadId });

                // Refresh to ensure consistency
                await queryClient.invalidateQueries({
                    queryKey: ['crm/meetings'],
                    exact: true
                });
            } catch (error) {
                console.error('Failed to assign lead:', error);

                // Revert on error
                await queryClient.invalidateQueries({
                    queryKey: ['crm/meetings'],
                    exact: true
                });
            }
        } else {
            // Original close logic if no meeting selected
            setAssignMenuAnchor(null);
            setSelectedMeetingId(null);
            setSearchTerm('');
        }
    };

    const handleMenuClose = () => {
        setAssignMenuAnchor(null);
        setSelectedMeetingId(null);
        setSearchTerm('');
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Separate meetings into active and archived
    const allMeetings = data?.data?.data || [];
    const nonArchivedMeetings = allMeetings.filter(
        (meeting) => !meeting.isArchived
    );
    const archivedMeetings = allMeetings.filter(
        (meeting) => meeting.isArchived
    );
    const unassignedMeetings = allMeetings.filter(
        (meeting) => !meeting.isArchived && !meeting.leadId
    );
    const leads = leadsData?.data?.data || [];

    // Select current meetings based on active tab
    const currentMeetings =
        activeTab === 0
            ? nonArchivedMeetings
            : activeTab === 1
              ? unassignedMeetings
              : archivedMeetings;

    // Filter leads based on search term
    const filteredLeads = leads.filter(
        (lead) =>
            (lead.fullName || '')
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getColumns = (isArchived = false) => [
        {
            accessorKey: 'date',
            header: t('common.datetime', { ns: 'crm' }),
            size: 80,
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
            accessorKey: 'title',
            header: t('meetings.meetingTitle', { ns: 'crm' }),
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
                    {sanitizeMeetingTitle(row.original.title) || 'N/A'}
                </Link>
            )
        },
        {
            accessorKey: 'summary.gist',
            header: t('common.summary', { ns: 'crm' }),
            size: 350,
            minSize: 200,
            maxSize: 400,
            grow: true,
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
                        {gist || t('common.noSummary', { ns: 'crm' })}
                    </Typography>
                );
            }
        },

        {
            accessorKey: 'leadFullName',
            header: t('common.lead', { ns: 'crm' }),
            size: 150,
            Cell: ({ row }) => {
                const { leadId, leadFullName } = row.original;
                return leadId ? (
                    <Link
                        component={LinkDom}
                        onClick={(e) => e.stopPropagation()}
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
                            <Typography>
                                {leadFullName || t('common.na', { ns: 'crm' })}
                            </Typography>
                        </Stack>
                    </Link>
                ) : (
                    <Chip
                        color="warning"
                        label={t('common.noLeadAssigned', { ns: 'crm' })}
                        size="small"
                        variant="outlined"
                    />
                );
            }
        },
        {
            accessorKey: 'actions',
            header: '',
            size: 300,
            enableSorting: false,
            enableColumnActions: false,
            Cell: ({ row }) => {
                const { leadId } = row.original;
                return (
                    <Stack direction="row" spacing={1}>
                        <Tooltip
                            title={
                                isArchived
                                    ? t('actions.unarchive', { ns: 'crm' })
                                    : t('actions.archive', { ns: 'crm' })
                            }
                        >
                            <IconButton
                                color={isArchived ? 'success' : 'warning'}
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    await handleMeetingUpdate(row.original.id, {
                                        isArchived: !isArchived
                                    });
                                }}
                                size="small"
                            >
                                {isArchived ? (
                                    <UnarchiveIcon />
                                ) : (
                                    <ArchiveIcon />
                                )}
                            </IconButton>
                        </Tooltip>
                        {!isArchived && (
                            <Tooltip
                                title={
                                    leadId
                                        ? t('actions.change', { ns: 'crm' })
                                        : t('actions.assign', { ns: 'crm' })
                                }
                            >
                                <Button
                                    endIcon={<ArrowDropDownIcon />}
                                    onClick={(e) =>
                                        handleAssignClick(e, row.original.id)
                                    }
                                    size="small"
                                    startIcon={
                                        leadId ? (
                                            <SwapHorizIcon />
                                        ) : (
                                            <PersonAddIcon />
                                        )
                                    }
                                    sx={{ borderRadius: 2 }}
                                    variant={leadId ? 'outlined' : 'contained'}
                                >
                                    {leadId
                                        ? t('actions.change', { ns: 'crm' })
                                        : t('actions.assign', { ns: 'crm' })}
                                </Button>
                            </Tooltip>
                        )}
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
                    {t('breadcrumbs.crm', { ns: 'crm' })}
                </Link>
                <Typography>
                    {t('breadcrumbs.meetings', { ns: 'crm' })}
                </Typography>
            </Breadcrumbs>

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
                        {t('meetings.assignLeadToMeeting', { ns: 'crm' })}
                    </Typography>

                    {/* Search Input */}
                    <TextField
                        autoFocus
                        fullWidth
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('meetings.searchLeads', { ns: 'crm' })}
                        size="small"
                        sx={{ mb: 1 }}
                        value={searchTerm}
                    />

                    {/* Filtered Leads List */}
                    <List sx={{ maxHeight: 250, overflow: 'auto', p: 0 }}>
                        {/* Remove Assignment Option - Only show if meeting has a lead assigned */}
                        {(() => {
                            const currentMeeting = allMeetings.find(
                                (m) => m.id === selectedMeetingId
                            );
                            return currentMeeting?.leadId ? (
                                <>
                                    <ListItem disablePadding>
                                        <ListItemButton
                                            onClick={() =>
                                                handleLeadSelect(null)
                                            }
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
                                                primary={t('actions.unassign', {
                                                    ns: 'crm'
                                                })}
                                                primaryTypographyProps={{
                                                    fontWeight: 500,
                                                    color: 'error.main'
                                                }}
                                                secondary={t(
                                                    'meetings.unassignLead',
                                                    { ns: 'crm' }
                                                )}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                    {/* Divider - Only show if remove option is visible */}
                                    <Box sx={{ height: 8 }} />
                                </>
                            ) : null;
                        })()}

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
                                                lead.fullName ||
                                                t('leads.fullName', {
                                                    ns: 'crm'
                                                })
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
                                            ? t('common.noLeadsFound', {
                                                  ns: 'crm'
                                              })
                                            : t('common.noLeadsAvailable', {
                                                  ns: 'crm'
                                              })
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

            {/* Table Section with Tabs */}
            <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardContent sx={{ p: 0 }}>
                    <Box
                        sx={{
                            p: 2.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Box>
                            <Typography
                                color="text.primary"
                                fontWeight={600}
                                variant="h6"
                            >
                                {t('common.meetinTranscripts', { ns: 'crm' })}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                                {t('common.manageTranscripts', { ns: 'crm' })}
                            </Typography>
                        </Box>
                        <Button
                            onClick={() => setOpenInviteDialog(true)}
                            variant="contained"
                        >
                            {t('meetings.addTAToLiveMeeting', { ns: 'crm' })}
                        </Button>
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            onChange={handleTabChange}
                            sx={{ px: 2.5 }}
                            value={activeTab}
                        >
                            <Tab
                                label={`${t('meetings.allMeetings', { ns: 'crm' })} (${nonArchivedMeetings.length})`}
                                sx={{ textTransform: 'none', fontWeight: 500 }}
                            />
                            <Tab
                                label={`${t('meetings.unassignedMeetings', { ns: 'crm' })} (${unassignedMeetings.length})`}
                                sx={{ textTransform: 'none', fontWeight: 500 }}
                            />
                            <Tab
                                label={`${t('meetings.archivedMeetings', { ns: 'crm' })} (${archivedMeetings.length})`}
                                sx={{ textTransform: 'none', fontWeight: 500 }}
                            />
                        </Tabs>
                    </Box>

                    <MaterialReactTable
                        autoResetPageIndex={false}
                        columns={getColumns(activeTab === 2)}
                        data={currentMeetings}
                        enableColumnFilters={false}
                        enableGlobalFilter={false}
                        enableRowSelection={false}
                        muiTableBodyRowProps={({ row }) => ({
                            onClick: () => {
                                navigate(`/crm/meetings/${row.original.id}`);
                            },
                            sx: {
                                cursor: 'pointer'
                            }
                        })}
                        onPaginationChange={setPagination}
                        state={{
                            isLoading,
                            pagination
                        }}
                    />
                </CardContent>
            </Card>

            <Dialog
                onClose={() => setOpenInviteDialog(false)}
                open={openInviteDialog}
            >
                <DialogTitle>
                    {t('meetings.addTAToLiveMeetingTitle', { ns: 'crm' })}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label={t('meetings.meetingTitleLabel', { ns: 'crm' })}
                        margin="dense"
                        onChange={(e) => setInviteTitle(e.target.value)}
                        required
                        value={inviteTitle}
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label={t('meetings.meetingLinkLabel', { ns: 'crm' })}
                        margin="dense"
                        onChange={(e) => setInviteLink(e.target.value)}
                        required
                        type="url"
                        value={inviteLink}
                        variant="outlined"
                    />
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography sx={{ display: 'block' }} variant="body2">
                            {t('meetings.taJoinTimeInfo', { ns: 'crm' })}
                        </Typography>
                        <Typography sx={{ display: 'block' }} variant="body2">
                            {t('meetings.rateLimitInfo', { ns: 'crm' })}
                        </Typography>
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button
                        disabled={isInviting}
                        onClick={() => setOpenInviteDialog(false)}
                    >
                        {t('actions.cancel', { ns: 'crm' })}
                    </Button>
                    <Button
                        disabled={isInviting || !inviteTitle || !inviteLink}
                        endIcon={
                            isInviting ? <CircularProgress size={24} /> : null
                        }
                        onClick={handleInstantInvite}
                        variant="contained"
                    >
                        {t('actions.submit', { ns: 'crm' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MeetingPage;
