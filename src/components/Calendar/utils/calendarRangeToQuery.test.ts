import { describe, it, expect } from 'vitest';
import { calendarRangeToQuery, monthRangeQuery } from './calendarRangeToQuery';

// Assertions read back the boundaries in LOCAL time (getHours/getDate/...), so
// the test is deterministic regardless of the machine timezone — it verifies the
// converter pins start-of-first-day and (inclusive) end-of-last-day locally.

describe('calendarRangeToQuery', () => {
    it('month/week array: start-of-first-day .. inclusive end-of-last-day (local)', () => {
        // A month-view array of local-midnight days spanning two months.
        const days = [
            new Date(2025, 5, 1),
            new Date(2025, 5, 2),
            new Date(2025, 6, 5)
        ];
        const { startTime, endTime } = calendarRangeToQuery(days);
        const start = new Date(startTime);
        const end = new Date(endTime);

        expect(start.getFullYear()).toBe(2025);
        expect(start.getMonth()).toBe(5);
        expect(start.getDate()).toBe(1);
        expect(start.getHours()).toBe(0);
        expect(start.getMinutes()).toBe(0);
        expect(start.getSeconds()).toBe(0);

        // Inclusive end: the LAST visible day at 23:59:59.999 local.
        expect(end.getMonth()).toBe(6);
        expect(end.getDate()).toBe(5);
        expect(end.getHours()).toBe(23);
        expect(end.getMinutes()).toBe(59);
        expect(end.getSeconds()).toBe(59);

        expect(start.getTime()).toBeLessThan(end.getTime());
        // Emitted as UTC ISO (the API contract).
        expect(startTime).toMatch(/Z$/);
        expect(endTime).toMatch(/Z$/);
    });

    it('agenda { start, end } object form', () => {
        const { startTime, endTime } = calendarRangeToQuery({
            start: new Date(2025, 5, 9),
            end: new Date(2025, 5, 15)
        });
        const start = new Date(startTime);
        const end = new Date(endTime);
        expect(start.getDate()).toBe(9);
        expect(start.getHours()).toBe(0);
        expect(end.getDate()).toBe(15);
        expect(end.getHours()).toBe(23);
        expect(start.getTime()).toBeLessThan(end.getTime());
    });

    it('empty array yields empty bounds', () => {
        expect(calendarRangeToQuery([])).toEqual({
            startTime: '',
            endTime: ''
        });
    });
});

describe('monthRangeQuery', () => {
    it('spans the first .. last day of the given month (inclusive end)', () => {
        const { startTime, endTime } = monthRangeQuery(new Date(2025, 1, 15)); // Feb 2025
        const start = new Date(startTime);
        const end = new Date(endTime);
        expect(start.getMonth()).toBe(1);
        expect(start.getDate()).toBe(1);
        expect(start.getHours()).toBe(0);
        expect(end.getMonth()).toBe(1);
        expect(end.getDate()).toBe(28); // 2025 is not a leap year
        expect(end.getHours()).toBe(23);
    });
});
