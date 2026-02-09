import { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface EventDateComponentProps {
    eventDate: Date;
}

interface FormattedDate {
    month: string;
    day: string;
    weekDay: string;
}

const EventDateComponent = ({ eventDate }: EventDateComponentProps) => {
    const theme = useTheme();
    const [formattedDate, setFormattedDate] = useState<FormattedDate>({
        month: '',
        day: '',
        weekDay: ''
    });

    useEffect(() => {
        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const month = months[eventDate.getMonth()];
        const day = eventDate.getDate().toString().padStart(2, '0');
        const weekDay = daysOfWeek[eventDate.getDay()];
        queueMicrotask(() =>
            setFormattedDate({ month, day, weekDay })
        );
    }, [eventDate]);

    return (
        <Box
            sx={{
                alignItems: 'center',
                backgroundColor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '4px',
                boxShadow: theme.shadows[1],
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: 100
            }}
        >
            <Box
                sx={{
                    alignItems: 'center',
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    display: 'flex',
                    justifyContent: 'center',
                    padding: theme.spacing(0.75, 0),
                    width: '100%'
                }}
            >
                <Typography
                    sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase'
                    }}
                    variant="body2"
                >
                    {formattedDate.month}
                </Typography>
            </Box>

            <Box
                sx={{
                    alignItems: 'center',
                    display: 'flex',
                    flex: 1,
                    justifyContent: 'center',
                    minHeight: 60,
                    padding: theme.spacing(1, 0)
                }}
            >
                <Typography
                    sx={{
                        color: theme.palette.text.primary,
                        fontSize: '2rem',
                        fontWeight: 700,
                        lineHeight: 1
                    }}
                    variant="h4"
                >
                    {formattedDate.day}
                </Typography>
            </Box>

            <Box
                sx={{
                    alignItems: 'center',
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'center',
                    padding: theme.spacing(0.5, 0),
                    width: '100%'
                }}
            >
                <Typography
                    sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        textTransform: 'uppercase'
                    }}
                    variant="caption"
                >
                    {formattedDate.weekDay}
                </Typography>
            </Box>
        </Box>
    );
};

export default EventDateComponent;
