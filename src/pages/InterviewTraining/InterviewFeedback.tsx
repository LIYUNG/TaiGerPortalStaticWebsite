import { useState } from 'react';
import {
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { Box, Collapse, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as LinkDom } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import DEMO from '@store/constant';
import { convertDate } from '@utils/contants';
import { useAuth } from '@components/AuthProvider';
import {
    getInterviewsByProgramIdQuery,
    getInterviewsByStudentIdQuery
} from '@/api/query';
import Loading from '@components/Loading/Loading';

interface InterviewFeedbackProps {
    /** Only the populated fields this card reads. */
    interview: {
        _id: string;
        student_id: { _id: string; firstname?: string; lastname?: string };
        program_id: { _id: string };
    };
}

/** Shape actually returned by the interviews endpoints (populated refs). */
interface PopulatedInterviewRecord {
    _id: string;
    isClosed?: boolean;
    interview_date?: string | Date;
    surveyResponses?: { isFinal?: boolean }[];
    student_id?: { firstname?: string; lastname?: string };
    program_id?: { school?: string; program_name?: string; degree?: string };
}

interface InterviewListResponse {
    success?: boolean;
    data?: PopulatedInterviewRecord[];
}

export const InterviewFeedback = ({ interview }: InterviewFeedbackProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { data: studentInterviews, isLoading: isStudentInterviewsLoading } =
        useQuery(getInterviewsByStudentIdQuery(interview.student_id._id));
    const { data: programInterviews, isLoading: isProgramInterviewsLoading } =
        useQuery(getInterviewsByProgramIdQuery(interview.program_id._id));
    const studentInterviewList = (
        studentInterviews as InterviewListResponse | undefined
    )?.data;
    const programInterviewList = (
        programInterviews as InterviewListResponse | undefined
    )?.data;
    const [isStudentInterviewsOpen, setIsStudentInterviewsOpen] =
        useState(true);

    const [
        isPreviousInterviewQuestionnaireOpen,
        setPreviousInterviewQuestionnaireOpen
    ] = useState(true);

    if (isStudentInterviewsLoading || isProgramInterviewsLoading) {
        return <Loading variant="child" />;
    }
    return (
        <div>
            {user && is_TaiGer_role(user) && (
                <>
                    <Box>
                        <Box
                            onClick={() =>
                                setPreviousInterviewQuestionnaireOpen(
                                    !isPreviousInterviewQuestionnaireOpen
                                )
                            }
                            sx={{
                                cursor: 'pointer',
                                px: 1,
                                py: 2,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {isPreviousInterviewQuestionnaireOpen ? (
                                <ExpandLessIcon />
                            ) : (
                                <ExpandMoreIcon />
                            )}
                            <Typography sx={{ ml: 1 }} variant="h6">
                                {t('Previous Interview Questionnaire', {
                                    ns: 'interviews'
                                })}
                            </Typography>
                        </Box>
                        <Collapse in={isPreviousInterviewQuestionnaireOpen}>
                            <Box>
                                <Box pl={2}>
                                    {programInterviewList?.map(
                                        (
                                            programInterview: PopulatedInterviewRecord
                                        ) =>
                                            programInterview._id !==
                                                interview._id && (
                                                <Link
                                                    component={LinkDom}
                                                    display="block"
                                                    key={programInterview._id}
                                                    mb={0.5}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.5
                                                    }}
                                                    target="_blank"
                                                    to={`${DEMO.INTERVIEW_SINGLE_SURVEY_LINK(
                                                        programInterview._id.toString()
                                                    )}`}
                                                    underline="hover"
                                                >
                                                    {`${convertDate(programInterview.interview_date ?? '')} - ${programInterview.student_id?.firstname} ${programInterview.student_id?.lastname}`}
                                                    {programInterview.surveyResponses &&
                                                        programInterview
                                                            .surveyResponses
                                                            .length > 0 &&
                                                        (programInterview.surveyResponses.some(
                                                            (response) =>
                                                                response.isFinal
                                                        ) ? (
                                                            <CheckCircleIcon
                                                                sx={{
                                                                    color: 'success.main',
                                                                    fontSize:
                                                                        '16px'
                                                                }}
                                                            />
                                                        ) : (
                                                            <WarningIcon
                                                                sx={{
                                                                    color: 'warning.main',
                                                                    fontSize:
                                                                        '16px'
                                                                }}
                                                            />
                                                        ))}
                                                </Link>
                                            )
                                    )}
                                    <Typography
                                        color="text.secondary"
                                        mt={1}
                                        variant="body2"
                                    >
                                        {t('Total interview records:')}{' '}
                                        {programInterviewList?.filter(
                                            (i: PopulatedInterviewRecord) =>
                                                i.isClosed === true &&
                                                i._id !== interview._id
                                        )?.length || 0}
                                    </Typography>
                                </Box>
                            </Box>
                        </Collapse>
                    </Box>
                    <Box>
                        <Box
                            onClick={() =>
                                setIsStudentInterviewsOpen(
                                    !isStudentInterviewsOpen
                                )
                            }
                            sx={{
                                cursor: 'pointer',
                                px: 1,
                                py: 2,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {isStudentInterviewsOpen ? (
                                <ExpandLessIcon />
                            ) : (
                                <ExpandMoreIcon />
                            )}
                            <Typography sx={{ ml: 1 }} variant="h6">
                                {t('Student Interview Records', {
                                    ns: 'interviews',
                                    student_name: `${interview.student_id.firstname} ${interview.student_id.lastname}`
                                })}
                            </Typography>
                        </Box>
                        <Collapse in={isStudentInterviewsOpen}>
                            <Box>
                                <Box pl={2}>
                                    {studentInterviewList?.map(
                                        (
                                            studentInterview: PopulatedInterviewRecord
                                        ) =>
                                            studentInterview._id !==
                                                interview._id && (
                                                <Link
                                                    component={LinkDom}
                                                    display="block"
                                                    key={studentInterview._id}
                                                    mb={0.5}
                                                    target="_blank"
                                                    to={`${DEMO.INTERVIEW_SINGLE_LINK(
                                                        studentInterview._id.toString()
                                                    )}`}
                                                    underline="hover"
                                                >
                                                    {`${convertDate(studentInterview.interview_date ?? '')} - ${studentInterview.program_id?.school} - ${studentInterview.program_id?.program_name} ${studentInterview.program_id?.degree}`}
                                                </Link>
                                            )
                                    )}
                                    <Typography
                                        color="text.secondary"
                                        mt={1}
                                        variant="body2"
                                    >
                                        {t('Total interview records:')}{' '}
                                        {studentInterviewList?.filter(
                                            (inv: PopulatedInterviewRecord) =>
                                                inv.isClosed === true &&
                                                inv._id !== interview._id
                                        )?.length || 0}
                                    </Typography>
                                </Box>
                            </Box>
                        </Collapse>
                    </Box>
                </>
            )}
        </div>
    );
};
