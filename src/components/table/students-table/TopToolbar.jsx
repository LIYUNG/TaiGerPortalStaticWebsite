import { Box, Button, Stack } from '@mui/material';
import {
    MRT_GlobalFilterTextField as MRTGlobalFilterTextField,
    MRT_ToggleFiltersButton as MRTToggleFiltersButton
} from 'material-react-table';
import i18next from 'i18next';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArchiveIcon from '@mui/icons-material/Archive';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export const TopToolbar = ({
    table,
    toolbarStyle,
    onArchiveClick,
    onAttributesClick,
    onAgentClick,
    onEditorClick,
    onExportClick
}) => {
    const selectedRows = table.getSelectedRowModel().rows;

    return (
        <Box sx={toolbarStyle}>
            <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <MRTGlobalFilterTextField table={table} />
                <MRTToggleFiltersButton sx={{ height: '40px' }} table={table} />
            </Box>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                    disabled={table.getRowModel().rows.length === 0}
                    //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
                    onClick={() =>
                        onExportClick(table.getPrePaginationRowModel().rows)
                    }
                    startIcon={<FileDownloadIcon />}
                    variant="contained"
                >
                    Export CSV
                </Button>
                <Button
                    color="error"
                    disabled={selectedRows?.length !== 1}
                    onClick={onArchiveClick}
                    startIcon={<ArchiveIcon />}
                    sx={{ mr: 1 }}
                    variant="contained"
                >
                    {i18next.t('Archive')}
                </Button>
                <Button
                    color="success"
                    disabled={selectedRows?.length !== 1}
                    onClick={onAttributesClick}
                    sx={{ mr: 1 }}
                    variant="contained"
                >
                    {i18next.t('Attributes')}
                </Button>
                <Button
                    color="secondary"
                    disabled={selectedRows?.length !== 1}
                    onClick={onAgentClick}
                    startIcon={<PersonAddIcon />}
                    sx={{ mr: 1 }}
                    variant="contained"
                >
                    {i18next.t('Assign Agents')}
                </Button>
                <Button
                    color="success"
                    disabled={selectedRows?.length !== 1}
                    onClick={onEditorClick}
                    startIcon={<PersonAddIcon />}
                    sx={{ mr: 1 }}
                    variant="contained"
                >
                    {i18next.t('Assign Editors')}
                </Button>
            </Stack>
        </Box>
    );
};
