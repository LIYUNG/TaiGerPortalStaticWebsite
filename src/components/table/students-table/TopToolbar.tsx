import { Button } from '@mui/material';
import i18next from 'i18next';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArchiveIcon from '@mui/icons-material/Archive';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { GenericTopToolbar } from '@components/table/GenericTopToolbar';

interface TopToolbarProps {
    table: {
        getSelectedRowModel: () => { rows: unknown[] };
        getRowModel: () => { rows: unknown[] };
        getPrePaginationRowModel: () => { rows: unknown[] };
    };
    toolbarStyle?: object;
    onArchiveClick: () => void;
    onAttributesClick: () => void;
    onAgentClick: () => void;
    onEditorClick: () => void;
    onExportClick: (rows: unknown[]) => void;
}

export const TopToolbar = ({
    table,
    toolbarStyle,
    onArchiveClick,
    onAttributesClick,
    onAgentClick,
    onEditorClick,
    onExportClick
}: TopToolbarProps) => {
    const selectedRows = table.getSelectedRowModel().rows;

    return (
        <GenericTopToolbar
            actions={
                <>
                    <Button
                        disabled={table.getRowModel().rows.length === 0}
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
                        {i18next.t('Archive', { ns: 'common' })}
                    </Button>
                    <Button
                        color="success"
                        disabled={selectedRows?.length !== 1}
                        onClick={onAttributesClick}
                        sx={{ mr: 1 }}
                        variant="contained"
                    >
                        {i18next.t('Attributes', { ns: 'common' })}
                    </Button>
                    <Button
                        color="secondary"
                        disabled={selectedRows?.length !== 1}
                        onClick={onAgentClick}
                        startIcon={<PersonAddIcon />}
                        sx={{ mr: 1 }}
                        variant="contained"
                    >
                        {i18next.t('Assign Agents', { ns: 'common' })}
                    </Button>
                    <Button
                        color="success"
                        disabled={selectedRows?.length !== 1}
                        onClick={onEditorClick}
                        startIcon={<PersonAddIcon />}
                        sx={{ mr: 1 }}
                        variant="contained"
                    >
                        {i18next.t('Assign Editors', { ns: 'common' })}
                    </Button>
                </>
            }
            table={table}
            toolbarStyle={toolbarStyle}
        />
    );
};
