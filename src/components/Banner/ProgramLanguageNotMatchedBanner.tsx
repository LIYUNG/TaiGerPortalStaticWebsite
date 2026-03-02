import { Link as LinkDom } from 'react-router-dom';
import { Alert, Card, Link, ListItem } from '@mui/material';
import i18next from 'i18next';

import {
    isLanguageNotMatchedInAnyProgram,
    languageNotMatchedPrograms
} from '@pages/Utils/util_functions';
import DEMO from '@store/constant';
import type {
    IApplicationWithId,
    IProgramWithId,
    IStudentResponse
} from '@taiger-common/model';

interface ProgramLanguageNotMatchedBannerProps {
    student: IStudentResponse;
}

const ProgramLanguageNotMatchedBanner = ({
    student
}: ProgramLanguageNotMatchedBannerProps) => {
    return isLanguageNotMatchedInAnyProgram(student) ? (
        <Card sx={{ border: '4px solid red' }}>
            <Alert severity="warning">
                {i18next.t(
                    'Programs below require the language that does not match to your background if your survey.',
                    {
                        ns: 'common'
                    }
                )}
                &nbsp;:&nbsp;
            </Alert>
            {languageNotMatchedPrograms(student)?.map(
                (app: IApplicationWithId) => {
                    const program = app.programId as IProgramWithId | undefined;
                    const programIdStr = program?._id?.toString() ?? '';
                    return (
                        <ListItem key={programIdStr}>
                            <Link
                                component={LinkDom}
                                target="_blank"
                                to={DEMO.SINGLE_PROGRAM_LINK(programIdStr)}
                            >
                                {program?.school} {program?.program_name}{' '}
                                {program?.degree} {program?.semester} -{' '}
                                <strong>{program?.lang}</strong>
                            </Link>
                        </ListItem>
                    );
                }
            )}
        </Card>
    ) : null;
};
export default ProgramLanguageNotMatchedBanner;
