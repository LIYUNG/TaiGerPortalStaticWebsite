// react-big-calendar reports the visible range via `onRangeChange(range, view)`.
// The shape depends on the view:
//   - month / week / day  -> an ARRAY of the visible day Dates (local midnight)
//   - agenda              -> a { start, end } object
// We convert that into the `startTime`/`endTime` (UTC ISO) the events API
// expects. The boundaries are taken at LOCAL start-of-first-day .. LOCAL
// end-of-last-day so that, whatever the user's timezone, no event late on the
// last visible day is dropped (the key edge case). `toISOString()` then yields
// the correct absolute UTC instants for the DB comparison.

export type CalendarRange = Date[] | { start: Date; end: Date };

export interface CalendarRangeQuery {
    startTime: string;
    endTime: string;
}

const startOfLocalDay = (d: Date): Date => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
};

const endOfLocalDay = (d: Date): Date => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
};

export const calendarRangeToQuery = (
    range: CalendarRange
): CalendarRangeQuery => {
    if (Array.isArray(range)) {
        if (range.length === 0) {
            return { startTime: '', endTime: '' };
        }
        return {
            startTime: startOfLocalDay(range[0]).toISOString(),
            endTime: endOfLocalDay(range[range.length - 1]).toISOString()
        };
    }
    return {
        startTime: startOfLocalDay(range.start).toISOString(),
        endTime: endOfLocalDay(range.end).toISOString()
    };
};

/** The visible range for a given month, used as the initial calendar window
 *  (react-big-calendar does not fire onRangeChange on first mount). */
export const monthRangeQuery = (date: Date): CalendarRangeQuery => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return calendarRangeToQuery([start, end]);
};

export default calendarRangeToQuery;
