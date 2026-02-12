import { Link as LinkDom } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Card,
    Link,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Alert,
    Typography,
    TableContainer
} from '@mui/material';

import {
    areProgramsDecidedMoreThanContract,
    is_num_Program_Not_specified
} from '../../../Utils/util_functions';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { IStudentResponse } from '@/api/types';

const NoEnoughDecidedProgramsTasks = ({
    student
}: {
    student: IStudentResponse;
}) => {
    const { t } = useTranslation();
    return (
        <>
            {is_num_Program_Not_specified(student) ? (
                <TableRow>
                    <TableCell>
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_APPLICATIONS_ID_LINK(
                                student._id.toString()
                            )}`}
                        >
                            <Typography fontWeight="bold">
                                {student.firstname} {student.lastname}{' '}
                                {t('Applications', { ns: 'common' })}
                            </Typography>
                        </Link>
                    </TableCell>
                    <TableCell>
                        Contact Sales or Admin for the number of program of
                        <Typography fontWeight="bold">
                            {student.firstname} {student.lastname}
                        </Typography>
                    </TableCell>
                    <TableCell />
                </TableRow>
            ) : (
                <>
                    {/* select enough program task */}
                    {!areProgramsDecidedMoreThanContract(student) ? (
                        <TableRow>
                            <TableCell>
                                <Link
                                    component={LinkDom}
                                    to={`${DEMO.STUDENT_APPLICATIONS_ID_LINK(
                                        student._id.toString()
                                    )}`}
                                >
                                    <Typography fontWeight="bold">
                                        {' '}
                                        {student.firstname} {student.lastname}{' '}
                                    </Typography>
                                    Applications
                                </Link>
                            </TableCell>
                            <TableCell>
                                {t('Please select enough programs for')}{' '}
                                <Typography fontWeight="bold">
                                    {student.firstname} {student.lastname}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {
                                    student.application_preference
                                        ?.expected_application_date
                                }
                            </TableCell>
                        </TableRow>
                    ) : null}
                </>
            )}
            {/* TODO: add Portal register tasks */}
        </>
    );
};

const NoEnoughDecidedProgramsTasksCard = ({
    students
}: {
    students: IStudentResponse[];
}) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const no_enough_programs_decided_tasks = students
        .filter((student) =>
            student.agents?.some(
                (agent) => agent?._id === user?._id?.toString()
            )
        )
        .map((student, i) => (
            <NoEnoughDecidedProgramsTasks key={i} student={student} />
        ));
    return (
        <Card sx={{ mb: 2 }}>
            <Alert severity="error">
                <Typography>{t('No Enough Program Decided Tasks')}:</Typography>
            </Alert>
            <TableContainer style={{ maxHeight: '300px' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                {t('Tasks', { ns: 'common' })}
                            </TableCell>
                            <TableCell>
                                {t('Description', { ns: 'common' })}
                            </TableCell>
                            <TableCell>
                                {t('Application Year', { ns: 'common' })}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{no_enough_programs_decided_tasks}</TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
};

export default NoEnoughDecidedProgramsTasksCard;
