import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import queryString from 'query-string';

import { getEvents } from '@/api';
import {
    monthRangeQuery,
    calendarRangeToQuery,
    type CalendarRange,
    type CalendarRangeQuery
} from '@components/Calendar/utils/calendarRangeToQuery';
import type { EventConfirmationCardEvent } from '@components/Calendar/components/EventConfirmationCard';

export interface UseCalendarRangeEventsParams {
    /** Scope the fetch to events a given user receives (e.g. the agent page). */
    receiver_id?: string;
    enabled?: boolean;
}

export const buildCalendarRangeQueryString = (
    range: CalendarRangeQuery,
    receiver_id?: string
): string =>
    queryString.stringify(
        {
            // Match the visible window on event `start` (a required field) so
            // events show on their start day and none are dropped for a missing
            // `end`.
            rangeField: 'start',
            startTime: range.startTime,
            endTime: range.endTime,
            receiver_id: receiver_id || undefined
        },
        { skipNull: true, skipEmptyString: true }
    );

/**
 * Date-range-scoped calendar events. Fetches only the events in the currently
 * visible calendar window (initialised to the current month) and refetches when
 * the user navigates — wire `handleRangeChange` to `<MyCalendar onRangeChange>`.
 * Shared by the all-office-hours and agent office-hours calendars.
 */
export function useCalendarRangeEvents({
    receiver_id,
    enabled = true
}: UseCalendarRangeEventsParams = {}) {
    // react-big-calendar does not fire onRangeChange on first mount, so start
    // from the current month.
    const [range, setRange] = useState<CalendarRangeQuery>(() =>
        monthRangeQuery(new Date())
    );

    const queryStringValue = buildCalendarRangeQueryString(range, receiver_id);

    const query = useQuery({
        queryKey: ['events', 'calendar-range', queryStringValue],
        queryFn: () => getEvents(queryStringValue),
        staleTime: 1000 * 60 * 2,
        placeholderData: keepPreviousData,
        enabled
    });

    const calendarEvents =
        (
            query.data as
                | { data?: { data?: EventConfirmationCardEvent[] } }
                | undefined
        )?.data?.data ?? [];

    const handleRangeChange = (incoming: CalendarRange): void => {
        setRange(calendarRangeToQuery(incoming));
    };

    return {
        calendarEvents,
        handleRangeChange,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        range
    };
}

export default useCalendarRangeEvents;
