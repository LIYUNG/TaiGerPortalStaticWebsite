import { useEffect, useState } from 'react';
import { Link as LinkDom, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    AlertTitle,
    Box,
    Breadcrumbs,
    Button,
    Card,
    Link,
    Typography
} from '@mui/material';

import ErrorPage from '../../Utils/ErrorPage';
import { LinkableNewlineText } from '../../Utils/checking-functions';
import { getRequirement } from '../../Utils/util_functions';
import { getSurveyInputs } from '@/api';
import { TabTitle } from '../../Utils/TabTitle';
import DEMO from '@store/constant';
import Loading from '@components/Loading/Loading';
import { appConfig } from '../../../config';

// Lean view for the legacy "Survey" route. The student survey form and the old
// GPT generator were removed; CV drafting + discussion now live in the document
// thread page (Discussion / AI Draft tabs). This page only shows the program
// requirements and points the user to the thread.
interface ThreadShape {
    _id?: string;
    file_type?: string;
    student_id?: {
        _id?: { toString(): string };
        firstname?: string;
        lastname?: string;
    };
    program_id?: {
        school?: string;
        degree?: string;
        program_name?: string;
        [key: string]: string | undefined;
    };
}

const DocModificationThreadInput = () => {
    const { t } = useTranslation();
    const { documentsthreadId } = useParams();
    const [isLoaded, setIsLoaded] = useState(false);
    const [thread, setThread] = useState<ThreadShape>({});
    const [resStatus, setResStatus] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resp = await getSurveyInputs(documentsthreadId ?? '');
                const { success } = resp.data;
                const threadData = resp.data.data as unknown as ThreadShape;
                setIsLoaded(true);
                if (success) {
                    setThread(threadData ?? {});
                    setResStatus(200);
                } else {
                    setResStatus(400);
                }
            } catch {
                setResStatus(500);
            }
        };
        fetchData();
    }, [documentsthreadId]);

    const fileType = thread?.file_type ?? '';
    const studentName = thread?.student_id
        ? `${thread.student_id.firstname ?? ''} ${thread.student_id.lastname ?? ''}`
        : '';
    let docName = fileType;
    if (thread?.program_id) {
        const { school, degree, program_name } = thread.program_id;
        docName = `${school ?? ''} - (${degree ?? ''}) ${program_name ?? ''} ${fileType}`;
    }
    TabTitle(`${studentName} ${docName}`);

    if (!isLoaded) {
        return <Loading />;
    }
    if (resStatus >= 400) {
        return <ErrorPage res_status={resStatus} />;
    }

    const threadLink = DEMO.DOCUMENT_MODIFICATION_LINK(
        thread?._id?.toString() ?? ''
    );
    const requirement = getRequirement(
        thread as { file_type?: string; program_id?: { [key: string]: string } }
    );

    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                        thread?.student_id?._id?.toString() ?? '',
                        DEMO.CVMLRL_HASH
                    )}`}
                    underline="hover"
                >
                    {studentName}
                </Link>
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={threadLink}
                    underline="hover"
                >
                    {docName}
                </Link>
            </Breadcrumbs>

            <Card sx={{ p: 2, mb: 2, mt: 1 }}>
                <Typography fontWeight="bold">
                    {t('Requirements', { ns: 'translation' })}:
                </Typography>
                {thread?.program_id ? (
                    <LinkableNewlineText text={String(requirement || '')} />
                ) : (
                    <Typography>{t('No', { ns: 'common' })}</Typography>
                )}
            </Card>

            <Alert
                severity="info"
                sx={{ mb: 2 }}
                action={
                    <Button
                        color="inherit"
                        component={LinkDom}
                        size="small"
                        to={threadLink}
                    >
                        {t('Open thread', { ns: 'common' })}
                    </Button>
                }
            >
                <AlertTitle>{t('Moved', { ns: 'common' })}</AlertTitle>
                {t(
                    'The survey and AI draft generation now live in the document thread (Discussion and AI Draft tabs).',
                    { ns: 'common' }
                )}
            </Alert>
        </Box>
    );
};

export default DocModificationThreadInput;
