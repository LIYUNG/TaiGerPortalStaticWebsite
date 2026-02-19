import { Link as LinkDom } from 'react-router-dom';
import { Link, TableBody, TableCell, TableRow } from '@mui/material';

import DEMO from '@store/constant';
import { IProgramWithId } from '@/types/taiger-common';
import { IStudentResponse } from '@/types/taiger-common';

export interface ProgramTaskDeltaProps {
    program: IProgramWithId;
    students: IStudentResponse[];
}

const ProgramTaskDelta = ({ program, students }: ProgramTaskDeltaProps) => {
    return (
        students?.length !== 0 && (
            <TableBody>
                <TableRow>
                    <TableCell rowSpan={(students?.length || 0) + 1}>
                        <div>
                            <Link
                                component={LinkDom}
                                to={`${DEMO.SINGLE_PROGRAM_LINK(program._id)}`}
                            >
                                <b>{program.school}</b>
                            </Link>
                        </div>
                        <div>
                            <Link
                                component={LinkDom}
                                to={`${DEMO.SINGLE_PROGRAM_LINK(program._id)}`}
                            >
                                {program.program_name}
                            </Link>
                        </div>
                    </TableCell>
                </TableRow>
                {students.map((student, i) => (
                    <TableRow className="text-info" key={i}>
                        <TableCell>
                            <Link
                                component={LinkDom}
                                to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                    student._id,
                                    DEMO.CVMLRL_HASH
                                )}`}
                            >
                                {student.firstname + ', ' + student.lastname}
                            </Link>
                        </TableCell>
                        <TableCell>
                            {student.deltas.add
                                .map((missing) => missing.fileType)
                                .sort()
                                .join(', ')}
                        </TableCell>
                        <TableCell>
                            {student.deltas.remove
                                .map((extra) => extra.fileThread.file_type)
                                .sort()
                                .join(', ')}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        )
    );
};

export default ProgramTaskDelta;
