import React from 'react';
import {
    Alert,
    Card,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import AdminTasks from '../MainViewTab/AdminTasks/index';
import useStudents from '../../../hooks/useStudents';
import ProgramReportCard from '../../Program/ProgramReportCard';
import MiniAudit from '../../Audit/MiniAudit';
import { StudentsTable } from '../../StudentDatabase/StudentsTable';
import { student_transform } from '../../Utils/checking-functions';
import { useQuery } from '@tanstack/react-query';
import { getMyStudentsApplicationsV2Query } from '../../../api/query';
import Loading from '../../../components/Loading/Loading';
import { useAuth } from '../../../components/AuthProvider';
const AdminMainView = (props) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { data: myStudentsApplications, isLoading: isLoadingApplications } =
        useQuery(getMyStudentsApplicationsV2Query({ userId: user._id }));

    if (isLoadingApplications) {
        return <Loading />;
    }

    const {
        students: initStudents,
        submitUpdateAgentlist,
        submitUpdateEditorlist,
        submitUpdateAttributeslist,
        updateStudentArchivStatus
    } = useStudents({
        students: myStudentsApplications.data.students
    });

    const students = initStudents
        ?.filter((student) => !student.archiv)
        .sort((a, b) =>
            a.agents.length === 0 && a.agents.length < b.agents.length
                ? -2
                : a.editors.length < b.editors.length
                  ? -1
                  : 1
        );
    const admin_tasks = (
        <AdminTasks
            essayDocumentThreads={props.essayDocumentThreads}
            interviews={props.interviews}
            students={students}
        />
    );

    const studentsTransformed = student_transform(
        students?.filter((student) => !student.archiv)
    );

    return (
        <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item md={4} xs={12}>
                <Card style={{ height: '40vh', overflow: 'auto' }}>
                    <Typography variant="h6">
                        <Alert severity="warning">
                            Admin {t('To Do Tasks', { ns: 'common' })}:
                        </Alert>
                    </Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    {t('Tasks', { ns: 'common' })}
                                </TableCell>
                                <TableCell>
                                    {t('Description', { ns: 'common' })}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{admin_tasks}</TableBody>
                    </Table>
                </Card>
            </Grid>
            <Grid item md={4} xs={12}>
                <ProgramReportCard />
            </Grid>
            <Grid item md={4} xs={12}>
                <Card style={{ height: '40vh', overflow: 'auto' }}>
                    <MiniAudit audit={props.auditLog || []} />
                </Card>
            </Grid>
            <Grid item xs={12}>
                <StudentsTable
                    data={studentsTransformed}
                    isLoading={false}
                    submitUpdateAgentlist={submitUpdateAgentlist}
                    submitUpdateAttributeslist={submitUpdateAttributeslist}
                    submitUpdateEditorlist={submitUpdateEditorlist}
                    updateStudentArchivStatus={updateStudentArchivStatus}
                />
            </Grid>
        </Grid>
    );
};

export default AdminMainView;
