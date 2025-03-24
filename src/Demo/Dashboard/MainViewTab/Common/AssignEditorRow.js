import { TableRow, TableCell, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { t } from 'i18next';

import DEMO from '../../../../store/constant';
import { does_student_have_editors } from '../../../Utils/checking-functions';

const AssignEditorRow = (props) => {
    return !does_student_have_editors(props.students) ? (
        <TableRow>
            <TableCell>
                <Link component={LinkDom} to={`${DEMO.ASSIGN_EDITOR_LINK}`}>
                    {t('Assign Editors')}
                </Link>
            </TableCell>
            <TableCell>
                {t('Please assign editors', { ns: 'common' })}
            </TableCell>
        </TableRow>
    ) : null;
};

export default AssignEditorRow;
