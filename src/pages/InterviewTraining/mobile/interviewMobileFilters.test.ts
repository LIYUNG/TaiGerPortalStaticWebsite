import { describe, it, expect } from 'vitest';
import {
    getFilterValue,
    setFilterValue,
    countActiveFilters
} from './interviewMobileFilters';

describe('interviewMobileFilters', () => {
    it('reads a column filter value', () => {
        const filters = [{ id: 'status', value: ['Open'] }];
        expect(getFilterValue(filters, 'status')).toEqual(['Open']);
        expect(getFilterValue(filters, 'missing')).toBeUndefined();
    });

    it('sets a value without mutating the input', () => {
        const filters = [{ id: 'status', value: ['Open'] }];
        const next = setFilterValue(filters, 'trainer_name', 'bob');
        expect(next).toContainEqual({ id: 'trainer_name', value: 'bob' });
        expect(filters).toHaveLength(1); // original untouched
    });

    it('removes a filter when the value is empty', () => {
        const filters = [
            { id: 'status', value: ['Open'] },
            { id: 'trainer_name', value: 'bob' }
        ];
        expect(setFilterValue(filters, 'trainer_name', '')).toEqual([
            { id: 'status', value: ['Open'] }
        ]);
        // empty array / all-empty tuple also clears.
        expect(setFilterValue(filters, 'status', [])).toEqual([
            { id: 'trainer_name', value: 'bob' }
        ]);
        expect(
            setFilterValue(filters, 'start', [undefined, undefined])
        ).toHaveLength(2);
    });

    it('counts active column filters plus a non-empty search', () => {
        const filters = [
            { id: 'status', value: ['Open'] },
            { id: 'trainer_name', value: '' }, // empty -> not counted
            { id: 'start', value: ['2025-06-01', undefined] }
        ];
        expect(countActiveFilters(filters, '')).toBe(2);
        expect(countActiveFilters(filters, '  hello ')).toBe(3);
    });
});
