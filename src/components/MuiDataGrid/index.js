import React, { useMemo } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable
} from 'material-react-table';
import { Box, IconButton, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';

export const MuiDataGrid = (props) => {
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

    // Convert DataGrid columns to MaterialReactTable columns
    const columns = useMemo(() => {
        return props.columns.map((column) => ({
            accessorKey: column.field,
            header: column.headerName || column.field,
            size: column.width || 150,
            Cell: column.renderCell
                ? ({ cell, row }) => {
                      // Adapt the params to match DataGrid's format
                      const params = {
                          value: cell.getValue(),
                          row: row.original,
                          field: column.field
                      };
                      return column.renderCell(params);
                  }
                : undefined,
            muiTableHeadCellProps: {
                align: column.headerAlign || column.align || 'left'
            },
            muiTableBodyCellProps: {
                align: column.align || 'left'
            }
        }));
    }, [props.columns]);

    // Handle export functionality
    const handleExportData = (rows) => {
        const csvConfig = mkConfig({
            fieldSeparator: ',',
            decimalSeparator: '.',
            useKeysAsHeaders: true,
            filename: 'export'
        });

        const rowData = rows.map((row) => {
            const exportRow = {};
            props.columns.forEach((column) => {
                const value = row.original[column.field];
                exportRow[column.headerName || column.field] =
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
        data: props.rows || [],
        getRowId: props.getRowId,
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
            ? ({ table }) => (
                  <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                      <Tooltip title="Export to CSV">
                          <IconButton
                              onClick={() =>
                                  handleExportData(
                                      table.getFilteredRowModel().rows
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
                  onClick: (event) => {
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
};
