import { Link as LinkDom } from 'react-router-dom';
import { Link, Stack } from '@mui/material';
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
import DashboardNotice from './DashboardNotice';
import DEMO from '@store/constant';

interface EnglishCertificateExpiredBeforeDeadlineBannerProps {
    student: Record<string, unknown>;
}

/**
 * English certificates expiring before the deadlines that rely on them.
 *
 * Rendered through DashboardNotice like its siblings. It also no longer emits
 * its own `<Grid item>` wrapper — callers place it wherever they need, and the
 * stray item was orphaned once the dashboard stopped giving each banner a grid
 * row of its own.
 */
const EnglishCertificateExpiredBeforeDeadlineBanner = ({
    student
}: EnglishCertificateExpiredBeforeDeadlineBannerProps) => {
    const studentTyped = student as unknown as IStudentResponse;

    if (!isEnglishCertificateExpiredBeforeDeadline(studentTyped)) {
        return null;
    }

    return (
        <DashboardNotice severity="warning">
            {i18next.t(
                'english-certificate-expired-before-application-deadlines',
                {
                    ns: 'common'
                }
            )}
            <Stack component="ul" spacing={0.25} sx={{ m: 0, mt: 0.5, pl: 2 }}>
                {englishCertificatedExpiredBeforeTheseProgramDeadlines(
                    studentTyped
                )?.map((app: IApplicationPopulated) => (
                    <li key={app.programId?._id?.toString() ?? ''}>
                        <Link
                            component={LinkDom}
                            target="_blank"
                            to={DEMO.SINGLE_PROGRAM_LINK(
                                app.programId?._id?.toString() ?? ''
                            )}
                            underline="hover"
                            variant="body2"
                        >
                            {app.programId?.school}{' '}
                            {app.programId?.program_name}{' '}
                            {app.programId?.degree} {app.programId?.semester} -{' '}
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
                    </li>
                ))}
            </Stack>
        </DashboardNotice>
    );
};

export default EnglishCertificateExpiredBeforeDeadlineBanner;
