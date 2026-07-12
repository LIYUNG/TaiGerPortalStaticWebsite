import { describe, expect, it } from 'vitest';
import {
    columnFiltersToProgramListFilters,
    programTableStateToSearchParams,
    searchParamsToProgramTableState,
    DEFAULT_PROGRAM_PAGE_SIZE,
    type ProgramListTableState
} from './programListFilters';

describe('columnFiltersToProgramListFilters', () => {
    it('maps status, text and array filters; drops empties', () => {
        expect(
            columnFiltersToProgramListFilters([
                { id: 'status', value: 'Locked' },
                { id: 'school', value: 'TU Berlin' },
                { id: 'country', value: ['DE', 'NL'] },
                { id: 'program_name', value: '' },
                { id: 'tags', value: [] }
            ])
        ).toEqual({
            lockStatus: 'Locked',
            school: 'TU Berlin',
            country: ['DE', 'NL']
        });
    });

    it('maps the boolean school flags, keeping false distinct from unset', () => {
        expect(
            columnFiltersToProgramListFilters([
                { id: 'isPrivateSchool', value: 'true' },
                // 'false' is a real query ("public only"), NOT an empty filter —
                // it must survive rather than being dropped as falsy.
                { id: 'isPartnerSchool', value: 'false' },
                { id: 'isNC', value: '' }
            ])
        ).toEqual({
            isPrivateSchool: 'true',
            isPartnerSchool: 'false'
        });
    });

    it('ignores a boolean flag that is not literally true/false', () => {
        expect(
            columnFiltersToProgramListFilters([
                { id: 'isPrivateSchool', value: 'maybe' }
            ])
        ).toEqual({});
    });
});

describe('program table URL state round-trip', () => {
    it('round-trips the boolean school flags through a shared link', () => {
        const params = programTableStateToSearchParams({
            globalFilter: '',
            columnFilters: [
                { id: 'isPrivateSchool', value: 'true' },
                { id: 'isNC', value: 'false' }
            ],
            sorting: [],
            pagination: { pageIndex: 0, pageSize: DEFAULT_PROGRAM_PAGE_SIZE }
        });
        expect(params.get('isPrivateSchool')).toBe('true');
        expect(params.get('isNC')).toBe('false');

        const restored = searchParamsToProgramTableState(params);
        expect(restored.columnFilters).toEqual(
            expect.arrayContaining([
                { id: 'isPrivateSchool', value: 'true' },
                { id: 'isNC', value: 'false' }
            ])
        );
    });

    it('serializes search, filters and non-default pagination', () => {
        const state: ProgramListTableState = {
            globalFilter: '  machine learning  ',
            columnFilters: [
                { id: 'status', value: 'Unlocked' },
                { id: 'school', value: 'ETH' },
                { id: 'country', value: ['DE', 'CH'] }
            ],
            sorting: [],
            pagination: { pageIndex: 2, pageSize: 50 }
        };

        const params = programTableStateToSearchParams(state);

        expect(params.get('search')).toBe('machine learning');
        expect(params.get('status')).toBe('Unlocked');
        expect(params.get('school')).toBe('ETH');
        expect(params.get('country')).toBe('DE,CH');
        expect(params.get('page')).toBe('3'); // pageIndex 2 -> 1-based page 3
        expect(params.get('pageSize')).toBe('50');
    });

    it('omits empty search and default pagination', () => {
        const params = programTableStateToSearchParams({
            globalFilter: '   ',
            columnFilters: [{ id: 'tags', value: [] }],
            sorting: [],
            pagination: { pageIndex: 0, pageSize: DEFAULT_PROGRAM_PAGE_SIZE }
        });

        expect(params.toString()).toBe('');
    });

    it('serializes / parses sort for allow-listed columns only', () => {
        const params = programTableStateToSearchParams({
            globalFilter: '',
            columnFilters: [],
            sorting: [{ id: 'program_name', desc: true }],
            pagination: { pageIndex: 0, pageSize: DEFAULT_PROGRAM_PAGE_SIZE }
        });
        expect(params.get('sort')).toBe('program_name');
        expect(params.get('sortDir')).toBe('desc');

        expect(
            searchParamsToProgramTableState(
                new URLSearchParams('sort=program_name&sortDir=desc')
            ).sorting
        ).toEqual([{ id: 'program_name', desc: true }]);

        // a non-sortable column is dropped on both encode and decode
        expect(
            programTableStateToSearchParams({
                globalFilter: '',
                columnFilters: [],
                sorting: [{ id: 'tags', desc: false }],
                pagination: {
                    pageIndex: 0,
                    pageSize: DEFAULT_PROGRAM_PAGE_SIZE
                }
            }).get('sort')
        ).toBeNull();
        expect(
            searchParamsToProgramTableState(new URLSearchParams('sort=tags'))
                .sorting
        ).toEqual([]);
    });

    it('parses a shared query string back into table state', () => {
        const state = searchParamsToProgramTableState(
            new URLSearchParams(
                'search=cs&status=Locked&country=DE,NL&school=TUM&page=2&pageSize=50'
            )
        );

        expect(state.globalFilter).toBe('cs');
        expect(state.pagination).toEqual({ pageIndex: 1, pageSize: 50 });
        expect(state.columnFilters).toEqual(
            expect.arrayContaining([
                { id: 'status', value: 'Locked' },
                { id: 'country', value: ['DE', 'NL'] },
                { id: 'school', value: 'TUM' }
            ])
        );
    });

    it('falls back to defaults for missing/invalid pagination', () => {
        expect(
            searchParamsToProgramTableState(new URLSearchParams()).pagination
        ).toEqual({ pageIndex: 0, pageSize: DEFAULT_PROGRAM_PAGE_SIZE });

        expect(
            searchParamsToProgramTableState(
                new URLSearchParams('page=0&pageSize=-5')
            ).pagination
        ).toEqual({ pageIndex: 0, pageSize: DEFAULT_PROGRAM_PAGE_SIZE });
    });

    it('round-trips state -> params -> state', () => {
        const original: ProgramListTableState = {
            globalFilter: 'data',
            columnFilters: [
                { id: 'status', value: 'Locked' },
                { id: 'programSubjects', value: ['CS', 'EE'] },
                { id: 'degree', value: 'MSc' }
            ],
            sorting: [{ id: 'degree', desc: false }],
            pagination: { pageIndex: 1, pageSize: 20 }
        };

        const restored = searchParamsToProgramTableState(
            programTableStateToSearchParams(original)
        );

        expect(restored.globalFilter).toBe('data');
        expect(restored.sorting).toEqual(original.sorting);
        expect(restored.pagination).toEqual({ pageIndex: 1, pageSize: 20 });
        expect(restored.columnFilters).toEqual(
            expect.arrayContaining(original.columnFilters)
        );
    });
});
