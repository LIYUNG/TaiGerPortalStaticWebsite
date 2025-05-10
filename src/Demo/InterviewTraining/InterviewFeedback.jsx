import { useEffect, useState } from 'react';
import {
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { is_TaiGer_role } from '@taiger-common/core';
import { Box, Collapse, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as LinkDom } from 'react-router-dom';

import DEMO from '../../store/constant';
import { convertDate } from '../../utils/contants';
import { getInterviewsByProgramId, getInterviewsByStudentId } from '../../api';
import { useAuth } from '../../components/AuthProvider';

export const InterviewFeedback = ({ interview }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [studentInterviews, setStudentInterviews] = useState([]);
    const [isStudentInterviewsOpen, setIsStudentInterviewsOpen] =
        useState(false);
    const [programInterviews, setProgramInterviews] = useState([]);

    useEffect(() => {
        const fetchStudentInterviews = async () => {
            if (isStudentInterviewsOpen && interview.student_id._id) {
                try {
                    const response = await getInterviewsByStudentId(
                        interview.student_id._id
                    );
                    if (response.data.success) {
                        setStudentInterviews(response.data.data);
                    }
                } catch (error) {
                    console.error('Error fetching student interviews:', error);
                }
            }
        };

        fetchStudentInterviews();
    }, [isStudentInterviewsOpen, interview.student_id]);

    const [
        isPreviousInterviewQuestionnaireOpen,
        setPreviousInterviewQuestionnaireOpen
    ] = useState(false);

    useEffect(() => {
        const fetchProgramInterviews = async () => {
            if (
                isPreviousInterviewQuestionnaireOpen &&
                interview.program_id._id
            ) {
                try {
                    const response = await getInterviewsByProgramId(
                        interview.program_id._id
                    );
                    if (response.data.success) {
                        setProgramInterviews(response.data.data);
                    }
                } catch (error) {
                    console.error('Error fetching program interviews:', error);
                }
            }
        };

        fetchProgramInterviews();
    }, [isPreviousInterviewQuestionnaireOpen, interview.program_id]);

    return (
        <div>
            {is_TaiGer_role(user) && (
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
                                    {programInterviews?.map(
                                        (programInterview) =>
                                            programInterview.isClosed ===
                                                true &&
                                            programInterview._id !==
                                                interview._id && (
                                                <Link
                                                    component={LinkDom}
                                                    display="block"
                                                    key={programInterview._id}
                                                    mb={0.5}
                                                    target="_blank"
                                                    to={`${DEMO.INTERVIEW_SINGLE_SURVEY_LINK(
                                                        programInterview._id.toString()
                                                    )}`}
                                                    underline="hover"
                                                >
                                                    {`${convertDate(programInterview.interview_date)} - ${programInterview.student_id.firstname} ${programInterview.student_id.lastname}`}
                                                </Link>
                                            )
                                    )}
                                    <Typography
                                        color="text.secondary"
                                        mt={1}
                                        variant="body2"
                                    >
                                        {t('Total interview records:')}{' '}
                                        {programInterviews?.filter(
                                            (interview) =>
                                                interview.isClosed === true &&
                                                interview._id !== interview._id
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
                                    {studentInterviews?.map(
                                        (studentInterview) =>
                                            studentInterview.isClosed ===
                                                true &&
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
                                                    {`${convertDate(studentInterview.interview_date)} - ${studentInterview.program_id.school} - ${studentInterview.program_id.program_name} ${studentInterview.program_id.degree}`}
                                                </Link>
                                            )
                                    )}
                                    <Typography
                                        color="text.secondary"
                                        mt={1}
                                        variant="body2"
                                    >
                                        {t('Total interview records:')}{' '}
                                        {studentInterviews?.filter(
                                            (interview) =>
                                                interview.isClosed === true &&
                                                interview._id !== interview._id
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
