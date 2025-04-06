import React, { useCallback, useMemo, useState } from 'react';
import {
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import ModalMain from '../../Utils/ModalHandler/ModalMain';
import { updateInterviewTrainer } from '../../../api';
import NoTrainersInterviewsCard from '../../Dashboard/MainViewTab/NoTrainersInterviewsCard/NoTrainersInterviewsCard';
import i18next from 'i18next';

const InterviewsTable = ({ noTrainerInterviews }) => (
    <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell />
                    <TableCell>
                        {i18next.t('First-, Last Name', { ns: 'common' })}
                    </TableCell>
                    <TableCell>
                        {i18next.t('Interview', { ns: 'common' })}
                    </TableCell>
                    <TableCell>
                        {i18next.t('InterviewTime', { ns: 'common' })}
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>{noTrainerInterviews}</TableBody>
        </Table>
    </TableContainer>
);

const AssignInterviewTrainersPage = ({ interviews }) => {
    const { t } = useTranslation();

    const [state, setState] = useState({
        error: '',
        isLoaded: false,
        success: false,
        res_modal_message: '',
        res_modal_status: 0,
        interviews
    });

    const updateInterviewTrainerList = useCallback(
        async (trainer_id, interview_id) => {
            try {
                const resp = await updateInterviewTrainer(
                    trainer_id,
                    interview_id
                );
                const { data, success } = resp.data;
                const { status } = resp;

                setState((prevState) => {
                    if (success) {
                        const updatedInterviews = prevState.interviews.map(
                            (interview) =>
                                interview._id === interview_id
                                    ? data
                                    : interview
                        );
                        return {
                            ...prevState,
                            isLoaded: true,
                            interviews: updatedInterviews,
                            success,
                            res_modal_status: status
                        };
                    } else {
                        return {
                            ...prevState,
                            isLoaded: true,
                            res_modal_message: resp.data.message,
                            res_modal_status: status
                        };
                    }
                });
            } catch (error) {
                setState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        },
        []
    );

    const handleSubmit = useCallback(
        (e, updateTrainerList, interview_id) => {
            e.preventDefault();
            updateInterviewTrainerList(updateTrainerList, interview_id);
        },
        [updateInterviewTrainerList]
    );

    const ConfirmError = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    }, []);

    const noTrainerInterviews = useMemo(() => {
        return state.interviews
            .filter(
                (interview) =>
                    !interview.trainer_id || interview.trainer_id.length === 0
            )
            .map((interview) => (
                <NoTrainersInterviewsCard
                    interview={interview}
                    key={interview._id}
                    submitUpdateInterviewTrainerlist={handleSubmit}
                />
            ));
    }, [state.interviews, handleSubmit]);

    return (
        <Box>
            {state.res_modal_status >= 400 && (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={state.res_modal_message}
                    res_modal_status={state.res_modal_status}
                />
            )}
            <Card sx={{ p: 2 }}>
                <Typography variant="h6">
                    {t('No Interview Trainer')}
                </Typography>
                <InterviewsTable noTrainerInterviews={noTrainerInterviews} />
            </Card>
        </Box>
    );
};

export default AssignInterviewTrainersPage;
