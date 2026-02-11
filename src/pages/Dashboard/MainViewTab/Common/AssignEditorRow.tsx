import { TableRow, TableCell, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { t } from 'i18next';

import DEMO from '@store/constant';

const AssignEditorRow = (props) => {
    return (
        <TableRow>
            <TableCell>
                <Link component={LinkDom} to={`${DEMO.ASSIGN_EDITOR_LINK}`}>
                    {t('Assign Editors', { ns: 'common' })} (
                    {props.tasksOverview.noEditorsStudents})
                </Link>
            </TableCell>
            <TableCell>
                {t('Please assign editors', { ns: 'common' })}
            </TableCell>
        </TableRow>
    );
};

export default AssignEditorRow;
