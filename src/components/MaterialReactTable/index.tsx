import React from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_ColumnDef,
    type MRT_RowSelectionState,
    type MRT_TableInstance,
    type MRT_ColumnVisibilityState
} from 'material-react-table';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

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
    columnVisibilityModel?: MRT_ColumnVisibilityState;
}

function MRTable<T extends Record<string, unknown>>({
    columns,
    data,
    enableRowSelection,
    enableMultiRowSelection,
    muiTableBodyRowProps,
    onRowSelectionChange,
    rowSelection,
    columnVisibilityModel = {}
}: MRTableProps<T>) {
    const table = useMaterialReactTable({
        columns,
        data,
        onRowSelectionChange: onRowSelectionChange ?? undefined,
        state: rowSelection ? { rowSelection } : undefined,
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
            columnVisibilityModel: { ...columnVisibilityModel },
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
    col: object[];
    data: T[];
    enableRowSelection?: boolean;
    enableMultiRowSelection?: boolean;
    muiTableBodyRowProps?: (props: { row: { original: T } }) => object;
    onRowSelectionChange?: (
        updater: (old: RowSelectionState) => RowSelectionState
    ) => void;
    rowSelection?: RowSelectionState;
}

function ExampleWithLocalizationProvider<T extends Record<string, unknown>>({
    col,
    data,
    enableRowSelection,
    enableMultiRowSelection,
    muiTableBodyRowProps,
    onRowSelectionChange,
    rowSelection
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
            />
        </LocalizationProvider>
    );
}

export default ExampleWithLocalizationProvider;
