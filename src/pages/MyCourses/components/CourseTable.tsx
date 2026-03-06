import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from '@mui/material';
import i18next from 'i18next';

import type { CourseTableRow } from './utils';

export interface CourseTableProps {
    data?: CourseTableRow[];
    tableKey?: string;
}

const CourseTable = ({ data = [], tableKey }: CourseTableProps) => {
    return (
        <TableContainer style={{ overflowX: 'auto' }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            {i18next.t('Course', {
                                ns: 'common'
                            })}
                        </TableCell>
                        <TableCell>
                            {i18next.t('Credits', {
                                ns: 'common'
                            })}
                        </TableCell>
                        <TableCell>
                            {i18next.t('Grades', {
                                ns: 'common'
                            })}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((course, index) => (
                        <TableRow key={index}>
                            <TableCell>{course[tableKey]}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell>{course.grades}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CourseTable;
