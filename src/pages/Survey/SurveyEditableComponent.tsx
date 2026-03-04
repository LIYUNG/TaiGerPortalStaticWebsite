import React, { type MouseEvent } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@components/AuthProvider';
import type { SurveyStateActions } from '@components/SurveyProvider/useSurveyState';

import { useSurveyEditableLocalState } from './hooks/useSurveyEditableLocalState';
import SurveyMissingFieldsAlerts from './components/SurveyMissingFieldsAlerts';
import SurveyDocLinkEditDialog from './components/SurveyDocLinkEditDialog';
import SurveyApplicationPreferenceCard from './components/SurveyApplicationPreferenceCard';
import SurveyAcademicBackgroundCard from './components/SurveyAcademicBackgroundCard';
import SurveyLanguagesCard from './components/SurveyLanguagesCard';

export interface SurveyEditableComponentProps extends SurveyStateActions {
    docName?: string;
}

const SurveyEditableComponent = (props: SurveyEditableComponentProps) => {
    const {
        survey,
        handleChangeAcademic,
        handleTestDate,
        handleChangeLanguage,
        handleChangeApplicationPreference,
        setApplicationPreferenceByField,
        handleAcademicBackgroundSubmit,
        handleSurveyLanguageSubmit,
        handleApplicationPreferenceSubmit,
        updateDocLink,
        onChangeURL
    } = props;
    const { user } = useAuth();
    const { t } = useTranslation();
    const localState = useSurveyEditableLocalState();
    const {
        baseDocsflagOffcanvas,
        baseDocsflagOffcanvasButtonDisable,
        anchorEl,
        closeOffcanvasWindow,
        openOffcanvasWindow,
        handleClosePopover,
        handleRowClick
    } = localState;

    const handleUpdateDocLink = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        localState.setOffcanvasSaving(true);
        updateDocLink(survey.survey_link ?? '', 'Grading_System');
        localState.setOffcanvasSaving(false);
    };

    return (
        <Box>
            <SurveyMissingFieldsAlerts survey={survey} t={t} />
            <SurveyAcademicBackgroundCard
                survey={survey}
                user={user}
                t={t}
                handleChangeAcademic={handleChangeAcademic}
                handleAcademicBackgroundSubmit={handleAcademicBackgroundSubmit}
                openOffcanvasWindow={openOffcanvasWindow}
                surveyLink={survey.survey_link}
                anchorEl={anchorEl}
                onClosePopover={handleClosePopover}
                onOpenPopover={handleRowClick}
            />
            <SurveyApplicationPreferenceCard
                survey={survey}
                user={user}
                t={t}
                handleChangeApplicationPreference={
                    handleChangeApplicationPreference
                }
                setApplicationPreferenceByField={
                    setApplicationPreferenceByField
                }
                handleApplicationPreferenceSubmit={
                    handleApplicationPreferenceSubmit
                }
            />
            <SurveyLanguagesCard
                survey={survey}
                user={user}
                t={t}
                handleChangeLanguage={handleChangeLanguage}
                handleTestDate={handleTestDate}
                handleSurveyLanguageSubmit={handleSurveyLanguageSubmit}
            />
            <SurveyDocLinkEditDialog
                open={baseDocsflagOffcanvas}
                onClose={closeOffcanvasWindow}
                onSave={handleUpdateDocLink}
                surveyLink={survey.survey_link}
                onChangeURL={onChangeURL}
                docName={props?.docName}
                saving={baseDocsflagOffcanvasButtonDisable}
                t={t}
            />
        </Box>
    );
};

export default SurveyEditableComponent;
