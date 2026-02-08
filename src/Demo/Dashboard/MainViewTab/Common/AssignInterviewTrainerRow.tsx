import React from 'react';
import { TableRow, TableCell, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import DEMO from '../../../../store/constant';
import { t } from 'i18next';

const AssignInterviewTrainerRow = (props) => {
    return (
        <TableRow>
            <TableCell>
                <Link
                    component={LinkDom}
                    to={`${DEMO.ASSIGN_INTERVIEW_TRAINER_LINK}`}
                >
                    {t('Assign Interview Trainers', { ns: 'common' })}(
                    {props.tasksOverview.noTrainerInInterviewsStudents})
                </Link>
            </TableCell>
            <TableCell>
                {t('Please assign interview trainers', { ns: 'common' })}
            </TableCell>
        </TableRow>
    );
};

export default AssignInterviewTrainerRow;
