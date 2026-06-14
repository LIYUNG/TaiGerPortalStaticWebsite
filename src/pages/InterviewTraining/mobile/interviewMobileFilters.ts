import type { MRT_ColumnFiltersState } from 'material-react-table';

export type ColumnFilterValue = unknown;

/** Read the current value of a column filter (undefined when unset). */
export const getFilterValue = (
    columnFilters: MRT_ColumnFiltersState,
    id: string
): ColumnFilterValue => columnFilters.find((filter) => filter.id === id)?.value;

const isEmptyValue = (value: ColumnFilterValue): boolean => {
    if (value === undefined || value === null || value === '') return true;
    if (Array.isArray(value)) {
        return value.length === 0 || value.every((entry) => !entry);
    }
    return false;
};

/**
 * Return a new column-filters array with `id` set to `value`, or with `id`
 * removed entirely when the value is empty. Pure — never mutates the input.
 */
export const setFilterValue = (
    columnFilters: MRT_ColumnFiltersState,
    id: string,
    value: ColumnFilterValue
): MRT_ColumnFiltersState => {
    const others = columnFilters.filter((filter) => filter.id !== id);
    return isEmptyValue(value) ? others : [...others, { id, value }];
};

/** Count how many filters are active (column filters + the free-text search). */
export const countActiveFilters = (
    columnFilters: MRT_ColumnFiltersState,
    globalFilter: string
): number => {
    const columnCount = columnFilters.filter(
        (filter) => !isEmptyValue(filter.value)
    ).length;
    return columnCount + (globalFilter.trim() !== '' ? 1 : 0);
};
