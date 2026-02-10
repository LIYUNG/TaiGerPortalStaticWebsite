import { useEffect, useState, type ChangeEvent } from 'react';
import { Box, Paper, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { is_TaiGer_role } from '@taiger-common/core';
import {
    getInterview,
    getInterviewSurvey,
    updateInterviewSurvey
} from '@api';
import Loading from '@components/Loading/Loading';
import ErrorPage from '../Utils/ErrorPage';
import { appConfig } from '../../config';
import DEMO from '../../store/constant';
import { useAuth } from '@components/AuthProvider';
import { TopBar } from '@components/TopBar/TopBar';
import { ConfirmationModal } from '@components/Modal/ConfirmationModal';

import SurveyHeader from '@components/SurveyProvider/SurveyHeader';
import StepIndicators from '@components/SurveyProvider/StepIndicators';
import StepNavigation from '@components/SurveyProvider/StepNavigation';
import InterviewExperienceStep from '@components/SurveyProvider/InterviewExperienceStep';
import ProgramFeedbackStep from '@components/SurveyProvider/ProgramFeedbackStep';
import FinalThoughtsStep from '@components/SurveyProvider/FinalThoughtsStep';

const steps = ['Interview Experience', 'Program Feedback', 'Final Thoughts'];

const InterviewSurveyForm = () => {
    const { interview_id } = useParams();
    const { t } = useTranslation();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [values, setValues] = useState({
        interviewRating: '',
        informationClarity: '',
        trainerFriendliness: '',
        questionsAnswered: '',
        interviewQuestions: '',
        interviewFeedback: ''
    });
    const [validationErrors, setValidationErrors] = useState([]);
    const [interview, setInterview] = useState({});
    const [interviewSurveyState, setInterviewSurveyState] = useState({
        isLoaded: false,
        res_status: 0
    });

    useEffect(() => {
        fetchInterviewAndSurvey();
        getInterview(interview_id).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    setInterview(data);
                    setInterviewSurveyState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        success: success,
                        res_status: status
                    }));
                } else {
                    setInterviewSurveyState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_status: status
                    }));
                }
            },
            (error) => {
                setInterviewSurveyState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_status: 500
                }));
            }
        );
    }, [interview_id]);

    const fetchInterviewAndSurvey = async () => {
        try {
            const {
                data: { data, success }
            } = await getInterviewSurvey(interview_id);
            if (success) {
                const result = data?.responses?.reduce((acc, item) => {
                    acc[item.questionId] = item.answer;
                    return acc;
                }, {});
                console.log(
                    'fetchInterviewAndSurvey - data:',
                    data,
                    'result:',
                    result
                );

                // Map questionsAnswered numeric values back to strings
                const questionsAnsweredReverseMap = {
                    1: 'yes',
                    2: 'mostly',
                    3: 'some',
                    4: 'no'
                };

                // Map the old field names to new field names
                const mappedValues = {
                    interviewRating: result.q1 || '',
                    informationClarity: result.q2 || '',
                    trainerFriendliness: result.q3 || '',
                    questionsAnswered:
                        questionsAnsweredReverseMap[result.questionsAnswered] ||
                        '',
                    interviewQuestions: data?.interviewQuestions || '',
                    interviewFeedback: data?.interviewFeedback || '',
                    isFinal: data?.isFinal || false
                };

                console.log('mappedValues:', mappedValues);
                setValues(mappedValues);
            }
        } catch (error) {
            setInterviewSurveyState((prevState) => ({
                ...prevState,
                isLoaded: true,
                error,
                res_status: 500
            }));
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        console.log('handleChange called:', { name, value, event });
        if (
            (name === 'interviewQuestions' || name === 'interviewFeedback') &&
            value.length > 2000
        ) {
            return;
        }
        setIsChanged(true);
        setValues({
            ...values,
            [name]: value
        });
    };

    const handleSaveDraft = async () => {
        try {
            setIsChanged(false);

            // Map questionsAnswered string values to numbers
            const questionsAnsweredMap = {
                yes: 1,
                mostly: 2,
                some: 3,
                no: 4
            };

            const response = await updateInterviewSurvey(interview_id, {
                student_id: interview.student_id?._id?.toString(),
                interview_id: interview_id,
                responses: [
                    {
                        questionId: 'q1',
                        answer: Number(values.interviewRating)
                    },
                    {
                        questionId: 'q2',
                        answer: Number(values.informationClarity)
                    },
                    {
                        questionId: 'q3',
                        answer: Number(values.trainerFriendliness)
                    },
                    {
                        questionId: 'questionsAnswered',
                        answer:
                            questionsAnsweredMap[values.questionsAnswered] || 0
                    }
                ],
                interviewQuestions: values.interviewQuestions,
                interviewFeedback: values.interviewFeedback
            });
            console.log('Survey response submitted:', response.data);
        } catch (error) {
            console.error('Error submitting survey response:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            // Map questionsAnswered string values to numbers
            const questionsAnsweredMap = {
                yes: 1,
                mostly: 2,
                some: 3,
                no: 4
            };

            const response = await updateInterviewSurvey(interview_id, {
                student_id: interview.student_id?._id?.toString(),
                interview_id: interview_id,
                responses: [
                    {
                        questionId: 'q1',
                        answer: Number(values.interviewRating)
                    },
                    {
                        questionId: 'q2',
                        answer: Number(values.informationClarity)
                    },
                    {
                        questionId: 'q3',
                        answer: Number(values.trainerFriendliness)
                    },
                    {
                        questionId: 'questionsAnswered',
                        answer:
                            questionsAnsweredMap[values.questionsAnswered] || 0
                    }
                ],
                isFinal: true,
                interviewQuestions: values.interviewQuestions,
                interviewFeedback: values.interviewFeedback
            });
            setIsLoading(false);
            setIsModalOpen(false);
            setValues((prevState) => ({
                ...prevState,
                isFinal: true
            }));
            console.log('Survey response submitted:', response.data);
        } catch (error) {
            console.error('Error submitting survey response:', error);
        }
    };

    // Step navigation functions
    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Form validation for all required fields
    const formValidator = () => {
        const errors = [];
        if (!values.interviewRating) {
            errors.push('Interview training materials rating is required');
        }
        if (!values.informationClarity) {
            errors.push('Interview help rating is required');
        }
        if (!values.trainerFriendliness) {
            errors.push('Trainer friendliness rating is required');
        }
        if (!values.questionsAnswered) {
            errors.push('Questions answered selection is required');
        }
        if (!values.interviewQuestions) {
            errors.push('Interview questions are required');
        }
        return errors;
    };

    // Step validation
    const isCurrentStepValid = () => {
        switch (currentStep) {
            case 0:
                return (
                    values.interviewRating &&
                    values.informationClarity &&
                    values.trainerFriendliness &&
                    values.questionsAnswered
                );
            case 1:
                return values.interviewQuestions;
            case 2:
                return true;
            default:
                return false;
        }
    };

    const renderStepContent = () => {
        console.log(
            'renderStepContent - values:',
            values,
            'isFinal:',
            values.isFinal
        );
        switch (currentStep) {
            case 0:
                return (
                    <InterviewExperienceStep
                        disabled={values.isFinal as boolean}
                        onChange={handleChange}
                        t={t}
                        values={values}
                    />
                );
            case 1:
                return (
                    <ProgramFeedbackStep
                        disabled={values.isFinal}
                        onChange={handleChange}
                        t={t}
                        values={values}
                    />
                );
            case 2:
                return (
                    <FinalThoughtsStep
                        disabled={values.isFinal}
                        onChange={handleChange}
                        t={t}
                        values={values}
                    />
                );
            default:
                return <div>Step not found</div>;
        }
    };

    const { res_status, isLoaded } = interviewSurveyState;

    if (!isLoaded) {
        return <Loading />;
    }

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    const interview_name = `${interview?.student_id?.firstname} ${interview?.student_id?.lastname} - ${interview?.program_id?.school} ${interview?.program_id?.program_name} ${interview?.program_id?.degree} ${interview?.program_id?.semester}`;

    const breadcrumbs = [
        {
            label: appConfig.companyName,
            to: `${DEMO.DASHBOARD_LINK}`
        },
        {
            label: is_TaiGer_role(user)
                ? t('All Interviews', { ns: 'interviews' })
                : t('My Interviews', { ns: 'interviews' }),
            to: `${DEMO.INTERVIEW_LINK}`
        },
        {
            label: interview_name,
            to: `${DEMO.INTERVIEW_SINGLE_LINK(interview_id)}`
        },
        {
            label: t('Survey', { ns: 'common' })
        }
    ];

    return (
        <Box>
            {values.isFinal ? <TopBar /> : null}

            <Container maxWidth="lg" sx={{ py: 6 }}>
                <Paper elevation={4} sx={{ p: 6 }}>
                    <SurveyHeader
                        breadcrumbs={breadcrumbs}
                        instructions={t(
                            'Your feedback helps us improve our services.',
                            {
                                ns: 'interviews'
                            }
                        )}
                        interviewName={interview_name}
                        subtitle={t(
                            'Please share your experience of our interview process by completing this survey.',
                            {
                                ns: 'interviews'
                            }
                        )}
                        title={t('Interview Survey Form', { ns: 'interviews' })}
                    />

                    {/* Step Indicators */}
                    <StepIndicators currentStep={currentStep} steps={steps} />

                    {/* Step Content */}
                    <Box sx={{ minHeight: 500, mb: 4 }}>
                        {renderStepContent()}
                    </Box>

                    {/* Validation Errors */}
                    {currentStep === steps.length - 1 &&
                        validationErrors.length > 0 && (
                            <Box
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    bgcolor: '#fff3cd',
                                    border: '1px solid #ffeaa7',
                                    borderRadius: 1
                                }}
                            >
                                <Typography
                                    color="warning.dark"
                                    sx={{ mb: 1 }}
                                    variant="subtitle2"
                                >
                                    Please complete the following required
                                    fields:
                                </Typography>
                                <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>
                                            <Typography
                                                color="warning.dark"
                                                variant="body2"
                                            >
                                                {error}
                                            </Typography>
                                        </li>
                                    ))}
                                </ul>
                            </Box>
                        )}

                    {/* Step Navigation Buttons */}
                    <StepNavigation
                        currentStep={currentStep}
                        isChanged={isChanged}
                        isFinal={values.isFinal}
                        isLastStep={currentStep === steps.length - 1}
                        isValid={
                            currentStep === steps.length - 1
                                ? formValidator().length === 0
                                : isCurrentStepValid()
                        }
                        onNext={handleNext}
                        onOpenModal={() => {
                            if (currentStep === steps.length - 1) {
                                const errors = formValidator();
                                setValidationErrors(errors);
                                if (errors.length === 0) {
                                    setIsModalOpen(true);
                                }
                            } else {
                                setIsModalOpen(true);
                            }
                        }}
                        onPrevious={handlePrevious}
                        onSaveDraft={handleSaveDraft}
                    />
                </Paper>
            </Container>

            <ConfirmationModal
                closeText={t('Cancel', { ns: 'common' })}
                confirmText={t('Submit', { ns: 'common' })}
                content={`${t('Do you want to submit the interview survey?', {
                    ns: 'interviews'
                })} ${t(
                    'After submission you can not change the survey anymore.',
                    {
                        ns: 'interviews'
                    }
                )}`}
                isLoading={isLoading}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleSubmit}
                open={isModalOpen}
                title={t('Attention')}
            />
        </Box>
    );
};

export default InterviewSurveyForm;
