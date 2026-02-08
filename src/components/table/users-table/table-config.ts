export const getTableConfig = (
    customTableStyles: {
        tableHeadStyle?: object;
        tableBodyRowStyle?: object;
        tableContainerStyle?: object;
        tablePaperStyle?: object;
        tableBottomToolbarStyle?: object;
        searchTextFieldStyle?: object;
        searchFieldInputStyle?: object;
        tableFilterTextFieldStyle?: object;
        tablePaginationStyle?: object;
    },
    isLoading?: boolean
) => ({
    enableFilters: true,
    enableColumnFilters: true,
    enableColumnFilterModes: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    initialState: {
        showColumnFilters: true,
        showGlobalFilter: true,
        density: 'compact' as const,
        columnVisibility: { programSubjects: false, tags: false },
        columnPinning: {
            left: ['mrt-row-expand', 'mrt-row-select'],
            right: ['mrt-row-actions']
        },
        pagination: { pageSize: 20, pageIndex: 0 }
    },
    paginationDisplayMode: 'pages' as const,
    muiTableProps: { sx: customTableStyles.tableHeadStyle },
    muiTableBodyRowProps: { sx: customTableStyles.tableBodyRowStyle },
    muiTableContainerProps: { sx: customTableStyles.tableContainerStyle },
    muiTablePaperProps: { sx: customTableStyles.tablePaperStyle },
    muiBottomToolbarProps: { sx: customTableStyles.tableBottomToolbarStyle },
    positionToolbarAlertBanner: 'bottom' as const,
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
        ? { color: 'info' as const, children: 'Loading data ...' }
        : undefined
});
