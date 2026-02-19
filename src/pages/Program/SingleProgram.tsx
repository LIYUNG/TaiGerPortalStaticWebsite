import { Suspense, useState } from 'react';
import { Box } from '@mui/material';
import {
    Await,
    useLoaderData,
    useNavigate,
    useRevalidator
} from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { deleteProgramV2, processProgramList, refreshProgram } from '@/api';
import type { GetProgramResponse } from '@/api/types';
import SingleProgramView from './SingleProgramView';
import ProgramDeleteWarning from './ProgramDeleteWarning';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import ProgramDiffModal from './ProgramDiffModal';
import { AssignProgramsToStudentDialog } from './AssignProgramsToStudentDialog';
import { queryClient } from '@/api';
import DEMO from '@store/constant';
import { useSnackBar } from '@contexts/use-snack-bar';

const SingleProgram = () => {
    const { data } = useLoaderData() as { data: Promise<GetProgramResponse> };
    const { user } = useAuth();
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const { mutate, isPending } = useMutation({
        mutationFn: deleteProgramV2,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
            setSeverity('success');
            setMessage('Delete the program successfully!');
            setOpenSnackbar(true);
            navigate(DEMO.PROGRAMS);
        },
        onError: (error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        }
    });

    const { mutate: refreshProgramMutation, isPending: isRefreshing } =
        useMutation({
            mutationFn: ({ programId }) => refreshProgram(programId),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['programs'] });
                queryClient.invalidateQueries({ queryKey: ['program'] });
                // Revalidate the route loader to refresh the program data
                revalidator.revalidate();
                setSeverity('success');
                setMessage('Program refreshed successfully!');
                setOpenSnackbar(true);
            },
            onError: (error) => {
                setSeverity('error');
                setMessage(
                    error.message || 'An error occurred. Please try again.'
                );
                setOpenSnackbar(true);
            }
        });

    const [deleteProgramWarningOpen, setDeleteProgramWarningOpen] =
        useState(false);
    const [modalShowAssignWindowOpen, setModalShowAssignWindow] =
        useState(false);
    const [singleProgramState, setSingleProgramState] = useState({
        error: '',
        isReport: false,
        modalShowAssignSuccessWindow: false,
        modalShowDiffWindow: false,
        isDeleted: false,
        res_status: 0,
        students: [],
        tickets: [],
        res_modal_message: '',
        res_modal_status: 0
    });

    const setDiffModal = (show = true) => {
        return () => {
            setSingleProgramState((prevState) => ({
                ...prevState,
                modalShowDiffWindow: show
            }));
        };
    };
    const RemoveProgramHandlerV2 = (program_id) => {
        mutate({ program_id });
    };

    const programListAssistant = () => {
        processProgramList('TODO').then(
            () => {},
            () => {}
        );
    };

    return (
        <Box data-testid="single_program_page">
            <Suspense fallback={<Loading />}>
                <Await resolve={data}>
                    {(loadedData) => {
                        return (
                            <>
                                <SingleProgramView
                                    isRefreshing={isRefreshing}
                                    onRefreshProgram={() =>
                                        refreshProgramMutation({
                                            programId:
                                                loadedData.data._id?.toString()
                                        })
                                    }
                                    program={loadedData.data}
                                    programListAssistant={programListAssistant}
                                    setDeleteProgramWarningOpen={
                                        setDeleteProgramWarningOpen
                                    }
                                    setDiffModalShow={setDiffModal(true)}
                                    setModalShowAssignWindow={
                                        setModalShowAssignWindow
                                    }
                                    students={loadedData.students}
                                    user={user}
                                    versions={loadedData.vc}
                                />
                                <ProgramDeleteWarning
                                    RemoveProgramHandler={
                                        RemoveProgramHandlerV2
                                    }
                                    deleteProgramWarning={
                                        deleteProgramWarningOpen
                                    }
                                    isPending={isPending}
                                    program_id={loadedData.data._id?.toString()}
                                    program_name={loadedData.data.program_name}
                                    setDeleteProgramWarningOpen={
                                        setDeleteProgramWarningOpen
                                    }
                                    uni_name={loadedData.data.school}
                                />
                                <AssignProgramsToStudentDialog
                                    handleOnSuccess={() =>
                                        setModalShowAssignWindow(false)
                                    }
                                    onClose={() =>
                                        setModalShowAssignWindow(false)
                                    }
                                    open={modalShowAssignWindowOpen}
                                    programs={[loadedData.data]}
                                />
                                {singleProgramState.modalShowDiffWindow ? (
                                    <ProgramDiffModal
                                        open={
                                            singleProgramState.modalShowDiffWindow
                                        }
                                        originalProgram={loadedData.data}
                                        setModalHide={setDiffModal(false)}
                                    />
                                ) : null}
                            </>
                        );
                    }}
                </Await>
            </Suspense>
        </Box>
    );
};
export default SingleProgram;
