import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    Link,
    Button
} from '@mui/material';
import type { MeetingResponse } from '@api/types';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import VideocamIcon from '@mui/icons-material/Videocam';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LaunchIcon from '@mui/icons-material/Launch';
import { useTranslation } from 'react-i18next';

export interface MeetingCardProps {
    meeting: MeetingResponse;
    isPast: boolean;
    onEdit: (meeting: MeetingResponse) => void;
    onDelete: (meeting: MeetingResponse) => void;
    onConfirm: (meeting: MeetingResponse) => void;
    showActions?: boolean;
}

export const MeetingCard = ({
    meeting,
    isPast,
    onEdit,
    onDelete,
    onConfirm,
    showActions = true
}: MeetingCardProps) => {
    const { t } = useTranslation();
    const isReadOnly = isPast || !showActions;
    const needsConfirmation =
        !isPast &&
        !meeting.isConfirmed &&
        showActions &&
        !meeting.isConfirmedReceiver;

    const formatDateTime = (dateTime: string | null | undefined): string => {
        if (!dateTime) return t('Not set', { ns: 'common' });
        try {
            const date = new Date(dateTime);
            return date.toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateTime;
        }
    };

    const getStatusChip = () => {
        if (isPast) {
            if (meeting.attended || meeting.isConfirmed) {
                return (
                    <Chip
                        color="success"
                        icon={<CheckCircleIcon />}
                        label={t('Completed', { ns: 'common' })}
                        size="small"
                    />
                );
            } else {
                return (
                    <Chip
                        color="error"
                        label={t('Missed', { ns: 'common' })}
                        size="small"
                    />
                );
            }
        } else if (meeting.isConfirmed) {
            return (
                <Chip
                    color="success"
                    icon={<CheckCircleIcon />}
                    label={t('Confirmed', { ns: 'common' })}
                    size="small"
                />
            );
        } else {
            return (
                <Chip
                    color="warning"
                    icon={<ScheduleIcon />}
                    label={t('Pending', { ns: 'common' })}
                    size="small"
                />
            );
        }
    };

    return (
        <Card
            sx={{
                mb: 2,
                opacity: isReadOnly ? 0.8 : 1,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    boxShadow: isReadOnly ? 2 : 4
                }
            }}
        >
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 1
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon color="primary" />
                        <Typography component="h3" variant="h6">
                            {meeting.title || t('Meeting', { ns: 'common' })}
                        </Typography>
                    </Box>
                    {getStatusChip()}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {meeting.dateTime && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <AccessTimeIcon color="action" fontSize="small" />
                            <Typography color="text.secondary" variant="body2">
                                {formatDateTime(meeting.dateTime)}
                            </Typography>
                        </Box>
                    )}

                    {meeting.location && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <LocationOnIcon color="action" fontSize="small" />
                            <Typography color="text.secondary" variant="body2">
                                {meeting.location}
                            </Typography>
                        </Box>
                    )}

                    {meeting.meetingLink && meeting.isConfirmed && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <VideocamIcon color="primary" fontSize="small" />
                            <Link
                                href={meeting.meetingLink}
                                rel="noopener noreferrer"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}
                                target="_blank"
                            >
                                <Typography color="primary" variant="body2">
                                    {t('Join Meeting', { ns: 'common' })}
                                </Typography>
                                <LaunchIcon fontSize="small" />
                            </Link>
                        </Box>
                    )}

                    {meeting.agent && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <PersonIcon color="action" fontSize="small" />
                            <Typography color="text.secondary" variant="body2">
                                {t('Agent', { ns: 'common' })}:{' '}
                                {meeting.agent.firstname}{' '}
                                {meeting.agent.lastname}
                            </Typography>
                        </Box>
                    )}

                    {meeting.description && (
                        <Typography
                            color="text.secondary"
                            sx={{ mt: 1 }}
                            variant="body2"
                        >
                            {meeting.description}
                        </Typography>
                    )}

                    {meeting.notes && (
                        <Box
                            sx={{
                                mt: 1,
                                p: 1,
                                bgcolor: 'grey.100',
                                borderRadius: 1
                            }}
                        >
                            <Typography fontWeight="bold" variant="caption">
                                {t('Notes', { ns: 'common' })}:
                            </Typography>
                            <Typography variant="body2">
                                {meeting.notes}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {!isReadOnly && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 1,
                            mt: 2,
                            pt: 2,
                            borderTop: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        {needsConfirmation && onConfirm && (
                            <Button
                                color="success"
                                onClick={() => onConfirm(meeting)}
                                size="small"
                                startIcon={<CheckCircleIcon />}
                                variant="contained"
                            >
                                {t('Confirm', { ns: 'common' })}
                            </Button>
                        )}
                        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                            <Tooltip title={t('Edit', { ns: 'common' })}>
                                <IconButton
                                    color="primary"
                                    onClick={() => onEdit(meeting)}
                                    size="small"
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t('Delete', { ns: 'common' })}>
                                <IconButton
                                    color="error"
                                    onClick={() => onDelete(meeting)}
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
