import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Card,
    Chip,
    Grid,
    Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../components/AuthProvider';
import {
    getEvents,
    postEvent,
    updateEvent,
    confirmEvent,
    deleteEvent
} from '../../api';
import { MeetingList } from './Meetings/MeetingList';
import { MeetingFormModal } from './Meetings/MeetingFormModal';
import { ConfirmationModal } from '../../components/Modal/ConfirmationModal';
import PropTypes from 'prop-types';

// Helper function to transform Event data to Meeting display format
const transformEventToMeeting = (event) => {
    const isPast = new Date(event.start) < new Date();
    const isConfirmed = event.isConfirmedRequester && event.isConfirmedReceiver;
    const agent =
        event.receiver_id && Array.isArray(event.receiver_id)
            ? event.receiver_id[0]
            : event.receiver_id;
    const student =
        event.requester_id && Array.isArray(event.requester_id)
            ? event.requester_id[0]
            : event.requester_id;

    return {
        _id: event._id,
        title: event.title || event.description?.substring(0, 50) || 'Meeting',
        dateTime: event.start,
        endTime: event.end,
        description: event.description,
        location: event.meetingLink ? 'Online' : 'TBD',
        meetingLink: event.meetingLink,
        isConfirmed,
        isConfirmedRequester: event.isConfirmedRequester,
        isConfirmedReceiver: event.isConfirmedReceiver,
        agent: agent
            ? {
                  _id: agent._id || agent,
                  firstname: agent.firstname,
                  lastname: agent.lastname
              }
            : null,
        student: student
            ? {
                  _id: student._id || student,
                  firstname: student.firstname,
                  lastname: student.lastname
              }
            : null,
        attended: isPast && isConfirmed,
        isPast
    };
};

// Filter events for a specific student
const filterEventsForStudent = (events, studentId) => {
    return events.filter((event) => {
        const requesterId =
            event.requester_id?._id ||
            event.requester_id ||
            (Array.isArray(event.requester_id)
                ? event.requester_id[0]?._id || event.requester_id[0]
                : null);
        return requesterId?.toString() === studentId?.toString();
    });
};

export const MeetingTab = ({ studentId, student }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [meetingToDelete, setMeetingToDelete] = useState(null);
    const [meetingToConfirm, setMeetingToConfirm] = useState(null);

    // Fetch events with a wide time range
    const now = new Date();
    const startTime = new Date(now.getFullYear() - 1, 0, 1).toISOString(); // 1 year ago
    const endTime = new Date(now.getFullYear() + 1, 11, 31).toISOString(); // 1 year ahead

    const {
        data: eventsResponse,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['events', { startTime, endTime }],
        queryFn: () => getEvents({ startTime, endTime }),
        staleTime: 1000 * 60 * 2 // 2 minutes
    });

    // Transform and filter events for this student
    const allEvents = eventsResponse?.data?.data || [];
    const studentEvents = filterEventsForStudent(allEvents, studentId);
    const meetings = studentEvents.map(transformEventToMeeting);

    // Check if agent has ever had a meeting with the student
    const hasHadMeetings = meetings && meetings.length > 0;
    const pastMeetings = meetings.filter((m) => m.isPast);
    const upcomingMeetings = meetings.filter((m) => !m.isPast);
    const confirmedUpcomingMeetings = upcomingMeetings.filter(
        (m) => m.isConfirmed
    );
    const pendingMeetings = upcomingMeetings.filter((m) => !m.isConfirmed);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (eventData) => postEvent(eventData),
        onSuccess: async () => {
            // Invalidate all event queries to ensure fresh data
            await queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false,
                refetchType: 'active'
            });
            // Wait a moment then refetch to ensure backend has processed
            await new Promise((resolve) => setTimeout(resolve, 300));
            await refetch();
            setFormModalOpen(false);
            setSelectedMeeting(null);
        },
        onError: (error) => {
            console.error('Error creating meeting:', error);
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ eventId, eventData }) => updateEvent(eventId, eventData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false,
                refetchType: 'active'
            });
            await new Promise((resolve) => setTimeout(resolve, 300));
            await refetch();
            setFormModalOpen(false);
            setSelectedMeeting(null);
        },
        onError: (error) => {
            console.error('Error updating meeting:', error);
        }
    });

    // Confirm mutation
    const confirmMutation = useMutation({
        mutationFn: ({ eventId, eventData }) =>
            confirmEvent(eventId, eventData),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false,
                refetchType: 'active'
            });
            await new Promise((resolve) => setTimeout(resolve, 300));
            await refetch();
            setConfirmModalOpen(false);
            setMeetingToConfirm(null);
        },
        onError: (error) => {
            console.error('Error confirming meeting:', error);
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (eventId) => deleteEvent(eventId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['events'],
                exact: false,
                refetchType: 'active'
            });
            await new Promise((resolve) => setTimeout(resolve, 300));
            await refetch();
            setDeleteModalOpen(false);
            setMeetingToDelete(null);
        },
        onError: (error) => {
            console.error('Error deleting meeting:', error);
        }
    });

    const handleCreateMeeting = () => {
        setSelectedMeeting(null);
        setFormModalOpen(true);
    };

    const handleEditMeeting = (meeting) => {
        setSelectedMeeting(meeting);
        setFormModalOpen(true);
    };

    const handleDeleteMeeting = (meeting) => {
        setMeetingToDelete(meeting);
        setDeleteModalOpen(true);
    };

    const handleConfirmMeeting = (meeting) => {
        setMeetingToConfirm(meeting);
        setConfirmModalOpen(true);
    };

    const handleSaveMeeting = (formData) => {
        if (selectedMeeting) {
            // Update existing event
            const eventData = {
                start: formData.dateTime,
                end:
                    formData.endTime ||
                    new Date(
                        new Date(formData.dateTime).getTime() + 30 * 60000
                    ).toISOString(),
                description: formData.description || formData.title,
                title: formData.title
            };
            updateMutation.mutate({
                eventId: selectedMeeting._id,
                eventData
            });
        } else {
            // Create new event - agent creates event with student as requester
            const eventData = {
                requester_id: studentId,
                receiver_id: user._id,
                start: formData.dateTime,
                end:
                    formData.endTime ||
                    new Date(
                        new Date(formData.dateTime).getTime() + 30 * 60000
                    ).toISOString(),
                description: formData.description || formData.title,
                title: formData.title,
                isConfirmedReceiver: true // Agent confirms immediately
            };
            createMutation.mutate(eventData);
        }
    };

    const handleConfirmDelete = () => {
        if (meetingToDelete) {
            deleteMutation.mutate(meetingToDelete._id);
        }
    };

    const handleConfirmMeetingAction = () => {
        if (meetingToConfirm) {
            const eventData = {
                start: meetingToConfirm.dateTime,
                description: meetingToConfirm.description,
                title: meetingToConfirm.title
            };
            confirmMutation.mutate({
                eventId: meetingToConfirm._id,
                eventData
            });
        }
    };

    const handleCloseFormModal = () => {
        setFormModalOpen(false);
        setSelectedMeeting(null);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setMeetingToDelete(null);
    };

    const handleCloseConfirmModal = () => {
        setConfirmModalOpen(false);
        setMeetingToConfirm(null);
    };

    const isAnyMutationLoading =
        createMutation.isLoading ||
        updateMutation.isLoading ||
        confirmMutation.isLoading ||
        deleteMutation.isLoading;

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 400,
                    flexDirection: 'column',
                    gap: 2
                }}
            >
                <CircularProgress size={48} />
                <Typography color="text.secondary">
                    {t('Loading meetings...', { ns: 'common' })}
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {t('Error loading meetings', { ns: 'common' })}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Modern Header Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 3
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                    }}
                >
                    <Box>
                        <Typography
                            component="h1"
                            sx={{ fontWeight: 600, mb: 1 }}
                            variant="h4"
                        >
                            {t('Meetings', { ns: 'common' })}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Chip
                                icon={<EventIcon />}
                                label={`${meetings.length} ${t('Total', { ns: 'common' })}`}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white'
                                }}
                            />
                            {upcomingMeetings.length > 0 && (
                                <Chip
                                    icon={<ScheduleIcon />}
                                    label={`${upcomingMeetings.length} ${t('Upcoming', { ns: 'common' })}`}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white'
                                    }}
                                />
                            )}
                            {pastMeetings.length > 0 && (
                                <Chip
                                    icon={<CheckCircleIcon />}
                                    label={`${pastMeetings.length} ${t('Past', { ns: 'common' })}`}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white'
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                    <Button
                        disabled={isAnyMutationLoading}
                        onClick={handleCreateMeeting}
                        size="large"
                        startIcon={<AddIcon />}
                        sx={{
                            bgcolor: 'white',
                            color: '#667eea',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.9)'
                            },
                            fontWeight: 600
                        }}
                        variant="contained"
                    >
                        {t('Arrange Meeting', { ns: 'common' })}
                    </Button>
                </Box>
            </Paper>

            {/* Statistics Cards */}
            {hasHadMeetings && (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item md={3} sm={6} xs={12}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography color="primary" variant="h3">
                                {meetings.length}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                                {t('Total Meetings', { ns: 'common' })}
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item md={3} sm={6} xs={12}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography color="success.main" variant="h3">
                                {confirmedUpcomingMeetings.length}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                                {t('Confirmed', { ns: 'common' })}
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item md={3} sm={6} xs={12}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography color="warning.main" variant="h3">
                                {pendingMeetings.length}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                                {t('Pending', { ns: 'common' })}
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item md={3} sm={6} xs={12}>
                        <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography color="text.secondary" variant="h3">
                                {pastMeetings.length}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                                {t('Completed', { ns: 'common' })}
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Pending Meetings Alert */}
            {pendingMeetings.length > 0 && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ScheduleIcon />
                        <Typography>
                            {pendingMeetings.length}{' '}
                            {t('meeting(s) awaiting confirmation', {
                                ns: 'common'
                            })}
                        </Typography>
                    </Box>
                </Alert>
            )}

            {/* No meetings message */}
            {!hasHadMeetings && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        bgcolor: 'grey.50',
                        borderRadius: 2
                    }}
                >
                    <EventIcon
                        sx={{ fontSize: 64, color: 'grey.400', mb: 2 }}
                    />
                    <Typography
                        color="text.secondary"
                        gutterBottom
                        variant="h6"
                    >
                        {t('No meetings scheduled yet', { ns: 'common' })}
                    </Typography>
                    <Typography
                        color="text.secondary"
                        sx={{ mb: 3 }}
                        variant="body2"
                    >
                        {t(
                            'Start by arranging your first meeting with this student.',
                            { ns: 'common' }
                        )}
                    </Typography>
                    <Button
                        onClick={handleCreateMeeting}
                        startIcon={<AddIcon />}
                        variant="contained"
                    >
                        {t('Arrange Meeting', { ns: 'common' })}
                    </Button>
                </Paper>
            )}

            {/* Meeting List */}
            {hasHadMeetings && (
                <MeetingList
                    meetings={meetings}
                    onConfirm={handleConfirmMeeting}
                    onDelete={handleDeleteMeeting}
                    onEdit={handleEditMeeting}
                    showActions={true}
                />
            )}

            {/* Create/Edit Meeting Modal */}
            <MeetingFormModal
                isLoading={isAnyMutationLoading}
                meeting={selectedMeeting}
                onClose={handleCloseFormModal}
                onSave={handleSaveMeeting}
                open={formModalOpen}
                student={student}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                closeText={t('Cancel', { ns: 'common' })}
                confirmText={t('Delete', { ns: 'common' })}
                content={t(
                    'Are you sure you want to delete this meeting? This action cannot be undone.',
                    { ns: 'common' }
                )}
                isLoading={deleteMutation.isLoading}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                open={deleteModalOpen}
                title={t('Delete Meeting', { ns: 'common' })}
            />

            {/* Confirm Meeting Modal */}
            <ConfirmationModal
                closeText={t('Cancel', { ns: 'common' })}
                confirmText={t('Confirm', { ns: 'common' })}
                content={t(
                    'Are you sure you want to confirm this meeting? A meeting link will be generated.',
                    { ns: 'common' }
                )}
                isLoading={confirmMutation.isLoading}
                onClose={handleCloseConfirmModal}
                onConfirm={handleConfirmMeetingAction}
                open={confirmModalOpen}
                title={t('Confirm Meeting', { ns: 'common' })}
            />
        </Box>
    );
};

MeetingTab.propTypes = {
    studentId: PropTypes.string.isRequired,
    student: PropTypes.object
};
