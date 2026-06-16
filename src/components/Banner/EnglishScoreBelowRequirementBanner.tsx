import { Link as LinkDom } from 'react-router-dom';
import { Alert, Card, Link, ListItem, Typography } from '@mui/material';
import i18next from 'i18next';

import { englishScoreRequirementIssues } from '@pages/Utils/util_functions';
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
 * submission. Mirrors ProgramLanguageNotMatchedBanner's look.
 */
const EnglishScoreBelowRequirementBanner = ({
    student
}: EnglishScoreBelowRequirementBannerProps) => {
    const issues = englishScoreRequirementIssues(student);
    if (issues.length === 0) {
        return null;
    }

    return (
        <Card
            sx={{
                borderWidth: 4,
                borderStyle: 'solid',
                borderColor: 'error.main'
            }}
        >
            <Alert severity="warning">
                {i18next.t(
                    'Your English test scores are below the minimum requirement for the programs below. Applying may lead to rejection — please double-check the scores in your survey before submitting.',
                    { ns: 'common' }
                )}
                &nbsp;:&nbsp;
            </Alert>
            {issues.map(({ program, certificate, failures }) => {
                const programIdStr = program?._id?.toString() ?? '';
                return (
                    <ListItem
                        key={programIdStr}
                        sx={{ display: 'block', py: 0.5 }}
                    >
                        <Link
                            component={LinkDom}
                            target="_blank"
                            to={DEMO.SINGLE_PROGRAM_LINK(programIdStr)}
                        >
                            {program?.school} {program?.program_name}{' '}
                            {program?.degree} {program?.semester}
                        </Link>
                        <Typography color="error" variant="body2">
                            {certificate}:{' '}
                            {failures
                                .map(
                                    (failure) =>
                                        `${failure.section} ${failure.actual} < ${failure.required}`
                                )
                                .join(', ')}
                        </Typography>
                    </ListItem>
                );
            })}
        </Card>
    );
};

export default EnglishScoreBelowRequirementBanner;
