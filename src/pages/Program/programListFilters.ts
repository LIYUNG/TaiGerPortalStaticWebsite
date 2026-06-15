import type {
    MRT_ColumnFiltersState,
    MRT_SortingState
} from 'material-react-table';

export type ProgramListFilters = {
    search?: string;
    lockStatus?: 'Locked' | 'Unlocked';
    school?: string;
    program_name?: string;
    country?: string[];
    programSubjects?: string[];
    tags?: string[];
    degree?: string;
    semester?: string;
    lang?: string;
    toefl?: string;
    ielts?: string;
    gre?: string;
    gmat?: string;
    application_deadline?: string;
};

const TEXT_FILTER_IDS = new Set([
    'school',
    'program_name',
    'degree',
    'semester',
    'lang',
    'toefl',
    'ielts',
    'gre',
    'gmat',
    'application_deadline'
]);

const ARRAY_FILTER_IDS = new Set(['country', 'programSubjects', 'tags']);

const isEmptyFilterValue = (value: unknown) =>
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0);

export const columnFiltersToProgramListFilters = (
    columnFilters: MRT_ColumnFiltersState
): ProgramListFilters => {
    const filters: ProgramListFilters = {};

    columnFilters.forEach(({ id, value }) => {
        if (isEmptyFilterValue(value)) {
            return;
        }

        if (id === 'status') {
            if (value === 'Locked' || value === 'Unlocked') {
                filters.lockStatus = value;
            }
            return;
        }

        if (ARRAY_FILTER_IDS.has(id)) {
            filters[id as keyof ProgramListFilters] = (
                Array.isArray(value) ? value : [value]
            ).map(String) as never;
            return;
        }

        if (TEXT_FILTER_IDS.has(id)) {
            filters[id as keyof ProgramListFilters] = String(value) as never;
        }
    });

    return filters;
};

/**
 * Shareable table state encoded in / decoded from the URL query string so a
 * user can copy the address bar and reproduce the exact same view for someone
 * else. We round-trip the raw MRT filter state (not the API-shaped
 * `ProgramListFilters`) so the filter inputs repopulate on load.
 */
export type ProgramListTableState = {
    globalFilter: string;
    columnFilters: MRT_ColumnFiltersState;
    sorting: MRT_SortingState;
    pagination: { pageIndex: number; pageSize: number };
};

export const DEFAULT_PROGRAM_PAGE_SIZE = 20;

const SEARCH_PARAM = 'search';
const PAGE_PARAM = 'page';
const PAGE_SIZE_PARAM = 'pageSize';
const SORT_PARAM = 'sort';
const SORT_DIR_PARAM = 'sortDir';
const RESERVED_PARAMS = new Set([
    SEARCH_PARAM,
    PAGE_PARAM,
    PAGE_SIZE_PARAM,
    SORT_PARAM,
    SORT_DIR_PARAM
]);

// Columns the backend can sort by (must match server ALLOWED_SORT_FIELDS in
// TaiGerPortalService services/programs.ts). Other columns are display-only.
export const PROGRAM_SORTABLE_IDS = new Set([
    'school',
    'program_name',
    'country',
    'degree',
    'semester',
    'updatedAt',
    'application_deadline'
]);

// Column-filter ids we know how to serialize. `status` is the lock-status
// select; the rest come from the text/array sets above.
const FILTER_IDS: string[] = [
    'status',
    ...ARRAY_FILTER_IDS,
    ...TEXT_FILTER_IDS
];

export const programTableStateToSearchParams = (
    state: ProgramListTableState
): URLSearchParams => {
    const params = new URLSearchParams();

    const trimmedSearch = state.globalFilter.trim();
    if (trimmedSearch) {
        params.set(SEARCH_PARAM, trimmedSearch);
    }

    state.columnFilters.forEach(({ id, value }) => {
        if (isEmptyFilterValue(value) || RESERVED_PARAMS.has(id)) {
            return;
        }
        params.set(
            id,
            Array.isArray(value) ? value.map(String).join(',') : String(value)
        );
    });

    const sort = state.sorting[0];
    if (sort && PROGRAM_SORTABLE_IDS.has(sort.id)) {
        params.set(SORT_PARAM, sort.id);
        params.set(SORT_DIR_PARAM, sort.desc ? 'desc' : 'asc');
    }

    // Only persist page/size when they differ from defaults to keep URLs clean.
    if (state.pagination.pageIndex > 0) {
        params.set(PAGE_PARAM, String(state.pagination.pageIndex + 1));
    }
    if (state.pagination.pageSize !== DEFAULT_PROGRAM_PAGE_SIZE) {
        params.set(PAGE_SIZE_PARAM, String(state.pagination.pageSize));
    }

    return params;
};

export const searchParamsToProgramTableState = (
    searchParams: URLSearchParams
): ProgramListTableState => {
    const globalFilter = searchParams.get(SEARCH_PARAM) ?? '';

    const columnFilters: MRT_ColumnFiltersState = [];
    FILTER_IDS.forEach((id) => {
        const raw = searchParams.get(id);
        if (raw === null || raw === '') {
            return;
        }
        if (ARRAY_FILTER_IDS.has(id)) {
            const values = raw
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
            if (values.length > 0) {
                columnFilters.push({ id, value: values });
            }
            return;
        }
        columnFilters.push({ id, value: raw });
    });

    const sortId = searchParams.get(SORT_PARAM);
    const sorting: MRT_SortingState =
        sortId && PROGRAM_SORTABLE_IDS.has(sortId)
            ? [
                  {
                      id: sortId,
                      desc: searchParams.get(SORT_DIR_PARAM) === 'desc'
                  }
              ]
            : [];

    const pageParam = Number(searchParams.get(PAGE_PARAM));
    const pageIndex =
        Number.isInteger(pageParam) && pageParam > 0 ? pageParam - 1 : 0;

    const pageSizeParam = Number(searchParams.get(PAGE_SIZE_PARAM));
    const pageSize =
        Number.isInteger(pageSizeParam) && pageSizeParam > 0
            ? pageSizeParam
            : DEFAULT_PROGRAM_PAGE_SIZE;

    return {
        globalFilter,
        columnFilters,
        sorting,
        pagination: { pageIndex, pageSize }
    };
};
