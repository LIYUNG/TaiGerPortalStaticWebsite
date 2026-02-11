import { Link as LinkDom } from 'react-router-dom';
import { Link, TableCell, TableRow } from '@mui/material';

import { convertDate } from '@utils/contants';
import DEMO from '@store/constant';
import type { IStudentResponse } from '@/api/types';

const BaseDocumentCheckingTasks = ({
    student
}: {
    student: IStudentResponse;
}) => {
    return (
        <>
            {/* check program reday to be submitted */}
            {student.profile?.map(
                (file, i) =>
                    file.status === 'uploaded' && (
                        <TableRow key={i}>
                            <TableCell>
                                <Link
                                    component={LinkDom}
                                    to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                        student._id.toString(),
                                        DEMO.PROFILE_HASH
                                    )}`}
                                >
                                    <b>
                                        {student.firstname} {student.lastname}
                                    </b>
                                </Link>
                            </TableCell>
                            <TableCell>{file.name}</TableCell>
                            <TableCell>{convertDate(file.updatedAt)}</TableCell>
                        </TableRow>
                    )
            )}
        </>
    );
};

export default BaseDocumentCheckingTasks;
