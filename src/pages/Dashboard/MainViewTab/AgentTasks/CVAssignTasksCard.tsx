import { Link as LinkDom } from 'react-router-dom';
import {
    Link,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Alert,
    TableContainer
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Card, Typography } from '@mui/material';

import { isCVFinished, is_cv_assigned } from '../../../Utils/util_functions';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import { IStudentResponse } from '@/api/types';

const CVAssignTasks = ({ student }: { student: IStudentResponse }) => {
    return (
        <>
            {/* cv assign tasks */}
            {!isCVFinished(student) && !is_cv_assigned(student) ? (
                <>
                    <TableCell>
                        <Link
                            component={LinkDom}
                            to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                student._id.toString(),
                                DEMO.CVMLRL_HASH
                            )}`}
                        >
                            CV
                        </Link>
                    </TableCell>
                    <TableCell>
                        <b>
                            {student.firstname} {student.lastname}
                        </b>
                    </TableCell>
                    <TableCell>
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
                </>
            ) : null}
        </>
    );
};

const CVAssignTasksCard = ({ students }: { students: IStudentResponse[] }) => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const cv_assign_tasks = students
        .filter((student) =>
            student.agents?.some((agent) => agent._id === user?._id?.toString())
        )
        .map((student, i) => (
            <TableRow key={i}>
                <CVAssignTasks key={i} student={student} />
            </TableRow>
        ));
    return (
        <Card sx={{ mb: 2 }}>
            <Alert severity="error">
                <Typography>{t('CV Not Assigned Yet')}</Typography>
            </Alert>
            <TableContainer style={{ maxHeight: '300px' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Docs</TableCell>
                            <TableCell>
                                {t('Student', { ns: 'common' })}
                            </TableCell>
                            <TableCell>
                                {t('Year', { ns: 'common' })}/
                                {t('Semester', { ns: 'common' })}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{cv_assign_tasks}</TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
};

export default CVAssignTasksCard;
