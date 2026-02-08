import { useQuery } from '@tanstack/react-query';
import { Link, Link as LinkDom, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { is_TaiGer_AdminAgent, is_TaiGer_Student } from '@taiger-common/core';
import { useTranslation } from 'react-i18next';
import MessageIcon from '@mui/icons-material/Message';

import { getMessagThreadQuery } from '../../../../api/query';
import Loading from '../../../../components/Loading/Loading';
import DocModificationThreadPage from '../DocModificationThreadPage';
import ErrorPage from '../../../Utils/ErrorPage';
import DEMO from '../../../../store/constant';
import { appConfig } from '../../../../config';
import { BreadcrumbsNavigation } from '../../../../components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import { useAuth } from '../../../../components/AuthProvider';

const SingleThreadPage = () => {
    const { documentsthreadId } = useParams();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { data, isLoading, error } = useQuery(
        getMessagThreadQuery(documentsthreadId)
    );

    if (isLoading) {
        return <Loading />;
    }
    if (error || !data.data.success) {
        return <ErrorPage res_status={404} />;
    }
    const thread = data.data?.data;
    const agents = data.data?.agents;
    const conflict_list = data.data?.conflict_list;
    const editors = data.data?.editors;
    const deadline = data.data?.deadline;
    const threadAuditLog = data.data?.threadAuditLog;
    const similarThreads = data.data?.similarThreads;

    const student_name = `${thread.student_id.firstname} ${thread.student_id.lastname}`;
    // const student_name_zh = `${thread.student_id.lastname_chinese}${thread.student_id.firstname_chinese}`;
    let docName;
    if (thread.program_id) {
        const { school, degree, program_name } = thread.program_id;
        docName = `${school} - ${degree} - ${program_name} ${thread.file_type}`;
    } else {
        docName = thread.file_type;
    }

    return (
        <>
            <Box
                alignItems="center"
                display="flex"
                justifyContent="space-between"
            >
                <Box>
                    <BreadcrumbsNavigation
                        items={[
                            {
                                label: appConfig.companyName,
                                link: DEMO.DASHBOARD_LINK
                            },
                            {
                                label: student_name,
                                link: DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                                    thread.student_id._id.toString(),
                                    DEMO.CVMLRL_HASH
                                )
                            },
                            {
                                label: `${docName} ${t('discussion-thread', { ns: 'common' })}`
                            }
                        ]}
                    />
                </Box>
                {!is_TaiGer_Student(user) ? (
                    <Box style={{ textAlign: 'left' }}>
                        {is_TaiGer_AdminAgent(user) ? (
                            <Link
                                color="inherit"
                                component={LinkDom}
                                sx={{ mr: 1 }}
                                to={`${DEMO.COMMUNICATIONS_TAIGER_MODE_LINK(
                                    thread.student_id._id
                                )}`}
                                underline="hover"
                            >
                                <Button
                                    color="primary"
                                    size="small"
                                    startIcon={<MessageIcon />}
                                    variant="contained"
                                >
                                    <b>{t('Message', { ns: 'common' })}</b>
                                </Button>
                            </Link>
                        ) : null}
                        <Button
                            color="primary"
                            component={LinkDom}
                            size="small"
                            to={`/doc-communications/${documentsthreadId}`}
                            variant="contained"
                        >
                            {t('Switch View', { ns: 'common' })}
                        </Button>
                    </Box>
                ) : null}
            </Box>
            <DocModificationThreadPage
                agents={agents}
                conflictList={conflict_list}
                deadline={deadline}
                editors={editors}
                similarThreads={similarThreads}
                threadProps={thread}
                threadauditLog={threadAuditLog}
            />
        </>
    );
};

export default SingleThreadPage;
