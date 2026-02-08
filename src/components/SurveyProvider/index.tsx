import {
    createContext,
    useContext,
    useState,
    ReactNode,
    ChangeEvent,
    FormEvent
} from 'react';

import {
    updateAcademicBackground,
    updateApplicationPreference,
    updateDocumentationHelperLink,
    updateLanguageSkill
} from '../../api/index';

export interface SurveyStateValue {
    student_id?: string;
    academic_background?: {
        university?: Record<string, unknown>;
        language?: Record<string, unknown>;
    };
    application_preference?: Record<string, unknown>;
    changed_academic?: boolean;
    changed_application_preference?: boolean;
    changed_language?: boolean;
    success?: boolean;
    updateconfirmed?: boolean;
    res_modal_status?: number;
    res_modal_message?: string;
    error?: unknown;
    isLoaded?: boolean;
    survey_link?: string;
}

interface SurveyContextValue {
    survey: SurveyStateValue;
    handleChangeAcademic: (e: ChangeEvent<HTMLInputElement>) => void;
    handleChangeApplicationPreference: (
        e: ChangeEvent<HTMLInputElement>
    ) => void;
    setApplicationPreferenceByField: (name: string) => (value: unknown) => void;
    handleTestDate: (name: string, newValue: unknown) => void;
    handleChangeLanguage: (e: ChangeEvent<HTMLInputElement>) => void;
    handleAcademicBackgroundSubmit: (
        e: FormEvent,
        university: Record<string, unknown>
    ) => void;
    handleSurveyLanguageSubmit: (
        e: FormEvent,
        language: Record<string, unknown>
    ) => void;
    handleApplicationPreferenceSubmit: (
        e: FormEvent,
        application_preference: Record<string, unknown>
    ) => void;
    updateDocLink: (link: string, key: string) => void;
    onChangeURL: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SurveyContext = createContext<SurveyContextValue | null>(null);

export interface SurveyProviderProps {
    children: ReactNode;
    value: SurveyStateValue;
}

export const SurveyProvider = ({ children, value }: SurveyProviderProps) => {
    const [surveyState, setSurveyState] = useState<SurveyStateValue>(value);

    const handleChangeAcademic = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const university_temp = {
            ...surveyState.academic_background?.university
        } as Record<string, unknown>;
        university_temp[e.target.name] = e.target.value;
        setSurveyState((prevState) => ({
            ...prevState,
            changed_academic: true,
            academic_background: {
                ...prevState.academic_background,
                university: university_temp
            }
        }));
    };

    const setApplicationPreference = (name: string, val: unknown) => {
        const application_preference_temp = {
            ...surveyState.application_preference
        } as Record<string, unknown>;
        application_preference_temp[name] = val;
        setSurveyState((prevState) => ({
            ...prevState,
            changed_application_preference: true,
            application_preference: application_preference_temp
        }));
    };

    const handleChangeApplicationPreference = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        e.preventDefault();
        setApplicationPreference(e.target.name, e.target.value);
    };

    const setApplicationPreferenceByField = (name: string) => {
        return (val: unknown) => {
            setApplicationPreference(name, val);
        };
    };

    const handleTestDate = (name: string, newValue: unknown) => {
        const language_temp = {
            ...surveyState.academic_background?.language
        } as Record<string, unknown>;
        language_temp[name] = newValue;
        setSurveyState((prevState) => ({
            ...prevState,
            changed_language: true,
            academic_background: {
                ...prevState.academic_background,
                language: language_temp
            }
        }));
    };

    const handleChangeLanguage = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const language_temp = {
            ...surveyState.academic_background?.language
        } as Record<string, unknown>;
        language_temp[e.target.name] = e.target.value;
        setSurveyState((prevState) => ({
            ...prevState,
            changed_language: true,
            academic_background: {
                ...prevState.academic_background,
                language: language_temp
            }
        }));
    };

    const handleAcademicBackgroundSubmit = (
        e: FormEvent,
        university: Record<string, unknown>
    ) => {
        updateAcademicBackground(
            university,
            surveyState.student_id as string
        ).then(
            (resp: {
                data: {
                    data?: Record<string, unknown>;
                    success?: boolean;
                    message?: string;
                };
                status?: number;
            }) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success && data) {
                    setSurveyState((prevState) => ({
                        ...prevState,
                        changed_academic: false,
                        academic_background: {
                            ...prevState.academic_background,
                            university: data
                        },
                        success: success,
                        updateconfirmed: true,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setSurveyState((prevState) => ({
                        ...prevState,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error: unknown) => {
                setSurveyState((prevState) => ({
                    ...prevState,
                    error,
                    res_modal_status: 500,
                    res_modal_message: JSON.stringify(error)
                }));
            }
        );
    };

    const handleSurveyLanguageSubmit = (
        e: FormEvent,
        language: Record<string, unknown>
    ) => {
        e.preventDefault();
        updateLanguageSkill(language, surveyState.student_id as string).then(
            (resp: {
                data: {
                    data?: Record<string, unknown>;
                    success?: boolean;
                    message?: string;
                };
                status?: number;
            }) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success && data) {
                    setSurveyState((prevState) => ({
                        ...prevState,
                        changed_language: false,
                        academic_background: {
                            ...prevState.academic_background,
                            language: data
                        },
                        success: success,
                        updateconfirmed: true,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setSurveyState((prevState) => ({
                        ...prevState,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error: unknown) => {
                setSurveyState((prevState) => ({
                    ...prevState,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const handleApplicationPreferenceSubmit = (
        e: FormEvent,
        application_preference: Record<string, unknown>
    ) => {
        e.preventDefault();
        updateApplicationPreference(
            application_preference,
            surveyState.student_id as string
        ).then(
            (resp: {
                data: {
                    data?: Record<string, unknown>;
                    success?: boolean;
                    message?: string;
                };
                status?: number;
            }) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success && data) {
                    setSurveyState((prevState) => ({
                        ...prevState,
                        changed_application_preference: false,
                        application_preference: data,
                        success: success,
                        updateconfirmed: true,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setSurveyState((prevState) => ({
                        ...prevState,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error: unknown) => {
                setSurveyState((prevState) => ({
                    ...prevState,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const updateDocLink = (link: string, key: string) => {
        updateDocumentationHelperLink(link, key, 'survey').then(
            (resp: {
                data: {
                    helper_link?: { link?: string }[];
                    success?: boolean;
                    message?: string;
                };
                status?: number;
            }) => {
                const { helper_link, success } = resp.data;
                const { status } = resp;
                if (success) {
                    setSurveyState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        survey_link: helper_link?.[0]?.link,
                        success: success,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setSurveyState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error: unknown) => {
                setSurveyState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const onChangeURL = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const url_temp = e.target.value;
        setSurveyState((prevState) => ({
            ...prevState,
            survey_link: url_temp
        }));
    };

    const surveyData: SurveyContextValue = {
        survey: surveyState,
        handleChangeAcademic,
        handleChangeApplicationPreference,
        setApplicationPreferenceByField,
        handleTestDate,
        handleChangeLanguage,
        handleAcademicBackgroundSubmit,
        handleSurveyLanguageSubmit,
        handleApplicationPreferenceSubmit,
        updateDocLink,
        onChangeURL
    };

    return (
        <SurveyContext.Provider value={surveyData}>
            {children}
        </SurveyContext.Provider>
    );
};

export const useSurvey = (): SurveyContextValue | null => {
    return useContext(SurveyContext);
};

export { default as StarRating } from './StarRating';
export { default as InterviewExperienceStep } from './InterviewExperienceStep';
export { default as ProgramFeedbackStep } from './ProgramFeedbackStep';
export { default as FinalThoughtsStep } from './FinalThoughtsStep';
export { default as SurveyHeader } from './SurveyHeader';
export { default as StepNavigation } from './StepNavigation';
export { default as StepIndicators } from './StepIndicators';
