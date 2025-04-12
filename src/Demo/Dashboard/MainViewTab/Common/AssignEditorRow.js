import { TableRow, TableCell, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { t } from 'i18next';

import DEMO from '../../../../store/constant';
import { getStudentEditorStatus } from '../../../Utils/checking-functions';

const AssignEditorRow = (props) => {
    const { allHaveEditors, countWithoutEditors } = getStudentEditorStatus(
        props.students
    );
    return !allHaveEditors ? (
        <TableRow>
            <TableCell>
                <Link component={LinkDom} to={`${DEMO.ASSIGN_EDITOR_LINK}`}>
                    {t('Assign Editors', { ns: 'common' })} (
                    {countWithoutEditors})
                </Link>
            </TableCell>
            <TableCell>
                {t('Please assign editors', { ns: 'common' })}
            </TableCell>
        </TableRow>
    ) : null;
};

export default AssignEditorRow;
