import React, { useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Box } from '@mui/material';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import Popping from './Popping';
import { useTheme } from '@mui/material';
import { NoonNightLabel, stringToColor } from '../../../utils/contants';
import {
    is_TaiGer_Agent,
    is_TaiGer_Editor,
    is_TaiGer_Student,
    type UserProps
} from '@taiger-common/core';
import { useAuth } from '../../AuthProvider';

const localizer = momentLocalizer(moment);

export interface CalendarEventType {
    id?: string;
    title?: string;
    start: Date;
    end: Date;
    description?: string;
    provider?: { firstname?: string; lastname?: string };
}

interface CalendarEventComponentProps {
    event: CalendarEventType;
}

const CalendarEventComponent = ({
    event
}: CalendarEventComponentProps): React.ReactElement => {
    const { user } = useAuth();
    return user && is_TaiGer_Student(user as UserProps) ? (
        <span>
            {event.start.toLocaleTimeString()} {NoonNightLabel(event.start)}{' '}
        </span>
    ) : (
        <span>
            {event.start.toLocaleTimeString()} {NoonNightLabel(event.start)}{' '}
            {event.title} - {event.description}
        </span>
    );
};

interface MyCalendarProps {
    BookButtonDisable: boolean;
    events: CalendarEventType[];
    selectedEvent: CalendarEventType | null;
    handleModalClose: () => void;
    handleModalBook: () => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectEvent: (event: CalendarEventType) => void;
    handleSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
    handleChangeReceiver: (e: { target: { value: string } }) => void;
    newDescription: string;
    newReceiver: string;
}

const MyCalendar = ({
    BookButtonDisable,
    events,
    selectedEvent,
    handleModalClose,
    handleModalBook,
    handleChange,
    handleSelectEvent,
    handleSelectSlot,
    handleChangeReceiver,
    newDescription,
    newReceiver
}: MyCalendarProps) => {
    const { user } = useAuth();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const calendarStyles = useMemo(() => {
        return {
            '& .rbc-calendar': {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
                fontFamily: theme.typography.fontFamily
            },
            '& .rbc-header': {
                backgroundColor: theme.palette.background.default,
                borderBottom: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
                padding: theme.spacing(1),
                fontWeight: theme.typography.fontWeightMedium
            },
            '& .rbc-month-view': {
                border: `1px solid ${theme.palette.divider}`
            },
            '& .rbc-day-bg': {
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider
            },
            '& .rbc-off-range-bg': {
                backgroundColor: isDarkMode
                    ? theme.palette.action.hover
                    : theme.palette.grey[50]
            },
            '& .rbc-today': {
                backgroundColor: isDarkMode
                    ? theme.palette.action.selected
                    : theme.palette.action.hover
            },
            '& .rbc-date-cell': {
                color: theme.palette.text.primary,
                '&.rbc-off-range-bg': {
                    color: theme.palette.text.disabled
                }
            },
            '& .rbc-toolbar': {
                marginBottom: theme.spacing(2),
                color: theme.palette.text.primary,
                '& button': {
                    color: theme.palette.text.primary,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                    '&:hover, &:focus': {
                        backgroundColor: theme.palette.action.hover,
                        borderColor: theme.palette.action.active
                    },
                    '&.rbc-active': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        borderColor: theme.palette.primary.main
                    }
                },
                '& .rbc-toolbar-label': {
                    color: theme.palette.text.primary,
                    fontWeight: theme.typography.fontWeightMedium
                }
            },
            '& .rbc-event': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                borderColor: theme.palette.primary.dark,
                borderRadius: theme.shape.borderRadius,
                padding: theme.spacing(0.25, 0.5),
                fontSize: theme.typography.body2.fontSize,
                '&:focus': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2
                }
            },
            '& .rbc-selected': {
                backgroundColor: theme.palette.action.selected
            },
            '& .rbc-show-more': {
                backgroundColor: theme.palette.background.default,
                color: theme.palette.primary.main,
                borderColor: theme.palette.divider,
                '&:hover': {
                    backgroundColor: theme.palette.action.hover
                }
            },
            '& .rbc-time-view': {
                border: `1px solid ${theme.palette.divider}`
            },
            '& .rbc-time-header': {
                borderBottom: `1px solid ${theme.palette.divider}`
            },
            '& .rbc-time-header-content': {
                borderLeft: `1px solid ${theme.palette.divider}`
            },
            '& .rbc-time-content': {
                borderTop: `1px solid ${theme.palette.divider}`
            },
            '& .rbc-time-slot': {
                borderTop: `1px solid ${theme.palette.divider}`
            },
            '& .rbc-timeslot-group': {
                borderBottom: `1px solid ${theme.palette.divider}`
            },
            '& .rbc-day-slot .rbc-time-slot': {
                borderTop: `1px solid ${theme.palette.divider}`
            },
            '& .rbc-agenda-view table': {
                border: `1px solid ${theme.palette.divider}`,
                '& tbody > tr > td': {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary
                },
                '& thead > tr > th': {
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary
                }
            },
            '& .rbc-popover': {
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[8],
                '& .rbc-popover-header': {
                    backgroundColor: theme.palette.background.default,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary
                },
                '& .rbc-popover-content': {
                    color: theme.palette.text.primary
                }
            },
            '& .rbc-overlay': {
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[8],
                '& .rbc-overlay-header': {
                    backgroundColor: theme.palette.background.default,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.primary
                }
            }
        };
    }, [theme, isDarkMode]);

    const eventPropGetter = (event: CalendarEventType) => {
        return {
            style: {
                color: theme.palette.text.primary,
                backgroundColor: stringToColor(
                    `${event.provider?.firstname ?? ''} ${event.provider?.lastname ?? ''}`
                ),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: theme.shape.borderRadius
            }
        };
    };

    return (
        <Box sx={calendarStyles}>
            <BigCalendar
                components={{
                    event: CalendarEventComponent
                }}
                defaultView="month"
                endAccessor="end"
                eventPropGetter={eventPropGetter}
                events={events}
                localizer={localizer}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={
                    user &&
                    (is_TaiGer_Agent(user as UserProps) ||
                        is_TaiGer_Editor(user as UserProps))
                        ? handleSelectSlot
                        : () => {}
                }
                popup
                selectable={true}
                startAccessor="start"
                style={{ height: 600 }}
                timeslots={2}
                views={['month', 'week', 'day']}
            />

            <Popping
                BookButtonDisable={BookButtonDisable}
                event={selectedEvent}
                handleBook={handleModalBook}
                handleChange={handleChange}
                handleChangeReceiver={handleChangeReceiver}
                handleClose={handleModalClose}
                newDescription={newDescription}
                newReceiver={newReceiver}
                open={selectedEvent}
                user={user}
            />
        </Box>
    );
};

export default MyCalendar;
