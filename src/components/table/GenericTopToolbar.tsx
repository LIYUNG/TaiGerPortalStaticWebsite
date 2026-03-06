import { type ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import {
    MRT_GlobalFilterTextField as MRTGlobalFilterTextField,
    MRT_ToggleFiltersButton as MRTToggleFiltersButton
} from 'material-react-table';

interface GenericTopToolbarTable {
    getSelectedRowModel: () => { rows: unknown[] };
    getRowModel?: () => { rows: unknown[] };
    getPrePaginationRowModel?: () => { rows: unknown[] };
    setColumnFilters?: (updater: unknown) => void;
}

interface GenericTopToolbarProps {
    table: GenericTopToolbarTable;
    toolbarStyle?: object;
    /** Action buttons rendered on the right side */
    actions?: ReactNode;
    /** Extra filter elements in the filter row (e.g. Autocomplete dropdowns) */
    filterExtras?: ReactNode;
    /**
     * 'default': filters on the left, actions right-aligned on same row (default).
     * 'inline': single Stack row with filter left and actions right,
     *           no toggle-filters button — used by users-table.
     */
    layout?: 'default' | 'inline';
}

export const GenericTopToolbar = ({
    table,
    toolbarStyle,
    actions,
    filterExtras,
    layout = 'default'
}: GenericTopToolbarProps) => {
    if (layout === 'inline') {
        return (
            <Box sx={toolbarStyle}>
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ width: '100%' }}
                >
                    <Box sx={{ minWidth: 200 }}>
                        <MRTGlobalFilterTextField table={table} />
                    </Box>
                    <Stack direction="row" spacing={1}>
                        {actions}
                    </Stack>
                </Stack>
            </Box>
        );
    }

    return (
        <Box sx={toolbarStyle}>
            <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <MRTGlobalFilterTextField table={table} />
                <MRTToggleFiltersButton sx={{ height: '40px' }} table={table} />
                {filterExtras}
            </Box>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                {actions}
            </Stack>
        </Box>
    );
};
