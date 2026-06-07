import { TableRow, TableCell, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { t } from 'i18next';

import type { TasksOverview } from '@/api/types';
import DEMO from '@store/constant';

const AssignAgentRow = ({
    tasksOverview
}: {
    tasksOverview: TasksOverview;
}) => {
    return (
        <TableRow>
            <TableCell>
                <Link component={LinkDom} to={`${DEMO.ASSIGN_AGENT_LINK}`}>
                    {t('Assign Agents', { ns: 'common' })} (
                    {tasksOverview.noAgentsStudents})
                </Link>
            </TableCell>
            <TableCell>{t('Please assign agents', { ns: 'common' })}</TableCell>
        </TableRow>
    );
};

export default AssignAgentRow;
