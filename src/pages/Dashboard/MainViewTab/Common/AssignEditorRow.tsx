import { TableRow, TableCell, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { t } from 'i18next';

import type { TasksOverview } from '@api/types';
import DEMO from '@store/constant';

const AssignEditorRow = ({
    tasksOverview
}: {
    tasksOverview: TasksOverview;
}) => {
    return (
        <TableRow>
            <TableCell>
                <Link component={LinkDom} to={`${DEMO.ASSIGN_EDITOR_LINK}`}>
                    {t('Assign Editors', { ns: 'common' })} (
                    {tasksOverview.noEditorsStudents})
                </Link>
            </TableCell>
            <TableCell>
                {t('Please assign editors', { ns: 'common' })}
            </TableCell>
        </TableRow>
    );
};

export default AssignEditorRow;
