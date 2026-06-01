import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
    type MRT_RowSelectionState,
    type MRT_VisibilityState,
    type MRT_PaginationState,
    type MRT_SortingState,
    type MRT_ColumnFiltersState,
    type MRT_Updater
} from 'material-react-table';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

/**
 * Opt-in server-side mode: the table reflects controlled pagination/sort/filter
 * state and forwards changes to the parent (which refetches). Omit for the
 * default client-side behaviour.
 */
export interface MRTableServerMode {
    rowCount: number;
    isLoading?: boolean;
    pagination: MRT_PaginationState;
    onPaginationChange: (updater: MRT_Updater<MRT_PaginationState>) => void;
    sorting: MRT_SortingState;
    onSortingChange: (updater: MRT_Updater<MRT_SortingState>) => void;
    globalFilter: string;
    onGlobalFilterChange: (updater: MRT_Updater<string>) => void;
    columnFilters: MRT_ColumnFiltersState;
    onColumnFiltersChange: (
        updater: MRT_Updater<MRT_ColumnFiltersState>
    ) => void;
}

export interface MRTableProps<T extends Record<string, unknown>> {
    columns: MRT_ColumnDef<T>[];
    data: T[];
    enableRowSelection?: boolean;
    enableMultiRowSelection?: boolean;
    muiTableBodyRowProps?: (props: { row: { original: T } }) => object;
    onRowSelectionChange?: (
        updater: (old: MRT_RowSelectionState) => MRT_RowSelectionState
    ) => void;
    rowSelection?: MRT_RowSelectionState;
    columnVisibilityModel?: MRT_VisibilityState;
    serverMode?: MRTableServerMode;
}

function MRTable<T extends Record<string, unknown>>({
    columns,
    data,
    enableRowSelection,
    enableMultiRowSelection,
    muiTableBodyRowProps,
    onRowSelectionChange,
    rowSelection,
    columnVisibilityModel = {},
    serverMode
}: MRTableProps<T>) {
    const table = useMaterialReactTable({
        columns,
        data,
        onRowSelectionChange: onRowSelectionChange as
            | undefined
            | ((value: unknown) => void),
        state: {
            ...(rowSelection ? { rowSelection } : {}),
            ...(serverMode
                ? {
                      isLoading: serverMode.isLoading ?? false,
                      pagination: serverMode.pagination,
                      sorting: serverMode.sorting,
                      globalFilter: serverMode.globalFilter,
                      columnFilters: serverMode.columnFilters
                  }
                : {})
        },
        ...(serverMode
            ? {
                  manualPagination: true,
                  manualSorting: true,
                  manualFiltering: true,
                  rowCount: serverMode.rowCount,
                  onPaginationChange: serverMode.onPaginationChange,
                  onSortingChange: serverMode.onSortingChange,
                  onGlobalFilterChange: serverMode.onGlobalFilterChange,
                  onColumnFiltersChange: serverMode.onColumnFiltersChange
              }
            : {}),
        enableColumnFilterModes: true,
        enableColumnOrdering: true,
        enableColumnPinning: true,
        enableColumnResizing: true,
        enableColumnFilters: true,
        enableRowSelection: enableRowSelection ?? false,
        enableMultiRowSelection: enableMultiRowSelection ?? false,
        muiTableBodyRowProps: muiTableBodyRowProps ?? undefined,
        initialState: {
            showColumnFilters: true,
            showGlobalFilter: true,
            density: 'compact',
            columnVisibility: { ...columnVisibilityModel },
            columnPinning: {
                left: ['mrt-row-expand', 'mrt-row-select'],
                right: ['mrt-row-actions']
            },
            pagination: { pageSize: 20, pageIndex: 0 }
        },
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',
        muiSearchTextFieldProps: {
            size: 'small',
            variant: 'outlined'
        },
        muiPaginationProps: {
            color: 'secondary',
            rowsPerPageOptions: [10, 20, 50, 100],
            shape: 'rounded',
            variant: 'outlined'
        }
    });

    return <MaterialReactTable table={table} />;
}

export interface ExampleWithLocalizationProviderProps<
    T extends Record<string, unknown>
> {
    col: MRT_ColumnDef<T>[];
    data: T[];
    enableRowSelection?: boolean;
    enableMultiRowSelection?: boolean;
    muiTableBodyRowProps?: (props: { row: { original: T } }) => object;
    onRowSelectionChange?: (
        updater: (old: MRT_RowSelectionState) => MRT_RowSelectionState
    ) => void;
    rowSelection?: MRT_RowSelectionState;
    serverMode?: MRTableServerMode;
}

function ExampleWithLocalizationProvider<T extends Record<string, unknown>>({
    col,
    data,
    enableRowSelection,
    enableMultiRowSelection,
    muiTableBodyRowProps,
    onRowSelectionChange,
    rowSelection,
    serverMode
}: ExampleWithLocalizationProviderProps<T>) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MRTable
                columns={col}
                data={data}
                enableMultiRowSelection={enableMultiRowSelection}
                enableRowSelection={enableRowSelection}
                muiTableBodyRowProps={muiTableBodyRowProps}
                onRowSelectionChange={onRowSelectionChange}
                rowSelection={rowSelection}
                serverMode={serverMode}
            />
        </LocalizationProvider>
    );
}

export default ExampleWithLocalizationProvider;
