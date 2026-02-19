import {
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper
} from '@mui/material';
import { program_fields } from '@utils/contants';
import { LinkableNewlineText } from '../Utils/checking-functions';
import type { IApplicationWithId, IProgramWithId } from '@/api/types';

const ProgramDetailsComparisonTable = ({
    applications
}: {
    applications: IApplicationWithId[];
}) => {
    return (
        <TableContainer component={Paper} style={{ overflowX: 'auto' }}>
            <Table aria-label="comparison table" size="small">
                <TableHead />
                <TableBody>
                    {[
                        ...program_fields,
                        { name: 'Country', prop: 'country' }
                    ].map((feature) => (
                        <TableRow key={feature.name}>
                            <TableCell component="th" scope="row">
                                {feature.name}
                            </TableCell>
                            {applications.map((application) => (
                                <TableCell key={application._id}>
                                    <LinkableNewlineText
                                        text={application.programId?.[
                                            feature.prop as keyof IProgramWithId
                                        ]?.toString()}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ProgramDetailsComparisonTable;
