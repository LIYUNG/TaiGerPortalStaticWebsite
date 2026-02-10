import React from 'react';
import { Link as LinkDom } from 'react-router-dom';
import { Link, TableCell, TableRow } from '@mui/material';

import {
    does_student_have_agents,
    is_num_Program_Not_specified
} from '../../../Utils/util_functions';
import DEMO from '../../../../store/constant';
import { useTranslation } from 'react-i18next';
import AssignEssayWriterRow from '../Common/AssignEssayWriterRow';
import AssignEditorRow from '../Common/AssignEditorRow';
import AssignInterviewTrainerRow from '../Common/AssignInterviewTrainerRow';

const AdminTasks = (props) => {
    const { t } = useTranslation();
    const missing_number_of_applications_students = props.students.map(
        (student, i) =>
            is_num_Program_Not_specified(student) && (
                <TableRow key={i}>
                    <TableCell>
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_APPLICATIONS_ID_LINK(
                                student._id.toString()
                            )}`}
                        >
                            Number of Applications{' '}
                            <b>
                                {student.firstname} {student.lastname}
                            </b>
                        </Link>
                    </TableCell>
                    <TableCell>
                        Please specify the number of the application for{' '}
                        <b>
                            {student.firstname} {student.lastname}
                        </b>
                    </TableCell>
                </TableRow>
            )
    );

    return (
        <>
            {!does_student_have_agents(props.students) ? (
                <TableRow>
                    <TableCell>
                        <Link
                            component={LinkDom}
                            to={`${DEMO.ASSIGN_AGENT_LINK}`}
                        >
                            {t('Assign Agents', { ns: 'common' })}
                        </Link>
                    </TableCell>
                    <TableCell>
                        {t('Please assign agents', { ns: 'common' })}
                    </TableCell>
                </TableRow>
            ) : null}
            <AssignEditorRow tasksOverview={props.tasksOverview} />
            <AssignEssayWriterRow tasksOverview={props.tasksOverview} />
            <AssignInterviewTrainerRow tasksOverview={props.tasksOverview} />

            {/* assign number of application according to contract */}
            {missing_number_of_applications_students}
        </>
    );
};

export default AdminTasks;
