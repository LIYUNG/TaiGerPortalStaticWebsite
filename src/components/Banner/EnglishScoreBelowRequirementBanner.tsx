import { Link as LinkDom } from 'react-router-dom';
import { Link, Stack, Typography } from '@mui/material';
import i18next from 'i18next';

import { englishScoreRequirementIssues } from '@pages/Utils/util_functions';
import DashboardNotice from './DashboardNotice';
import DEMO from '@store/constant';
import type { IStudentResponse } from '@taiger-common/model';

interface EnglishScoreBelowRequirementBannerProps {
    student: IStudentResponse;
}

/**
 * Warns the student (and whoever views their dashboard) when a program they have
 * decided to apply to has an English (TOEFL/IELTS) minimum — overall or
 * per-section — that their recorded scores do not meet. Without this, a single
 * section score below the requirement silently leads to rejection after
 * submission. Rendered through DashboardNotice, like its sibling banners.
 */
const EnglishScoreBelowRequirementBanner = ({
    student
}: EnglishScoreBelowRequirementBannerProps) => {
    const issues = englishScoreRequirementIssues(student);
    if (issues.length === 0) {
        return null;
    }

    return (
        <DashboardNotice severity="warning">
            {i18next.t(
                'Your English test scores are below the minimum requirement for the programs below. Applying may lead to rejection — please double-check the scores in your survey before submitting.',
                { ns: 'common' }
            )}
            <Stack component="ul" spacing={0.5} sx={{ m: 0, mt: 0.5, pl: 2 }}>
                {issues.map(({ program, certificate, failures }) => {
                    const programIdStr = program?._id?.toString() ?? '';
                    return (
                        <li key={programIdStr}>
                            <Link
                                component={LinkDom}
                                target="_blank"
                                to={DEMO.SINGLE_PROGRAM_LINK(programIdStr)}
                                underline="hover"
                                variant="body2"
                            >
                                {program?.school} {program?.program_name}{' '}
                                {program?.degree} {program?.semester}
                            </Link>
                            <Typography color="error" variant="caption">
                                {certificate}:{' '}
                                {failures
                                    .map(
                                        (failure) =>
                                            `${failure.section} ${failure.actual} < ${failure.required}`
                                    )
                                    .join(', ')}
                            </Typography>
                        </li>
                    );
                })}
            </Stack>
        </DashboardNotice>
    );
};

export default EnglishScoreBelowRequirementBanner;
