import {
    TableContainer,
    Table,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import ProgramTaskDelta from './ProgramTaskDelta';
import type { ProgramTaskDeltaProps } from './ProgramTaskDelta';

interface TabProgramTaskDeltaProps {
    deltas: ProgramTaskDeltaProps[];
}

const TabProgramTaskDelta = ({ deltas }: TabProgramTaskDeltaProps) => {
    const taskDeltas = deltas.map((delta: ProgramTaskDeltaProps, i: number) => (
        <ProgramTaskDelta
            key={i}
            program={delta.program}
            students={delta.students}
        />
    ));
    return taskDeltas.length !== 0 ? (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>University / Programs</TableCell>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Missing</TableCell>
                        <TableCell>Extra</TableCell>
                    </TableRow>
                </TableHead>
                {taskDeltas}
            </Table>
        </TableContainer>
    ) : null;
};

export default TabProgramTaskDelta;
