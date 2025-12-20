import { TableRow, TableCell, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { t } from 'i18next';

import DEMO from '../../../../store/constant';

const AssignEssayWriterRow = (props) => {
    return (
        <TableRow>
            <TableCell>
                <Link
                    component={LinkDom}
                    to={`${DEMO.ASSIGN_ESSAY_WRITER_LINK}`}
                >
                    {t('Assign Essay Writers', { ns: 'common' })} (
                    {props.tasksOverview.noEssayWritersEssays})
                </Link>
            </TableCell>
            <TableCell>
                {t('Please assign essay writers', { ns: 'common' })}
            </TableCell>
        </TableRow>
    );
};

export default AssignEssayWriterRow;
