import { Link as LinkDom } from 'react-router-dom';
import { Link, Stack } from '@mui/material';
import i18next from 'i18next';

import {
    isLanguageNotMatchedInAnyProgram,
    languageNotMatchedPrograms
} from '@pages/Utils/util_functions';
import DashboardNotice from './DashboardNotice';
import DEMO from '@store/constant';
import type {
    IApplicationPopulated,
    IProgramWithId,
    IStudentResponse
} from '@taiger-common/model';

interface ProgramLanguageNotMatchedBannerProps {
    student: IStudentResponse;
}

/**
 * Programmes taught in a language the student's survey says they do not have.
 *
 * Rendered through DashboardNotice so it matches the surrounding dashboard: the
 * old 4px red frame wrapped around a yellow alert read as two competing
 * warnings, and the heavy chrome crowded out the list of affected programmes
 * that is the actually useful part.
 */
const ProgramLanguageNotMatchedBanner = ({
    student
}: ProgramLanguageNotMatchedBannerProps) => {
    if (!isLanguageNotMatchedInAnyProgram(student)) {
        return null;
    }

    return (
        <DashboardNotice severity="warning">
            {i18next.t(
                'Programs below require the language that does not match to your background if your survey.',
                { ns: 'common' }
            )}
            <Stack component="ul" spacing={0.25} sx={{ m: 0, mt: 0.5, pl: 2 }}>
                {languageNotMatchedPrograms(student)?.map(
                    (app: IApplicationPopulated) => {
                        const program = app.programId as
                            | IProgramWithId
                            | undefined;
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
                                    {program?.degree} {program?.semester} -{' '}
                                    <strong>{program?.lang}</strong>
                                </Link>
                            </li>
                        );
                    }
                )}
            </Stack>
        </DashboardNotice>
    );
};
export default ProgramLanguageNotMatchedBanner;
