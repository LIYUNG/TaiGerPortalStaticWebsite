import { Box, Button, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import { useTranslation } from 'react-i18next';
import { MRT_GlobalFilterTextField as MRTGlobalFilterTextField } from 'material-react-table';

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
                </Stack>
            </Stack>
        </Box>
    );
};
