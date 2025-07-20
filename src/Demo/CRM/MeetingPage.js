import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

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
    Button
} from '@mui/material';
import {
    AccessTime,
    Person,
    VideoCall,
    CalendarToday
} from '@mui/icons-material';

import DEMO from '../../store/constant';
// import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import { request } from '../../api/request';

const MeetingPage = () => {
    const { meetingId } = useParams();
    const [meeting, setMeeting] = useState([]);

    useEffect(() => {
        request
            .get('/api/crm/meetings/' + meetingId)
            .then((data) => {
                setMeeting(data?.data?.data || []);
            })
            .catch((error) => {
                console.error('Failed to fetch leads:', error);
            });
    }, []);

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

                <Typography color="primary" fontWeight="bold" variant="h5">
                    Meeting Details
                </Typography>
            </Box>
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

                        {/* Meeting Info */}
                        {meeting.meetingInfo && (
                            <Card>
                                <CardContent>
                                    <Typography gutterBottom variant="h6">
                                        Meeting Status
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1
                                        }}
                                    >
                                        <Chip
                                            color={
                                                meeting.meetingInfo
                                                    .summary_status ===
                                                'processed'
                                                    ? 'success'
                                                    : 'default'
                                            }
                                            label={
                                                meeting.meetingInfo
                                                    .summary_status || 'Unknown'
                                            }
                                            size="small"
                                        />
                                        {meeting.isArchived && (
                                            <Chip
                                                color="warning"
                                                label="Archived"
                                                size="small"
                                            />
                                        )}
                                    </Box>
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
