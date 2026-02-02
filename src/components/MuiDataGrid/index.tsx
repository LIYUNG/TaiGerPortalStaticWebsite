import React, { useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable
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
    renderCell?: (params: {
        value: unknown;
        row: T;
        field: string;
    }) => React.ReactNode;
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

        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    const table = useMaterialReactTable({
        columns,
        state: { isLoading },
        data: props.rows ?? [],
        getRowId: props.getRowId as ((row: T) => string) | undefined,
        enableColumnFilterModes: !simple,
        enableColumnOrdering: !simple,
        enableColumnPinning: !simple,
        enableColumnResizing: !simple,
        enableColumnFilters: !simple,
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
                maxHeight: useAutoHeight ? undefined : '600px'
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
                ...(useAutoHeight ? {} : { height: '600px' })
            }}
        >
            <MaterialReactTable table={table} />
        </Box>
    );
}
