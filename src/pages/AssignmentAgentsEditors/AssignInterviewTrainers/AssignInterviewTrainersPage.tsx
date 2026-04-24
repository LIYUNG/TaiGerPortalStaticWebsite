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
import type { IInterviewWithId } from '@taiger-common/model';
import ModalMain from '../../Utils/ModalHandler/ModalMain';
import { updateInterview } from '@/api';
import NoTrainersInterviewsCard from '@pages/Dashboard/MainViewTab/NoTrainersInterviewsCard/NoTrainersInterviewsCard';
import i18next from 'i18next';

interface InterviewsTableProps {
    noTrainerInterviews: React.ReactNode;
}

interface AssignInterviewTrainersPageProps {
    interviews: IInterviewWithId[];
}

const InterviewsTable = ({ noTrainerInterviews }: InterviewsTableProps) => (
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

const AssignInterviewTrainersPage = ({
    interviews
}: AssignInterviewTrainersPageProps) => {
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
        async (trainer_ids: Record<string, boolean>, interview_id: string) => {
            try {
                // Get the selected trainer IDs (where value is true)
                const selectedTrainerIds = Object.entries(trainer_ids)
                    .filter(([, isSelected]) => isSelected)
                    .map(([id]) => id);

                if (selectedTrainerIds.length === 0) {
                    throw new Error('No trainer selected');
                }

                // Pass trainer_id as an array directly
                const resp = await updateInterview(interview_id, {
                    trainer_id: selectedTrainerIds
                });

                const { data, success } = resp.data;
                const { status } = resp;
                const normalizedStatus = status ?? 0;
                const normalizedSuccess = success === true;

                setState((prevState) => {
                    if (normalizedSuccess && data) {
                        const updatedInterviews = prevState.interviews.map(
                            (interview: IInterviewWithId) =>
                                interview._id === interview_id
                                    ? (data as IInterviewWithId)
                                    : interview
                        );
                        return {
                            ...prevState,
                            isLoaded: true,
                            interviews: updatedInterviews,
                            success: true,
                            res_modal_status: normalizedStatus
                        };
                    } else {
                        return {
                            ...prevState,
                            isLoaded: true,
                            res_modal_message: resp.data.message ?? '',
                            res_modal_status: normalizedStatus
                        };
                    }
                });
            } catch (error: unknown) {
                const message =
                    error instanceof Error ? error.message : String(error ?? '');
                setState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: message,
                    res_modal_status: 500,
                    res_modal_message: message
                }));
            }
        },
        []
    );

    const handleSubmit = useCallback(
        (
            e: React.SyntheticEvent,
            updateTrainerList: Record<string, boolean>,
            interview_id: string
        ) => {
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
                (interview: IInterviewWithId) =>
                    !interview.trainer_id || interview.trainer_id.length === 0
            )
            .map((interview: IInterviewWithId) => (
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
