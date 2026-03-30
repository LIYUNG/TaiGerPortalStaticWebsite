import { useQuery } from '@tanstack/react-query';
import { Link as LinkDom, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { is_TaiGer_AdminAgent, is_TaiGer_Student } from '@taiger-common/core';
import type { IUser } from '@taiger-common/model';
import { useTranslation } from 'react-i18next';
import MessageIcon from '@mui/icons-material/Message';

import { getMessagThreadQuery } from '@/api/query';
import Loading from '@components/Loading/Loading';
import DocModificationThreadPage from '../DocModificationThreadPage';
import ErrorPage from '../../../Utils/ErrorPage';
import DEMO from '@store/constant';
import { appConfig } from '../../../../config';
import { BreadcrumbsNavigation } from '@components/BreadcrumbsNavigation/BreadcrumbsNavigation';
import { useAuth } from '@components/AuthProvider';

interface ThreadQueryResponse {
    data: {
        success: boolean;
        data?: Record<string, unknown>;
        agents?: unknown[];
        conflict_list?: unknown[];
        editors?: unknown[];
        deadline?: unknown;
        threadAuditLog?: unknown[];
        similarThreads?: unknown[];
    };
}

const SingleThreadPage = () => {
    const { documentsthreadId } = useParams();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { data, isLoading, error } = useQuery(
        getMessagThreadQuery(documentsthreadId ?? '')
    );

    if (isLoading) {
        return <Loading />;
    }
    const responseData = data as ThreadQueryResponse | undefined;
    if (error || !responseData?.data?.success) {
        return <ErrorPage res_status={404} />;
    }
    const thread = responseData.data?.data as Record<string, unknown>;
    const agents = responseData.data?.agents;
    const conflict_list = responseData.data?.conflict_list;
    const editors = responseData.data?.editors;
    const deadline = responseData.data?.deadline;
    const threadAuditLog = responseData.data?.threadAuditLog;
    const similarThreads = responseData.data?.similarThreads;

    const studentId = thread?.student_id as Record<string, unknown> | undefined;
    const student_name = `${studentId?.firstname ?? ''} ${studentId?.lastname ?? ''}`;
    // const student_name_zh = `${studentId?.lastname_chinese}${studentId?.firstname_chinese}`;
    let docName: string;
    if (thread?.program_id) {
        const programId = thread.program_id as Record<string, unknown>;
        const { school, degree, program_name } = programId;
        docName = `${school} - ${degree} - ${program_name} ${thread.file_type}`;
    } else {
        docName = String(thread?.file_type ?? '');
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
                                    String(studentId?._id ?? ''),
                                    DEMO.CVMLRL_HASH
                                )
                            },
                            {
                                label: `${docName} ${t('discussion-thread', { ns: 'common' })}`
                            }
                        ]}
                    />
                </Box>
                {!is_TaiGer_Student(user as IUser) ? (
                    <Box style={{ textAlign: 'left' }}>
                        {is_TaiGer_AdminAgent(user as IUser) ? (
                            <LinkDom
                                to={`${DEMO.COMMUNICATIONS_TAIGER_MODE_LINK(
                                    String(studentId?._id ?? '')
                                )}`}
                            >
                                <Button
                                    color="primary"
                                    size="small"
                                    startIcon={<MessageIcon />}
                                    variant="contained"
                                >
                                    <b>{t('Message', { ns: 'common' })}</b>
                                </Button>
                            </LinkDom>
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
