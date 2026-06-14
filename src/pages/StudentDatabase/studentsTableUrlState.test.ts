import { describe, expect, it } from 'vitest';
import {
    defaultStudentsTableState,
    searchParamsToStudentsTableState,
    writeStudentsTableParams,
    type StudentsTableState
} from './studentsTableUrlState';

describe('students table URL state', () => {
    it('defaults to newest-first, empty filters, page 1', () => {
        expect(defaultStudentsTableState()).toEqual({
            globalFilter: '',
            sorting: [{ id: 'createdAt', desc: true }],
            columnFilters: [],
            pagination: { pageIndex: 0, pageSize: 20 }
        });
    });

    it('parses a shared query string back into table state', () => {
        const state = searchParamsToStudentsTableState(
            new URLSearchParams(
                'search=li&name_en=jane&sort=name_en&sortDir=asc&page=3&pageSize=50'
            )
        );

        expect(state.globalFilter).toBe('li');
        expect(state.sorting).toEqual([{ id: 'name_en', desc: false }]);
        expect(state.pagination).toEqual({ pageIndex: 2, pageSize: 50 });
        expect(state.columnFilters).toEqual([{ id: 'name_en', value: 'jane' }]);
    });

    it('ignores unknown sort columns and keeps the default', () => {
        const state = searchParamsToStudentsTableState(
            new URLSearchParams('sort=not_a_column&sortDir=asc')
        );
        expect(state.sorting).toEqual([{ id: 'createdAt', desc: true }]);
    });

    it('writes state while preserving the active tab param', () => {
        const merged = writeStudentsTableParams(
            new URLSearchParams('tab=active-students&name_en=stale'),
            {
                globalFilter: 'wang',
                sorting: [{ id: 'createdAt', desc: true }],
                columnFilters: [{ id: 'agentNames', value: 'Bob' }],
                pagination: { pageIndex: 0, pageSize: 20 }
            }
        );

        expect(merged.get('tab')).toBe('active-students');
        expect(merged.get('search')).toBe('wang');
        expect(merged.get('agentNames')).toBe('Bob');
        // stale, now-empty filter cleared; default sort/page omitted
        expect(merged.get('name_en')).toBeNull();
        expect(merged.get('sort')).toBeNull();
        expect(merged.get('page')).toBeNull();
    });

    it('round-trips state -> params -> state', () => {
        const original: StudentsTableState = {
            globalFilter: 'chen',
            sorting: [{ id: 'application_year', desc: false }],
            columnFilters: [
                { id: 'agentNames', value: 'Bob' },
                { id: 'target_degree', value: 'MSc' }
            ],
            pagination: { pageIndex: 1, pageSize: 20 }
        };

        const restored = searchParamsToStudentsTableState(
            writeStudentsTableParams(new URLSearchParams(), original)
        );

        expect(restored.globalFilter).toBe('chen');
        expect(restored.sorting).toEqual(original.sorting);
        expect(restored.pagination).toEqual(original.pagination);
        expect(restored.columnFilters).toEqual(
            expect.arrayContaining(original.columnFilters)
        );
    });
});
