import {
    TableContainer,
    Table,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';

import ProgramConflict from './ProgramConflict';
import { IProgramWithId, IStudentResponse } from '@/types/taiger-common';

export interface TabProgramConflictProps {
    students: IStudentResponse[];
    program: IProgramWithId;
}

const TabProgramConflict = ({ students, program }: TabProgramConflictProps) => {
    const programConflicts = students.map((conflict, i) => (
        <ProgramConflict
            key={i}
            program={conflict.program}
            students={conflict.students}
        />
    ));
    return programConflicts.length !== 0 ? (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>University / Programs</TableCell>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Deadline</TableCell>
                    </TableRow>
                </TableHead>
                {programConflicts}
            </Table>
        </TableContainer>
    ) : null;
};

export default TabProgramConflict;
