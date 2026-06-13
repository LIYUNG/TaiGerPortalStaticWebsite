import { describe, it, expect } from 'vitest';
import {
    isFilterValueSet,
    getColumnFilterValue,
    setColumnFilterValue,
    countActiveFilters
} from './programMobileFilters';

describe('programMobileFilters', () => {
    it('isFilterValueSet: empty string / null / [] are unset', () => {
        expect(isFilterValueSet('')).toBe(false);
        expect(isFilterValueSet(null)).toBe(false);
        expect(isFilterValueSet(undefined)).toBe(false);
        expect(isFilterValueSet([])).toBe(false);
        expect(isFilterValueSet('x')).toBe(true);
        expect(isFilterValueSet(['x'])).toBe(true);
    });

    it('getColumnFilterValue reads the matching filter', () => {
        const filters = [{ id: 'degree', value: 'M.Sc.' }];
        expect(getColumnFilterValue(filters, 'degree')).toBe('M.Sc.');
        expect(getColumnFilterValue(filters, 'country')).toBeUndefined();
    });

    it('setColumnFilterValue upserts a value', () => {
        const next = setColumnFilterValue([], 'degree', 'M.Sc.');
        expect(next).toEqual([{ id: 'degree', value: 'M.Sc.' }]);

        const updated = setColumnFilterValue(next, 'degree', 'B.Sc.');
        expect(updated).toEqual([{ id: 'degree', value: 'B.Sc.' }]);
    });

    it('setColumnFilterValue removes a filter when the value becomes empty', () => {
        const start = [
            { id: 'degree', value: 'M.Sc.' },
            { id: 'country', value: ['DE'] }
        ];
        expect(setColumnFilterValue(start, 'degree', '')).toEqual([
            { id: 'country', value: ['DE'] }
        ]);
        expect(setColumnFilterValue(start, 'country', [])).toEqual([
            { id: 'degree', value: 'M.Sc.' }
        ]);
    });

    it('countActiveFilters counts set column filters + a non-empty global search', () => {
        const filters = [
            { id: 'degree', value: 'M.Sc.' },
            { id: 'country', value: [] }, // unset
            { id: 'tags', value: ['t1'] }
        ];
        expect(countActiveFilters(filters, '')).toBe(2);
        expect(countActiveFilters(filters, '  ')).toBe(2);
        expect(countActiveFilters(filters, 'mit')).toBe(3);
    });
});
