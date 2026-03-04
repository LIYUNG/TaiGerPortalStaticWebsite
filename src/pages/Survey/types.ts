import type { TFunction } from 'i18next';
import type { SurveyStateValue } from '@components/SurveyProvider/useSurveyState';
import type { IUser } from '@taiger-common/model';

export interface SurveyMissingFieldsAlertsProps {
    survey: SurveyStateValue;
    t: TFunction;
}

export interface SurveyDocLinkEditDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (e: React.MouseEvent<HTMLElement>) => void;
    surveyLink: string | undefined;
    onChangeURL: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    docName?: string;
    saving: boolean;
    t: TFunction;
}

export interface SurveyApplicationPreferenceCardProps {
    survey: SurveyStateValue;
    user: IUser | null | undefined;
    t: TFunction;
    handleChangeApplicationPreference: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setApplicationPreferenceByField: (name: string) => (value: unknown) => void;
    handleApplicationPreferenceSubmit: (e: React.FormEvent, application_preference: Record<string, unknown>) => void;
}

export interface SurveyLanguagesCardProps {
    survey: SurveyStateValue;
    user: IUser | null | undefined;
    t: TFunction;
    handleChangeLanguage: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTestDate: (name: string, newValue: unknown) => void;
    handleSurveyLanguageSubmit: (e: React.FormEvent, language: Record<string, unknown>) => void;
}

export interface SurveyAcademicBackgroundCardProps {
    survey: SurveyStateValue;
    user: IUser | null | undefined;
    t: TFunction;
    handleChangeAcademic: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleAcademicBackgroundSubmit: (e: React.FormEvent, university: Record<string, unknown>) => void;
    openOffcanvasWindow: () => void;
    surveyLink: string | undefined;
    anchorEl: HTMLElement | null;
    onClosePopover: () => void;
    onOpenPopover: (event: React.MouseEvent<HTMLElement>) => void;
}
