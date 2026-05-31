import React, { useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
    type MRT_PaginationState,
    type MRT_SortingState,
    type MRT_ColumnFiltersState,
    type MRT_Updater
} from 'material-react-table';
import { Box, IconButton, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';

export interface MuiDataGridColumn<T = unknown> {
    field: string;
    headerName?: string;
    width?: number;
    minWidth?: number;
    flex?: number;
    headerAlign?: 'left' | 'center' | 'right';
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    /** Set false to hide this column's filter control (server mode). */
    enableColumnFilter?: boolean;
    /** Filter input type. Use 'select' for a fixed set of values. */
    filterVariant?: 'text' | 'select' | 'multi-select' | 'range' | 'checkbox';
    /** Options for a 'select'/'multi-select' filter. */
    filterSelectOptions?: Array<string | { label: string; value: string }>;
    renderCell?: (params: {
        value: unknown;
        row: T;
        field: string;
    }) => React.ReactNode;
}

/**
 * Opt-in server-side mode. When provided, the grid stops doing its own
 * pagination/sorting/filtering and instead reflects the controlled state and
 * forwards user interactions to the parent (which refetches). Leave undefined
 * for the default fully client-side behaviour.
 */
export interface MuiDataGridServerMode {
    /** Total number of matching rows across all pages (unpaginated count). */
    rowCount: number;
    pagination: MRT_PaginationState;
    onPaginationChange: (updater: MRT_Updater<MRT_PaginationState>) => void;
    sorting: MRT_SortingState;
    onSortingChange: (updater: MRT_Updater<MRT_SortingState>) => void;
    globalFilter: string;
    onGlobalFilterChange: (updater: MRT_Updater<string>) => void;
    columnFilters?: MRT_ColumnFiltersState;
    onColumnFiltersChange?: (
        updater: MRT_Updater<MRT_ColumnFiltersState>
    ) => void;
}

export interface MuiDataGridProps<T extends Record<string, unknown>> {
    columns: MuiDataGridColumn<T>[];
    rows: T[];
    getRowId?: (row: T) => string;
    isLoading?: boolean;
    simple?: boolean;
    noPagination?: boolean;
    autoHeight?: boolean;
    columnVisibilityModel?: Record<string, boolean>;
    onRowClick?: (row: T, event: React.MouseEvent<HTMLTableRowElement>) => void;
    /** When set, the grid runs in server-side pagination/sort/filter mode. */
    serverMode?: MuiDataGridServerMode;
}

export function MuiDataGrid<T extends Record<string, unknown>>(
    props: MuiDataGridProps<T>
) {
    const {
        isLoading = false,
        simple = false,
        noPagination = false,
        autoHeight: propAutoHeight,
        columnVisibilityModel = {},
        onRowClick
    } = props;

    const useAutoHeight =
        propAutoHeight !== undefined ? propAutoHeight : simple || noPagination;
    const showFooter = !(simple || noPagination);

    const columns = useMemo(() => {
        return props.columns.map((column) => ({
            accessorKey: column.field,
            header: column.headerName ?? column.field,
            size: column.width ?? 150,
            ...(column.sortable === false ? { enableSorting: false } : {}),
            ...(column.enableColumnFilter === false
                ? { enableColumnFilter: false }
                : {}),
            ...(column.filterVariant
                ? { filterVariant: column.filterVariant }
                : {}),
            ...(column.filterSelectOptions
                ? { filterSelectOptions: column.filterSelectOptions }
                : {}),
            Cell:
                column.renderCell != null
                    ? ({
                          cell,
                          row
                      }: {
                          cell: { getValue: () => unknown };
                          row: { original: T };
                      }) => {
                          const params = {
                              value: cell.getValue(),
                              row: row.original,
                              field: column.field
                          };
                          return column.renderCell?.(params);
                      }
                    : undefined,
            muiTableHeadCellProps: {
                align: column.headerAlign ?? column.align ?? 'left'
            },
            muiTableBodyCellProps: {
                align: column.align ?? 'left'
            }
        }));
    }, [props.columns]);

    const handleExportData = (rows: { original: T }[]) => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            filename: 'export'
        });

        const rowData = rows.map((row) => {
            const exportRow: Record<string, unknown> = {};
            props.columns.forEach((column) => {
                const value = row.original[column.field as keyof T];
                exportRow[column.headerName ?? column.field] =
                    value !== undefined && value !== null ? value : '';
            });
            return exportRow;
        });

        const csv = generateCsv(csvConfig)(
            rowData as { [k: string]: string | number }[]
        );
        download(csvConfig)(csv);
    };

    const server = props.serverMode;

    const table = useMaterialReactTable({
        columns,
        state: {
            isLoading,
            ...(server
                ? {
                      pagination: server.pagination,
                      sorting: server.sorting,
                      globalFilter: server.globalFilter,
                      ...(server.columnFilters
                          ? { columnFilters: server.columnFilters }
                          : {})
                  }
                : {})
        },
        data: props.rows ?? [],
        getRowId: props.getRowId as ((row: T) => string) | undefined,
        ...(server
            ? {
                  manualPagination: true,
                  manualSorting: true,
                  manualFiltering: true,
                  rowCount: server.rowCount,
                  onPaginationChange: server.onPaginationChange,
                  onSortingChange: server.onSortingChange,
                  onGlobalFilterChange: server.onGlobalFilterChange,
                  ...(server.onColumnFiltersChange
                      ? { onColumnFiltersChange: server.onColumnFiltersChange }
                      : {})
              }
            : {}),
        enableColumnFilterModes: !simple,
        enableColumnOrdering: !simple,
        enableColumnPinning: !simple,
        enableColumnResizing: !simple,
        // In server mode, per-column filters only make sense when the parent
        // handles them; otherwise they would be dead UI (manualFiltering = on).
        enableColumnFilters:
            !simple && (!server || Boolean(server.onColumnFiltersChange)),
        enableRowSelection: false,
        enablePagination: showFooter,
        enableBottomToolbar: showFooter,
        enableTopToolbar: !simple,
        enableGlobalFilter: !simple,
        enableDensityToggle: !simple,
        enableFullScreenToggle: !simple,
        enableHiding: !simple,
        initialState: {
            showColumnFilters: !simple,
            showGlobalFilter: !simple,
            density: 'compact',
            columnVisibility: columnVisibilityModel,
            pagination: { pageSize: 20, pageIndex: 0 }
        },
        paginationDisplayMode: showFooter ? 'pages' : undefined,
        positionToolbarAlertBanner: 'bottom',
        muiSearchTextFieldProps: {
            size: 'small',
            variant: 'outlined',
            placeholder: 'Search...'
        },
        muiPaginationProps: {
            color: 'secondary',
            rowsPerPageOptions: [10, 20, 50, 100],
            shape: 'rounded',
            variant: 'outlined'
        },
        muiTableContainerProps: {
            sx: {
                maxHeight: useAutoHeight ? undefined : 600
            }
        },
        renderTopToolbarCustomActions: !simple
            ? ({ table: tbl }) => (
                  <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                      <Tooltip title="Export to CSV">
                          <IconButton
                              onClick={() =>
                                  handleExportData(
                                      tbl.getFilteredRowModel().rows
                                  )
                              }
                          >
                              <FileDownloadIcon />
                          </IconButton>
                      </Tooltip>
                  </Box>
              )
            : undefined,
        muiTableBodyRowProps: onRowClick
            ? ({ row }) => ({
                  onClick: (event: React.MouseEvent<HTMLTableRowElement>) => {
                      onRowClick(row.original, event);
                  },
                  sx: {
                      cursor: 'pointer',
                      '&:hover': {
                          backgroundColor: 'action.hover'
                      }
                  }
              })
            : undefined
    });

    return (
        <Box
            sx={{
                width: '100%',
                ...(useAutoHeight ? {} : { height: 600 })
            }}
        >
            <MaterialReactTable table={table} />
        </Box>
    );
}
