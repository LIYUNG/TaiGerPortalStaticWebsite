import {
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
    MRT_ColumnFiltersState,
    MRT_PaginationState,
    MRT_SortingState,
    MRT_Updater
} from 'material-react-table';

import {
    defaultMrtState,
    mrtStateToSearchParams,
    searchParamsToMrtState,
    type MrtUrlStateConfig
} from './mrtUrlState';

const TAB_PARAM = 'tab';

/** Apply an MRT updater (value | (old) => new) to the current value. */
const applyUpdater = <T>(updater: MRT_Updater<T>, current: T): T =>
    typeof updater === 'function'
        ? (updater as (old: T) => T)(current)
        : updater;

const tabIndexFromSlug = (
    slug: string | null,
    slugs: readonly string[]
): number => {
    const index = slugs.indexOf(slug ?? '');
    return index >= 0 ? index : 0;
};

export interface MrtTabUrlState {
    /** Active tab index (0-based), seeded from the `?tab=<slug>` param. */
    tab: number;
    pagination: MRT_PaginationState;
    sorting: MRT_SortingState;
    globalFilter: string;
    columnFilters: MRT_ColumnFiltersState;
    handleTabChange: (event: SyntheticEvent, newValue: number) => void;
    handleSortingChange: (updater: MRT_Updater<MRT_SortingState>) => void;
    handleGlobalFilterChange: (updater: MRT_Updater<string>) => void;
    handleColumnFiltersChange: (
        updater: MRT_Updater<MRT_ColumnFiltersState>
    ) => void;
    handlePaginationChange: (updater: MRT_Updater<MRT_PaginationState>) => void;
}

/**
 * Tab + server-mode table state (search/sort/filter/pagination) kept in sync
 * with the URL query string, so a dashboard view is shareable and survives a
 * refresh. The active tab is a readable slug (?tab=in-progress); switching tabs
 * resets the query so each tab opens on a clean view.
 *
 * `config` and `tabSlugs` must be stable references (module-level constants):
 * the URL is read once on mount and written one-way (state -> URL) thereafter.
 */
export function useMrtTabUrlState(
    config: MrtUrlStateConfig,
    tabSlugs: readonly string[]
): MrtTabUrlState {
    const [searchParams, setSearchParams] = useSearchParams();

    const initial = useMemo(
        () => searchParamsToMrtState(searchParams, config),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
    const [tab, setTab] = useState(() =>
        tabIndexFromSlug(searchParams.get(TAB_PARAM), tabSlugs)
    );
    const [pagination, setPagination] = useState<MRT_PaginationState>(
        initial.pagination
    );
    const [sorting, setSorting] = useState<MRT_SortingState>(initial.sorting);
    const [globalFilter, setGlobalFilter] = useState(initial.globalFilter);
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        initial.columnFilters
    );

    // Single source of truth -> URL. A full (replace) write keeps the URL clean
    // and naturally drops stale params when a tab switch resets the query.
    useEffect(() => {
        const params = mrtStateToSearchParams(
            { globalFilter, sorting, columnFilters, pagination },
            config
        );
        params.set(TAB_PARAM, tabSlugs[tab] ?? tabSlugs[0]);
        setSearchParams(params, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        tab,
        globalFilter,
        sorting,
        columnFilters,
        pagination,
        setSearchParams
    ]);

    const resetPage = useCallback(
        () => setPagination((prev) => ({ ...prev, pageIndex: 0 })),
        []
    );

    const handleTabChange = useCallback(
        (_event: SyntheticEvent, newValue: number) => {
            setTab(newValue);
            // Reset the query on tab switch: each tab opens on a clean view.
            const defaults = defaultMrtState(config);
            setSorting(defaults.sorting);
            setGlobalFilter(defaults.globalFilter);
            setColumnFilters(defaults.columnFilters);
            setPagination(defaults.pagination);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );
    const handleSortingChange = useCallback(
        (updater: MRT_Updater<MRT_SortingState>) => {
            setSorting((prev) => applyUpdater(updater, prev));
            resetPage();
        },
        [resetPage]
    );
    const handleGlobalFilterChange = useCallback(
        (updater: MRT_Updater<string>) => {
            setGlobalFilter((prev) => applyUpdater(updater, prev));
            resetPage();
        },
        [resetPage]
    );
    const handleColumnFiltersChange = useCallback(
        (updater: MRT_Updater<MRT_ColumnFiltersState>) => {
            setColumnFilters((prev) => applyUpdater(updater, prev));
            resetPage();
        },
        [resetPage]
    );
    const handlePaginationChange = useCallback(
        (updater: MRT_Updater<MRT_PaginationState>) => {
            setPagination((prev) => applyUpdater(updater, prev));
        },
        []
    );

    return {
        tab,
        pagination,
        sorting,
        globalFilter,
        columnFilters,
        handleTabChange,
        handleSortingChange,
        handleGlobalFilterChange,
        handleColumnFiltersChange,
        handlePaginationChange
    };
}
