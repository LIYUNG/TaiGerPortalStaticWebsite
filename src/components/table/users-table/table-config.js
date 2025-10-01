import { Box, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export const getTableConfig = (customTableStyles, isLoading) => ({
    enableFilters: true,
    enableColumnFilters: true,
    enableEditing: true,
    enableColumnFilterModes: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    initialState: {
        showColumnFilters: true,
        showGlobalFilter: true,
        density: 'compact',
        columnPinning: {
            left: ['mrt-row-expand', 'mrt-row-select'],
            right: ['mrt-row-actions']
        },
        pagination: { pageSize: 20, pageIndex: 0 }
    },
    paginationDisplayMode: 'pages',
    muiTableProps: { sx: customTableStyles.tableHeadStyle },
    muiTableBodyRowProps: { sx: customTableStyles.tableBodyRowStyle },
    muiTableContainerProps: { sx: customTableStyles.tableContainerStyle },
    muiTablePaperProps: { sx: customTableStyles.tablePaperStyle },
    muiBottomToolbarProps: { sx: customTableStyles.tableBottomToolbarStyle },
    positionToolbarAlertBanner: 'bottom',
    muiSearchTextFieldProps: {
        placeholder: 'Loo up',
        sx: customTableStyles.searchTextFieldStyle,
        variant: 'outlined',
        InputProps: { sx: customTableStyles.searchFieldInputStyle }
    },
    muiFilterTextFieldProps: {
        sx: customTableStyles.tableFilterTextFieldStyle,
        variant: 'outlined',
        size: 'small'
    },
    muiPaginationProps: {
        rowsPerPageOptions: [10, 20, 50, 100],
        variant: 'outlined',
        SelectProps: {
            sx: customTableStyles.tablePaginationStyle
        }
    },
    muiToolbarAlertBannerProps: isLoading
        ? { color: 'info', children: 'Loading data ...' }
        : undefined,
    renderRowActions: ({ row, table }) => (
        <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title="Edit">
                <IconButton onClick={() => table.setEditingRow(row)}>
                    <EditIcon />
                </IconButton>
            </Tooltip>
        </Box>
    )
});
