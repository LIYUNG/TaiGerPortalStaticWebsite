import { Box, Typography, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { MeetingResponse } from '@/api/types';
import { MeetingCard } from './MeetingCard';

export interface MeetingListProps {
    meetings?: MeetingResponse[];
    onEdit: (meeting: MeetingResponse) => void;
    onDelete: (meeting: MeetingResponse) => void;
    onConfirm: (meeting: MeetingResponse) => void;
    showActions?: boolean;
}

export const MeetingList = ({
    meetings = [],
    onEdit,
    onDelete,
    onConfirm,
    showActions = true
}: MeetingListProps) => {
    const { t } = useTranslation();

    if (!meetings || meetings.length === 0) {
        return (
            <Box
                sx={{
                    p: 3,
                    textAlign: 'center',
                    color: 'text.secondary'
                }}
            >
                <Typography variant="body1">
                    {t('No meetings found', { ns: 'common' })}
                </Typography>
            </Box>
        );
    }

    // Separate past and future meetings
    const now = new Date();
    const pastMeetings = meetings.filter(
        (meeting) => meeting.dateTime && new Date(meeting.dateTime) < now
    );
    const upcomingMeetings = meetings.filter(
        (meeting) => !meeting.dateTime || new Date(meeting.dateTime) >= now
    );

    // Sort past meetings by date (most recent first)
    pastMeetings.sort(
        (a, b) =>
            new Date(b.dateTime ?? 0).getTime() -
            new Date(a.dateTime ?? 0).getTime()
    );

    // Sort upcoming meetings by date (soonest first)
    upcomingMeetings.sort(
        (a, b) =>
            new Date(a.dateTime ?? 0).getTime() -
            new Date(b.dateTime ?? 0).getTime()
    );

    return (
        <Box>
            {upcomingMeetings.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ mb: 2 }} variant="h6">
                        {t('Upcoming Meetings', { ns: 'common' })}
                    </Typography>
                    {upcomingMeetings.map((meeting) => (
                        <MeetingCard
                            isPast={false}
                            key={meeting._id}
                            meeting={meeting}
                            onConfirm={onConfirm}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            showActions={showActions}
                        />
                    ))}
                </Box>
            )}

            {pastMeetings.length > 0 && (
                <Box>
                    {upcomingMeetings.length > 0 && <Divider sx={{ my: 3 }} />}
                    <Typography sx={{ mb: 2 }} variant="h6">
                        {t('Past Meetings', { ns: 'common' })}
                    </Typography>
                    {pastMeetings.map((meeting) => (
                        <MeetingCard
                            isPast={true}
                            key={meeting._id}
                            meeting={meeting}
                            onConfirm={onConfirm}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            showActions={false}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};
