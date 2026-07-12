import {
    TableContainer,
    Table,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';

import ProgramConflict from './ProgramConflict';
import type { ProgramConflictProps } from './ProgramConflict';

export interface TabProgramConflictProps {
    // One entry per conflicting program: the program plus the students that
    // applied to it (GET /api/teams/application-conflicts).
    students: ProgramConflictProps[];
}

const TabProgramConflict = ({ students }: TabProgramConflictProps) => {
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
