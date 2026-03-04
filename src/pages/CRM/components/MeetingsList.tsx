import { Box, Link, Typography } from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';

import { sanitizeMeetingTitle } from '@pages/CRM/components/meetingUtils';

interface Meeting {
    id: string;
    title: string;
    date: string;
    summary?: { gist?: string };
}

interface MeetingsListProps {
    meetings: Meeting[];
    t: (key: string, opts?: Record<string, unknown>) => string;
}

const MeetingsList = ({ meetings, t }: MeetingsListProps) => {
    if (!meetings || meetings.length === 0) {
        return null;
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                }}
            >
                {meetings.map((meeting) => (
                    <Box
                        key={meeting.id}
                        sx={{
                            p: 2,
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main',
                            backgroundColor: 'grey.50',
                            borderRadius: '0 4px 4px 0',
                            '&:hover': {
                                backgroundColor: 'grey.100',
                                transition: 'background-color 0.2s ease'
                            },
                            position: 'relative'
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5
                            }}
                        >
                            <EventIcon
                                color="primary"
                                sx={{
                                    fontSize: '1.1rem',
                                    flexShrink: 0
                                }}
                            />
                            <Typography
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                    alignItems: 'center',
                                    lineHeight: 1.6,
                                    flex: 1
                                }}
                                variant="body1"
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: 'text.primary'
                                    }}
                                >
                                    <Link
                                        component="a"
                                        href={`/crm/meetings/${meeting.id}`}
                                        sx={{
                                            color: 'inherit',
                                            fontWeight: 'inherit'
                                        }}
                                        underline="hover"
                                    >
                                        {sanitizeMeetingTitle(
                                            meeting.title
                                        ) || 'N/A'}
                                    </Link>
                                </Box>
                                <Box
                                    component="span"
                                    sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {new Date(
                                        meeting.date
                                    ).toLocaleDateString()}
                                </Box>
                                <Box
                                    component="span"
                                    sx={{
                                        flex: 1,
                                        minWidth: '300px',
                                        color: 'text.primary'
                                    }}
                                >
                                    {meeting.summary?.gist ||
                                        t('common.noSummary', {
                                            ns: 'crm'
                                        })}
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default MeetingsList;
