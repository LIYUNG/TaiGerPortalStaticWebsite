import type {
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState
} from 'material-react-table';

/**
 * Shared helpers for mirroring a server-mode Material-React-Table's
 * search/sort/filter/pagination state into the URL query string, so a view is
 * shareable and survives a refresh. Each table supplies a small config; the
 * round-trip logic lives here so every table behaves identically.
 */
export interface MrtUrlStateConfig {
    /** Column ids that expose a server filter (used as URL keys). */
    filterIds: readonly string[];
    /** Subset of `filterIds` whose value is a multi-select array. */
    arrayFilterIds?: ReadonlySet<string>;
    /** Column ids the backend can sort by (validates the `sort` param). */
    sortableIds: readonly string[];
    /** Sort applied when the URL has no (valid) sort param. */
    defaultSort: { id: string; desc: boolean };
    /** Page size applied when the URL has no (valid) `pageSize` param. */
    defaultPageSize?: number;
}

export interface MrtTableState {
    globalFilter: string;
    /** This family of tables sorts by a single column (MRT supports multi). */
    sorting: MRT_SortingState;
    columnFilters: MRT_ColumnFiltersState;
    pagination: MRT_PaginationState;
}

const SEARCH_PARAM = 'search';
const PAGE_PARAM = 'page';
const PAGE_SIZE_PARAM = 'pageSize';
const SORT_PARAM = 'sort';
const SORT_DIR_PARAM = 'sortDir';
const FALLBACK_PAGE_SIZE = 20;

/**
 * Every query-string key a table owns. Used to clear stale values before
 * writing the current ones, so unrelated params (e.g. the active `tab`) survive.
 */
export const mrtOwnedParamKeys = (config: MrtUrlStateConfig): string[] => [
    SEARCH_PARAM,
    PAGE_PARAM,
    PAGE_SIZE_PARAM,
    SORT_PARAM,
    SORT_DIR_PARAM,
    ...config.filterIds
];

/** Encode table state as a shareable query string (defaults are omitted). */
export const mrtStateToSearchParams = (
    state: MrtTableState,
    config: MrtUrlStateConfig
): URLSearchParams => {
    const params = new URLSearchParams();
    const defaultPageSize = config.defaultPageSize ?? FALLBACK_PAGE_SIZE;
    const filterIdSet = new Set(config.filterIds);

    const search = state.globalFilter.trim();
    if (search) {
        params.set(SEARCH_PARAM, search);
    }

    state.columnFilters.forEach(({ id, value }) => {
        if (!filterIdSet.has(id)) {
            return;
        }
        if (Array.isArray(value)) {
            const joined = value.filter(Boolean).map(String).join(',');
            if (joined) {
                params.set(id, joined);
            }
        } else if (typeof value === 'string' && value !== '') {
            params.set(id, value);
        }
    });

    const sort = state.sorting[0];
    if (
        sort &&
        config.sortableIds.includes(sort.id) &&
        !(
            sort.id === config.defaultSort.id &&
            sort.desc === config.defaultSort.desc
        )
    ) {
        params.set(SORT_PARAM, sort.id);
        params.set(SORT_DIR_PARAM, sort.desc ? 'desc' : 'asc');
    }

    if (state.pagination.pageIndex > 0) {
        params.set(PAGE_PARAM, String(state.pagination.pageIndex + 1));
    }
    if (state.pagination.pageSize !== defaultPageSize) {
        params.set(PAGE_SIZE_PARAM, String(state.pagination.pageSize));
    }

    return params;
};

/** Decode a shared query string back into MRT state. */
export const searchParamsToMrtState = (
    searchParams: URLSearchParams,
    config: MrtUrlStateConfig
): MrtTableState => {
    const defaultPageSize = config.defaultPageSize ?? FALLBACK_PAGE_SIZE;
    const arrayIds = config.arrayFilterIds ?? new Set<string>();

    const globalFilter = searchParams.get(SEARCH_PARAM) ?? '';

    const columnFilters: MRT_ColumnFiltersState = [];
    config.filterIds.forEach((id) => {
        const raw = searchParams.get(id);
        if (raw === null || raw === '') {
            return;
        }
        if (arrayIds.has(id)) {
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
        sortId && config.sortableIds.includes(sortId)
            ? [
                  {
                      id: sortId,
                      desc: searchParams.get(SORT_DIR_PARAM) === 'desc'
                  }
              ]
            : [{ id: config.defaultSort.id, desc: config.defaultSort.desc }];

    const pageParam = Number(searchParams.get(PAGE_PARAM));
    const pageIndex =
        Number.isInteger(pageParam) && pageParam > 0 ? pageParam - 1 : 0;

    const pageSizeParam = Number(searchParams.get(PAGE_SIZE_PARAM));
    const pageSize =
        Number.isInteger(pageSizeParam) && pageSizeParam > 0
            ? pageSizeParam
            : defaultPageSize;

    return {
        globalFilter,
        sorting,
        columnFilters,
        pagination: { pageIndex, pageSize }
    };
};

/**
 * Merge the table's current state into an existing query string, replacing only
 * the keys this table owns and preserving everything else (e.g. `tab`).
 */
export const writeMrtTableParams = (
    prev: URLSearchParams,
    state: MrtTableState,
    config: MrtUrlStateConfig
): URLSearchParams => {
    const next = new URLSearchParams(prev);
    mrtOwnedParamKeys(config).forEach((key) => next.delete(key));
    mrtStateToSearchParams(state, config).forEach((value, key) =>
        next.set(key, value)
    );
    return next;
};
