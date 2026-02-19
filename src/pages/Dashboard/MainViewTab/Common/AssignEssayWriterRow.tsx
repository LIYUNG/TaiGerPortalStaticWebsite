import { TableRow, TableCell, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { t } from 'i18next';

import type { TasksOverview } from '@/api/types';
import DEMO from '@store/constant';

const AssignEssayWriterRow = ({
    tasksOverview
}: {
    tasksOverview: TasksOverview;
}) => {
    return (
        <TableRow>
            <TableCell>
                <Link
                    component={LinkDom}
                    to={`${DEMO.ASSIGN_ESSAY_WRITER_LINK}`}
                >
                    {t('Assign Essay Writer', { ns: 'common' })} (
                    {tasksOverview.noEssayWritersEssays})
                </Link>
            </TableCell>
            <TableCell>
                {t('Please assign essay writers', { ns: 'common' })}
            </TableCell>
        </TableRow>
    );
};

export default AssignEssayWriterRow;
