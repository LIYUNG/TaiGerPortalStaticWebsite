import type { MRT_ColumnFiltersState } from 'material-react-table';

/** Whether a column-filter value counts as "set". Mirrors isEmptyFilterValue
 *  in programListFilters so the mobile UI and the server query agree. */
export const isFilterValueSet = (value: unknown): boolean =>
    !(
        value == null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
    );

/** Read the current value of a column filter (undefined when unset). */
export const getColumnFilterValue = (
    filters: MRT_ColumnFiltersState,
    id: string
): unknown => filters.find((filter) => filter.id === id)?.value;

/** Upsert a column filter value (removing it when empty). Returns a new array —
 *  feed it straight to the shared `setColumnFilters` so the debounced query and
 *  the desktop table stay in sync. */
export const setColumnFilterValue = (
    filters: MRT_ColumnFiltersState,
    id: string,
    value: unknown
): MRT_ColumnFiltersState => {
    const without = filters.filter((filter) => filter.id !== id);
    return isFilterValueSet(value) ? [...without, { id, value }] : without;
};

/** Number of active filters (column filters + the global search), for a badge. */
export const countActiveFilters = (
    filters: MRT_ColumnFiltersState,
    globalFilter: string
): number =>
    filters.filter((filter) => isFilterValueSet(filter.value)).length +
    (globalFilter.trim() ? 1 : 0);
