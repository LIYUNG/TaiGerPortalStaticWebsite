import { Link as LinkDom } from 'react-router-dom';
import { Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import i18next from 'i18next';

import DEMO from '@store/constant';
import { GenericTopToolbar } from '@components/table/GenericTopToolbar';

interface CourseRow {
    _id?: string;
}

interface TopToolbarProps {
    table: {
        getSelectedRowModel: () => {
            rows: { original: CourseRow }[];
        };
    };
    toolbarStyle?: object;
    onDeleteClick: () => void;
}

export const TopToolbar = ({
    table,
    toolbarStyle,
    onDeleteClick
}: TopToolbarProps) => {
    const selectedRows = table.getSelectedRowModel().rows;
    const selectedRow = selectedRows[0]?.original;

    return (
        <GenericTopToolbar
            actions={
                <>
                    <Button
                        color="error"
                        disabled={selectedRows?.length !== 1}
                        onClick={onDeleteClick}
                        startIcon={<DeleteIcon />}
                        sx={{ mr: 1 }}
                        variant="contained"
                    >
                        {i18next.t('Delete', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        component={LinkDom}
                        disabled={selectedRows?.length !== 1}
                        sx={{ mr: 1 }}
                        to={DEMO.COURSE_DATABASE_EDIT(selectedRow?._id ?? '')}
                        variant="outlined"
                    >
                        {i18next.t('Edit', { ns: 'common' })}
                    </Button>
                    <Button
                        color="primary"
                        component={LinkDom}
                        to={DEMO.COURSE_DATABASE_NEW}
                        variant="contained"
                    >
                        {i18next.t('Add New Course')}
                    </Button>
                </>
            }
            table={table}
            toolbarStyle={toolbarStyle}
        />
    );
};
