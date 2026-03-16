import { Link as LinkDom } from 'react-router-dom';
import { Alert, Card, Grid, Link, ListItem } from '@mui/material';
import dayjs from 'dayjs';
import i18next from 'i18next';

import type {
    IApplicationPopulated,
    IStudentResponse
} from '@taiger-common/model';
import {
    isEnglishCertificateExpiredBeforeDeadline,
    englishCertificatedExpiredBeforeTheseProgramDeadlines,
    application_deadline_V2_calculator
} from '@pages/Utils/util_functions';
import type { Application } from '@/api/types';
import DEMO from '@store/constant';

interface EnglishCertificateExpiredBeforeDeadlineBannerProps {
    student: Record<string, unknown>;
}

const EnglishCertificateExpiredBeforeDeadlineBanner = ({
    student
}: EnglishCertificateExpiredBeforeDeadlineBannerProps) => {
    const studentTyped = student as unknown as IStudentResponse;
    return (
        isEnglishCertificateExpiredBeforeDeadline(studentTyped) && (
            <Grid item md={12} xs={12}>
                <Card sx={{ border: '4px solid red' }}>
                    <Alert severity="warning">
                        {i18next.t(
                            'english-certificate-expired-before-application-deadlines',
                            {
                                ns: 'common'
                            }
                        )}
                        &nbsp;:&nbsp;
                    </Alert>
                    {englishCertificatedExpiredBeforeTheseProgramDeadlines(
                        studentTyped
                    )?.map((app: IApplicationPopulated) => (
                        <ListItem key={app.programId?._id?.toString() ?? ''}>
                            <Link
                                component={LinkDom}
                                target="_blank"
                                to={DEMO.SINGLE_PROGRAM_LINK(
                                    app.programId?._id?.toString() ?? ''
                                )}
                            >
                                {app.programId?.school}{' '}
                                {app.programId?.program_name}{' '}
                                {app.programId?.degree}{' '}
                                {app.programId?.semester} -{' '}
                                <strong>{app.programId?.lang}</strong>
                                {' , Deadline: '}
                                {application_deadline_V2_calculator(
                                    app as unknown as Application
                                )}
                                {', English Certificate test date: '}
                                {dayjs(
                                    studentTyped.academic_background?.language
                                        ?.english_test_date
                                )?.format('YYYY-MM-DD')}
                                {i18next.t('valid-only-two-years', {
                                    ns: 'common'
                                })}
                            </Link>
                        </ListItem>
                    ))}
                </Card>
            </Grid>
        )
    );
};

export default EnglishCertificateExpiredBeforeDeadlineBanner;
