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
import queryString from 'query-string';

import AdminTasks from '../MainViewTab/AdminTasks/index';
import useStudents from '../../../hooks/useStudents';
import ProgramReportCard from '../../Program/ProgramReportCard';
import MiniAudit from '../../Audit/MiniAudit';
import { StudentsTable } from '../../StudentDatabase/StudentsTable';
import { student_transform } from '../../Utils/checking-functions';
import { useQuery } from '@tanstack/react-query';
import {
    getStudentsV3Query,
    getAuditLogQuery,
    getInterviewsQuery,
    getTasksOverviewQuery
} from '../../../api/query';
import Loading from '../../../components/Loading/Loading';

const AdminMainView = (props) => {
    const { t } = useTranslation();

    const {
        data: { data: allStudentsApplications } = { data: [] },
        isLoading
    } = useQuery(
        getStudentsV3Query(
            queryString.stringify({
                archiv: false
            })
        )
    );

    const { data: interviews } = useQuery(
        getInterviewsQuery(
            queryString.stringify({
                no_trainer: true,
                isClosed: false
            })
        )
    );

    const { data: tasksOverview } = useQuery(getTasksOverviewQuery());

    const { data: auditLog } = useQuery(
        getAuditLogQuery(
            queryString.stringify({
                page: 1,
                limit: 20
            })
        )
    );

    const {
        students: initStudents,
        submitUpdateAgentlist,
        submitUpdateEditorlist,
        submitUpdateAttributeslist,
        updateStudentArchivStatus
    } = useStudents({
        students: allStudentsApplications || []
    });

    if (isLoading) {
        return <Loading />;
    }

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
            interviews={interviews?.data || []}
            students={students}
            tasksOverview={tasksOverview?.data || {}}
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
                    <MiniAudit audit={auditLog?.data || []} />
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
