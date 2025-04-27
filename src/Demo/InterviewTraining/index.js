import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as LinkDom, useNavigate } from 'react-router-dom';
import { Box, Button, Breadcrumbs, Link, Typography } from '@mui/material';
import {
    is_TaiGer_role,
    isProgramAdmitted,
    isProgramDecided,
    isProgramRejected
} from '@taiger-common/core';

import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { getMyInterviews, getAllInterviews } from '../../api';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '../../store/constant';
import { useAuth } from '../../components/AuthProvider';
import { appConfig } from '../../config';
import Loading from '../../components/Loading/Loading';
import { convertDate, showTimezoneOffset } from '../../utils/contants';
import ExampleWithLocalizationProvider from '../../components/MaterialReactTable';

const InterviewTraining = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [interviewTrainingState, setInterviewTrainingState] = useState({
        error: '',
        isLoaded: false,
        data: null,
        success: false,
        interviewslist: [],
        program_id: '',
        category: '',
        available_interview_request_programs: [],
        res_status: 0,
        res_modal_message: '',
        res_modal_status: 0
    });

    useEffect(() => {
        if (is_TaiGer_role(user)) {
            getAllInterviews().then(
                (resp) => {
                    const { data, success, student } = resp.data;
                    const { status } = resp;
                    if (success) {
                        setInterviewTrainingState((prevState) => ({
                            ...prevState,
                            isLoaded: true,
                            interviewslist: data,
                            student: student,
                            success: success,
                            res_status: status
                        }));
                    } else {
                        setInterviewTrainingState((prevState) => ({
                            ...prevState,
                            isLoaded: true,
                            res_status: status
                        }));
                    }
                },
                (error) => {
                    setInterviewTrainingState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        error,
                        res_status: 500
                    }));
                }
            );
        } else {
            getMyInterviews().then(
                (resp) => {
                    const { data, success, student } = resp.data;
                    const { status } = resp;
                    if (success) {
                        setInterviewTrainingState((prevState) => ({
                            ...prevState,
                            isLoaded: true,
                            interviewslist: data,
                            student: student,
                            available_interview_request_programs:
                                student?.applications
                                    ?.filter(
                                        (application) =>
                                            isProgramDecided(application) &&
                                            !isProgramAdmitted(application) &&
                                            !isProgramRejected(application) &&
                                            !interviewslist.find(
                                                (interview) =>
                                                    interview.program_id._id.toString() ===
                                                    application.programId._id.toString()
                                            )
                                    )
                                    .map((application) => {
                                        return {
                                            key: application.programId._id.toString(),
                                            value: `${application.programId.school} ${application.programId.program_name} ${application.programId.degree} ${application.programId.semester}`
                                        };
                                    }) || [],
                            success: success,
                            res_status: status
                        }));
                    } else {
                        setInterviewTrainingState((prevState) => ({
                            ...prevState,
                            isLoaded: true,
                            res_status: status
                        }));
                    }
                },
                (error) => {
                    setInterviewTrainingState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        error,
                        res_status: 500
                    }));
                }
            );
        }
    }, []);

    const handleClick = () => {
        navigate(`${DEMO.INTERVIEW_ADD_LINK}`);
    };

    const ConfirmError = () => {
        setInterviewTrainingState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    TabTitle('Interview training');
    const column = [
        {
            accessorKey: 'status',
            header: t('Status', { ns: 'common' }),
            width: 100
        },
        {
            accessorKey: 'firstname_lastname',
            header: t('First-/ Last Name', { ns: 'common' }),
            size: 200,
            Cell: (params) => {
                const { row } = params;
                const linkUrl = `${DEMO.STUDENT_DATABASE_STUDENTID_LINK(
                    row.original.student_id,
                    DEMO.PROFILE_HASH
                )}`;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        title={row.original.firstname_lastname}
                        to={linkUrl}
                        underline="hover"
                    >
                        {row.original.firstname_lastname}
                    </Link>
                );
            }
        },
        {
            accessorKey: 'trainer_id',
            header: t('Trainer', { ns: 'common' }),
            size: 100,
            Cell: (params) => {
                const { row } = params;
                return (
                    row.original.trainer_id?.map(
                        (trainer) => trainer.firstname
                    ) || []
                );
            }
        },
        {
            accessorKey: 'event_id',
            header: `${t('Training Time', { ns: 'interviews' })} (${
                Intl.DateTimeFormat().resolvedOptions().timeZone
            } ${showTimezoneOffset()})`,
            size: 280,
            Cell: (params) => {
                const { row } = params;
                return (
                    row.original.event_id &&
                    `${convertDate(row.original.event_id.start)}`
                );
            }
        },
        {
            accessorKey: 'interview_date',
            header: t('Official Interview Time', { ns: 'interviews' }),
            size: 200,
            Cell: (params) => {
                const { row } = params;
                return (
                    row.original.interview_date &&
                    `${convertDate(row.original.interview_date)}`
                );
            }
        },
        {
            accessorKey: 'program_name',
            header: t('Interview', { ns: 'interviews' }),
            size: 400,
            Cell: (params) => {
                const { row } = params;
                return (
                    <Link
                        component={LinkDom}
                        target="_blank"
                        title={row.original.program_name}
                        to={DEMO.INTERVIEW_SINGLE_LINK(row.original.id)}
                        underline="hover"
                    >
                        {row.original.program_name}
                    </Link>
                );
            }
        }
    ];
    const transform = (interviews) => {
        const result = [];
        if (!interviews) {
            return [];
        }
        for (const interview of interviews) {
            result.push({
                ...interview,
                id: `${interview._id}`,
                student_id: interview.student_id._id,
                trainer_id: interview.trainer_id,
                program_name: `${interview.program_id.school} ${interview.program_id.program_name} ${interview.program_id.degree} ${interview.program_id.semester}`,
                firstname_lastname: `${interview.student_id.firstname} ${interview.student_id.lastname}`
            });
        }
        return result;
    };
    const memoizedColumns = useMemo(() => column, [column]);

    const {
        res_status,
        isLoaded,
        res_modal_status,
        res_modal_message,
        interviewslist
    } = interviewTrainingState;

    if (!isLoaded) {
        return <Loading />;
    }

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    const rows = transform(interviewslist);

    return (
        <Box>
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}

            <Breadcrumbs aria-label="breadcrumb">
                <Link
                    color="inherit"
                    component={LinkDom}
                    to={`${DEMO.DASHBOARD_LINK}`}
                    underline="hover"
                >
                    {appConfig.companyName}
                </Link>
                <Typography color="text.primary">
                    {t('All Students', { ns: 'common' })}
                </Typography>
                <Typography color="text.primary">
                    {t('Interview Center', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box
                alignItems="center"
                display="flex"
                justifyContent="space-between"
                sx={{ my: 1 }}
            >
                <Typography variant="h6">
                    {is_TaiGer_role(user)
                        ? t('All Interviews', { ns: 'interviews' })
                        : t('My Interviews', { ns: 'interviews' })}
                </Typography>
                {/* Button on the right */}
                <Box>
                    {!is_TaiGer_role(user) &&
                    interviewTrainingState.available_interview_request_programs
                        ?.length > 0 ? (
                        <Button
                            color="primary"
                            onClick={handleClick}
                            sx={{ my: 1 }}
                            variant="contained"
                        >
                            {t('Add', { ns: 'common' })}
                        </Button>
                    ) : null}
                    {is_TaiGer_role(user) ? (
                        <Button
                            color="primary"
                            onClick={handleClick}
                            sx={{ my: 1 }}
                            variant="contained"
                        >
                            {t('Add', { ns: 'common' })}
                        </Button>
                    ) : null}
                </Box>
            </Box>
            <ExampleWithLocalizationProvider
                col={memoizedColumns}
                data={rows}
            />
        </Box>
    );
};

export default InterviewTraining;
