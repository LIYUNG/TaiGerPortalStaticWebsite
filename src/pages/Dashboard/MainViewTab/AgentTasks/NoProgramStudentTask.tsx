import { Link as LinkDom } from 'react-router-dom';
import { Link, TableCell, TableRow } from '@mui/material';

import { hasApplications } from '../../../Utils/util_functions';
import DEMO from '@store/constant';
import type { IStudentResponse } from '@/api/types';

const NoProgramStudentTask = ({ student }: { student: IStudentResponse }) => {
    return (
        <>
            {/* check if no program selected */}
            {!hasApplications(student) ? (
                <TableRow>
                    <TableCell>
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                student._id.toString(),
                                DEMO.APPLICATION_HASH
                            )}`}
                        >
                            {student.firstname} {student.lastname}
                        </Link>
                    </TableCell>
                    <TableCell>
                        {' '}
                        {student.application_preference
                            ?.expected_application_date || (
                            <span className="text-danger">TBD</span>
                        )}
                        /
                        {student.application_preference
                            ?.expected_application_semester || (
                            <span className="text-danger">TBD</span>
                        )}
                    </TableCell>
                </TableRow>
            ) : null}
        </>
    );
};

export default NoProgramStudentTask;
