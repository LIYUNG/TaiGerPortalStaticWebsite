import { Box, Button, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import { useTranslation } from 'react-i18next';

export const TopToolbar = ({
    table,
    toolbarStyle,
    onEditClick,
    onAddClick,
    onDeleteClick,
    onArchiveClick
}) => {
    const { t } = useTranslation();
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedRow = table.getSelectedRowModel().rows[0]?.original;
    return (
        <Box sx={toolbarStyle}>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                    color="error"
                    disabled={selectedRows?.length !== 1}
                    onClick={onDeleteClick}
                    startIcon={<DeleteIcon />}
                    variant="contained"
                >
                    {t('Delete', { ns: 'common' })}
                </Button>
                <Button
                    color="success"
                    disabled={selectedRows?.length !== 1}
                    onClick={() =>
                        onEditClick(
                            selectedRow.firstname,
                            selectedRow.lastname,
                            selectedRow.role,
                            selectedRow._id
                        )
                    }
                    startIcon={<EditIcon />}
                    sx={{ mr: 1 }}
                    variant="contained"
                >
                    {t('Edit', { ns: 'common' })}
                </Button>
                <Button
                    color="warning"
                    disabled={selectedRows?.length !== 1}
                    onClick={() =>
                        onArchiveClick(
                            selectedRow.firstname,
                            selectedRow.lastname,
                            selectedRow._id,
                            selectedRow.archiv
                        )
                    }
                    startIcon={<ArchiveIcon />}
                    variant="contained"
                >
                    {t('Archive', { ns: 'common' })}
                </Button>
                <Button
                    color="primary"
                    onClick={onAddClick}
                    variant="contained"
                >
                    {t('Add New User')}
                </Button>
            </Stack>
        </Box>
    );
};
