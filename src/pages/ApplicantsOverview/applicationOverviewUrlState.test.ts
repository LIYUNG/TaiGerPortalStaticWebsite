import { describe, expect, it } from 'vitest';
import {
    applicationTableStateToSearchParams,
    searchParamsToApplicationTableState,
    writeApplicationTableParams,
    type ApplicationOverviewTableState
} from './applicationOverviewUrlState';

const baseState: ApplicationOverviewTableState = {
    globalFilter: '',
    sorting: [{ id: 'deadline', desc: false }],
    columnFilters: [],
    pagination: { pageIndex: 0, pageSize: 20 }
};

describe('application overview URL state', () => {
    it('omits search, default sort and default pagination', () => {
        expect(applicationTableStateToSearchParams(baseState).toString()).toBe(
            ''
        );
    });

    it('serializes search, filters, non-default sort and pagination', () => {
        const params = applicationTableStateToSearchParams({
            globalFilter: '  jane  ',
            sorting: [{ id: 'program', desc: true }],
            columnFilters: [
                { id: 'country', value: ['DE', 'NL'] },
                { id: 'decided', value: 'O' },
                { id: 'firstname_lastname', value: 'doe' }
            ],
            pagination: { pageIndex: 2, pageSize: 50 }
        });

        expect(params.get('search')).toBe('jane');
        expect(params.get('country')).toBe('DE,NL');
        expect(params.get('decided')).toBe('O');
        expect(params.get('firstname_lastname')).toBe('doe');
        expect(params.get('sort')).toBe('program');
        expect(params.get('sortDir')).toBe('desc');
        expect(params.get('page')).toBe('3');
        expect(params.get('pageSize')).toBe('50');
    });

    it('ignores unknown filter ids and empty values', () => {
        const params = applicationTableStateToSearchParams({
            ...baseState,
            columnFilters: [
                { id: 'not_a_real_column', value: 'x' },
                { id: 'country', value: [] },
                { id: 'decided', value: '' }
            ]
        });
        expect(params.toString()).toBe('');
    });

    it('parses a shared query string back into table state', () => {
        const state = searchParamsToApplicationTableState(
            new URLSearchParams(
                'search=jane&country=DE,NL&decided=O&sort=program&sortDir=desc&page=2&pageSize=50'
            )
        );

        expect(state.globalFilter).toBe('jane');
        expect(state.pagination).toEqual({ pageIndex: 1, pageSize: 50 });
        expect(state.sorting).toEqual([{ id: 'program', desc: true }]);
        expect(state.columnFilters).toEqual(
            expect.arrayContaining([
                { id: 'country', value: ['DE', 'NL'] },
                { id: 'decided', value: 'O' }
            ])
        );
    });

    it('falls back to default sort and pagination when absent/invalid', () => {
        const state = searchParamsToApplicationTableState(
            new URLSearchParams('sort=unknown_col&page=0&pageSize=-1')
        );
        expect(state.sorting).toEqual([{ id: 'deadline', desc: false }]);
        expect(state.pagination).toEqual({ pageIndex: 0, pageSize: 20 });
    });

    it('round-trips state -> params -> state', () => {
        const original: ApplicationOverviewTableState = {
            globalFilter: 'data',
            sorting: [{ id: 'semester', desc: true }],
            columnFilters: [
                { id: 'country', value: ['CH'] },
                { id: 'closed', value: '-' }
            ],
            pagination: { pageIndex: 3, pageSize: 20 }
        };

        const restored = searchParamsToApplicationTableState(
            applicationTableStateToSearchParams(original)
        );

        expect(restored.globalFilter).toBe('data');
        expect(restored.sorting).toEqual(original.sorting);
        expect(restored.pagination).toEqual(original.pagination);
        expect(restored.columnFilters).toEqual(
            expect.arrayContaining(original.columnFilters)
        );
    });

    it('preserves unrelated params (e.g. tab) when writing table state', () => {
        const merged = writeApplicationTableParams(
            new URLSearchParams('tab=1&search=stale&country=FR'),
            {
                ...baseState,
                globalFilter: 'fresh'
            }
        );

        expect(merged.get('tab')).toBe('1');
        expect(merged.get('search')).toBe('fresh');
        // stale table-owned params are cleared before writing the current ones
        expect(merged.get('country')).toBeNull();
    });
});
