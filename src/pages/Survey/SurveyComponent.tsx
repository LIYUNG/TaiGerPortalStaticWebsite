import { Box } from '@mui/material';

import { useSurveyState } from '@components/SurveyProvider/useSurveyState';
import type { SurveyStateValue } from '@components/SurveyProvider/useSurveyState';

import SurveyEditableComponent from './SurveyEditableComponent';

export interface SurveyComponentProps {
    initialSurvey: SurveyStateValue;
    onSurveySuccess?: () => void;
}

const SurveyComponent = ({
    initialSurvey,
    onSurveySuccess
}: SurveyComponentProps) => {
    const surveyActions = useSurveyState({
        initialValue: initialSurvey,
        onSuccess: onSurveySuccess
    });

    return (
        <Box>
            <SurveyEditableComponent {...surveyActions} />
        </Box>
    );
};

export default SurveyComponent;
