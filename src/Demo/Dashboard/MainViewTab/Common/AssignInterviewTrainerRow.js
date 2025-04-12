import React from 'react';
import { TableRow, TableCell, Link } from '@mui/material';
import { Link as LinkDom } from 'react-router-dom';
import DEMO from '../../../../store/constant';
import { t } from 'i18next';
import {
    does_interview_have_trainers,
    number_of_interviews_without_interview_trainers_assigned_with_input
} from '../../../Utils/checking-functions';

const AssignInterviewTrainerRow = (props) => {
    const hasTrainers = does_interview_have_trainers(props.interviews);
    const interviewsWithoutTrainers =
        number_of_interviews_without_interview_trainers_assigned_with_input(
            props.interviews
        );

    return !hasTrainers ? (
        <TableRow>
            <TableCell>
                <Link
                    component={LinkDom}
                    to={`${DEMO.ASSIGN_INTERVIEW_TRAINER_LINK}`}
                >
                    {t('Assign Interview Trainers', { ns: 'common' })}(
                    {interviewsWithoutTrainers})
                </Link>
            </TableCell>
            <TableCell>
                {t('Please assign interview trainers', { ns: 'common' })}
            </TableCell>
        </TableRow>
    ) : null;
};

export default AssignInterviewTrainerRow;
