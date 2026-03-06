import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import { useTranslation } from 'react-i18next';

import { GenericTopToolbar } from '@components/table/GenericTopToolbar';

interface UserRow {
    firstname: string;
    lastname: string;
    _id: string;
    role?: string;
    archiv?: boolean;
}

interface TopToolbarProps {
    table: {
        getSelectedRowModel: () => {
            rows: { original: UserRow }[];
        };
    };
    toolbarStyle?: object;
    onEditClick: (
        firstname: string,
        lastname: string,
        role: string,
        id: string
    ) => void;
    onDeleteClick: (firstname: string, lastname: string, id: string) => void;
    onArchiveClick: (
        firstname: string,
        lastname: string,
        id: string,
        archiv?: boolean
    ) => void;
}

export const TopToolbar = ({
    table,
    toolbarStyle,
    onEditClick,
    onDeleteClick,
    onArchiveClick
}: TopToolbarProps) => {
    const { t } = useTranslation();
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedRow = selectedRows?.[0]?.original;

    return (
        <GenericTopToolbar
            actions={
                <>
                    <Button
                        color="error"
                        disabled={!selectedRow || selectedRows?.length !== 1}
                        onClick={() => {
                            if (selectedRow) {
                                onDeleteClick(
                                    selectedRow.firstname,
                                    selectedRow.lastname,
                                    selectedRow._id
                                );
                            }
                        }}
                        startIcon={<DeleteIcon />}
                        variant="contained"
                    >
                        {t('Delete', { ns: 'common' })}
                    </Button>
                    <Button
                        color="success"
                        disabled={!selectedRow || selectedRows?.length !== 1}
                        onClick={() => {
                            if (selectedRow) {
                                onEditClick(
                                    selectedRow.firstname,
                                    selectedRow.lastname,
                                    selectedRow.role ?? '',
                                    selectedRow._id
                                );
                            }
                        }}
                        startIcon={<EditIcon />}
                        sx={{ mr: 1 }}
                        variant="contained"
                    >
                        {t('Edit', { ns: 'common' })}
                    </Button>
                    <Button
                        color="warning"
                        disabled={!selectedRow || selectedRows?.length !== 1}
                        onClick={() => {
                            if (selectedRow) {
                                onArchiveClick(
                                    selectedRow.firstname,
                                    selectedRow.lastname,
                                    selectedRow._id,
                                    selectedRow.archiv
                                );
                            }
                        }}
                        startIcon={<ArchiveIcon />}
                        variant="contained"
                    >
                        {t('Archive', { ns: 'common' })}
                    </Button>
                </>
            }
            layout="inline"
            table={table}
            toolbarStyle={toolbarStyle}
        />
    );
};
