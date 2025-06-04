import { TableRow, TableCell, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import { t } from 'i18next';

import {
    does_essay_have_writers,
    number_of_threads_without_essay_writers_assigned_with_input
} from '../../../Utils/checking-functions';
import DEMO from '../../../../store/constant';

const AssignEssayWriterRow = (props) => {
    const essayDocumentThreads = props.essayDocumentThreads?.filter(
        (thread) => !thread.isFinalVersion
    );
    const number_of_threads_with_input =
        number_of_threads_without_essay_writers_assigned_with_input(
            essayDocumentThreads
        );
    return !does_essay_have_writers(essayDocumentThreads) ? (
        <TableRow>
            <TableCell>
                <Link
                    component={LinkDom}
                    to={`${DEMO.ASSIGN_ESSAY_WRITER_LINK}`}
                >
                    {t('Assign Essay Writer', { ns: 'common' })} (
                    {number_of_threads_with_input})
                </Link>
            </TableCell>
            <TableCell>
                {t('Please assign essay writers', { ns: 'common' })}
            </TableCell>
        </TableRow>
    ) : null;
};

export default AssignEssayWriterRow;
