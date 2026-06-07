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
import ProgramReportCard from '../../Program/ProgramReportCard';
import MiniAudit from '../../Audit/MiniAudit';
import { StudentsTablePaginated } from '../../StudentDatabase/StudentsTablePaginated';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogQuery } from '@/api/query';
import { useTasksOverview } from '@hooks/useTasksOverview';
import queryString from 'query-string';

const AdminMainView = () => {
    const { t } = useTranslation();

    const { data: tasksOverview } = useTasksOverview();

    const { data: auditLog } = useQuery(
        getAuditLogQuery(
            queryString.stringify({
                page: 1,
                limit: 20
            })
        )
    );

    const admin_tasks = <AdminTasks tasksOverview={tasksOverview} />;

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
                <StudentsTablePaginated archiv={false} />
            </Grid>
        </Grid>
    );
};

export default AdminMainView;
