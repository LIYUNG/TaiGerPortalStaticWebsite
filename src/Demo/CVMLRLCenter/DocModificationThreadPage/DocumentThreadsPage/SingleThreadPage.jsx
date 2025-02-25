import { useQuery } from '@tanstack/react-query';
import { Link as LinkDom, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { is_TaiGer_Student } from '@taiger-common/core';
import i18next from 'i18next';

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
    const { data, isLoading, error } = useQuery(
        getMessagThreadQuery(documentsthreadId)
    );

    if (isLoading) {
        return <Loading />;
    }
    if (error) {
        return <ErrorPage />;
    }
    const thread = data.data?.data;
    const similarThreads = data.data?.similarThreads;
    console.log(thread);
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
                                label: `${docName} ${i18next.t('discussion-thread', { ns: 'common' })}`
                            }
                        ]}
                    />
                </Box>
                {!is_TaiGer_Student(user) ? (
                    <Box style={{ textAlign: 'left' }}>
                        <Button
                            color="primary"
                            component={LinkDom}
                            size="small"
                            to={`/doc-communications/${documentsthreadId}`}
                            variant="contained"
                        >
                            {i18next.t('Switch View', { ns: 'common' })}
                        </Button>
                    </Box>
                ) : null}
            </Box>
            <DocModificationThreadPage
                similarThreads={similarThreads}
                threadProps={thread}
            />
        </>
    );
};

export default SingleThreadPage;
