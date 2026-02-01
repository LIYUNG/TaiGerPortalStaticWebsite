import { useEffect, useState } from 'react';
import { is_TaiGer_role } from '@taiger-common/core';

import { useAuth } from '../components/AuthProvider';
import { readDOCX, readPDF, readXLSX } from '../Demo/Utils/checking-functions';
import {
    deleteAMessageInCommunicationThreadV2,
    loadCommunicationThread,
    postCommunicationThreadV2
} from '../api';
import { useSnackBar } from '../contexts/use-snack-bar';
import { queryClient } from '../api/client';
import { useMutation } from '@tanstack/react-query';

interface UseCommunicationsProps {
    data: unknown[];
    student: {
        _id?: { toString: () => string };
        firstname?: string;
        [key: string]: unknown;
    };
}

function useCommunications({ data, student }: UseCommunicationsProps) {
    const { user } = useAuth();
    const [checkResult, setCheckResult] = useState<unknown[]>([]);
    const [communicationsState, setCommunicationsState] = useState({
        error: '' as unknown,
        thread: data,
        count: 0,
        upperThread: [] as unknown[],
        editorState: {} as Record<string, unknown>,
        files: [] as File[],
        student,
        pageNumber: 1,
        uppderaccordionKeys: [] as number[],
        accordionKeys: new Array(data.length)
            .fill(0)
            .map((_x: number, i: number) => (i >= data.length - 2 ? i : -1)),
        loadButtonDisabled: false,
        res_modal_status: 0,
        res_modal_message: ''
    });
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    const { mutate, isPending } = useMutation({
        mutationFn: postCommunicationThreadV2,
        onError: (error: Error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        },
        onSuccess: (responseData: { data?: unknown[] }) => {
            queryClient.invalidateQueries({
                queryKey: [
                    'communications',
                    communicationsState.student._id?.toString()
                ]
            });
            queryClient.invalidateQueries({
                queryKey: ['communications', 'my']
            });
            setCommunicationsState((prevState) => ({
                ...prevState,
                editorState: {},
                count: prevState.count + 1,
                thread: [
                    ...communicationsState.thread,
                    ...(responseData.data ?? [])
                ],
                files: [],
                accordionKeys: [
                    ...communicationsState.accordionKeys,
                    communicationsState.accordionKeys.length
                ]
            }));
        }
    });

    const { mutate: mutateDelete, isPending: isDeleting } = useMutation({
        mutationFn: deleteAMessageInCommunicationThreadV2,
        onError: (error: Error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        },
        onSuccess: (
            _data: unknown,
            variables: { communication_messageId: string }
        ) => {
            const { communication_messageId: message_id } = variables;
            queryClient.invalidateQueries({
                queryKey: [
                    'communications',
                    communicationsState.student._id?.toString()
                ]
            });
            queryClient.invalidateQueries({
                queryKey: ['communications', 'my']
            });
            const new_messages = [...communicationsState.thread];
            const idx = new_messages.findIndex(
                (message: { _id?: { toString: () => string } }) =>
                    message._id?.toString() === message_id
            );
            if (idx !== -1) {
                new_messages.splice(idx, 1);
            }
            const new_upper_messages = [...communicationsState.upperThread];
            const idx2 = new_upper_messages.findIndex(
                (message: { _id?: { toString: () => string } }) =>
                    message._id?.toString() === message_id
            );
            if (idx2 !== -1) {
                new_upper_messages.splice(idx2, 1);
            }
            setCommunicationsState((prevState) => ({
                ...prevState,
                upperThread: new_upper_messages,
                thread: new_messages,
                loadButtonDisabled: false,
                res_modal_status: 200
            }));
            setSeverity('success');
            setMessage('Delete the message successfully');
            setOpenSnackbar(true);
        }
    });

    useEffect(() => {
        setCommunicationsState((prevState) => ({
            ...prevState,
            upperThread: [],
            editorState: {},
            files: [],
            student,
            thread: data,
            pageNumber: 1,
            accordionKeys: new Array(data.length)
                .fill(0)
                .map((_x: number, i: number) =>
                    i >= data.length - 2 ? i : -1
                ),
            loadButtonDisabled: false
        }));
    }, [data]);

    const handleLoadMessages = (): void => {
        setCommunicationsState((prevState) => ({
            ...prevState,
            loadButtonDisabled: true
        }));
        loadCommunicationThread(
            student._id?.toString(),
            communicationsState.pageNumber + 1
        ).then(
            (resp: {
                data?: {
                    success?: boolean;
                    data?: unknown[];
                    student?: unknown;
                };
            }) => {
                const {
                    success,
                    data: respData,
                    student: respStudent
                } = resp.data ?? {};
                if (success && respData) {
                    setCommunicationsState((prevState) => ({
                        ...prevState,
                        success,
                        upperThread: [
                            ...respData,
                            ...communicationsState.upperThread
                        ],
                        student: respStudent ?? student,
                        pageNumber: communicationsState.pageNumber + 1,
                        uppderaccordionKeys: [
                            ...new Array(
                                communicationsState.uppderaccordionKeys
                                    ?.length ?? 0
                            )
                                .fill(0)
                                .map((_x: number, i: number) => i),
                            ...new Array(respData.length)
                                .fill(0)
                                .map((_x: number, i: number) =>
                                    communicationsState.uppderaccordionKeys !==
                                    undefined
                                        ? i +
                                          (communicationsState
                                              .uppderaccordionKeys?.length ?? 0)
                                        : -1
                                )
                        ],
                        loadButtonDisabled: respData.length === 0
                    }));
                } else {
                    setCommunicationsState((prevState) => ({
                        ...prevState
                    }));
                }
            },
            (error: unknown) => {
                setCommunicationsState((prevState) => ({
                    ...prevState,
                    error
                }));
            }
        );
    };

    const onDeleteSingleMessage = (
        e: React.MouseEvent,
        message_id: string
    ): void => {
        e.preventDefault();
        mutateDelete({
            student_id: student._id?.toString() ?? '',
            communication_messageId: message_id
        });
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const file_num = e.target.files?.length ?? 0;
        if (file_num <= 3) {
            if (!e.target.files) {
                return;
            }
            if (!is_TaiGer_role(user)) {
                setCommunicationsState((prevState) => ({
                    ...prevState,
                    files: Array.from(e.target.files!)
                }));
                return;
            }
            const checkPromises = Array.from(e.target.files).map(
                (file: File) => {
                    const extension = file.name.split('.').pop()?.toLowerCase();
                    const studentName = communicationsState.student?.firstname;

                    if (extension === 'pdf') {
                        return readPDF(file, studentName);
                    } else if (extension === 'docx') {
                        return readDOCX(file, studentName);
                    } else if (extension === 'xlsx') {
                        return readXLSX(file, studentName);
                    } else {
                        return Promise.resolve({});
                    }
                }
            );
            Promise.all(checkPromises)
                .then((results) => {
                    setCheckResult(results);
                    setCommunicationsState((prevState) => ({
                        ...prevState,
                        files: Array.from(e.target.files!)
                    }));
                })
                .catch((error: unknown) => {
                    setCommunicationsState((prevState) => ({
                        ...prevState,
                        res_modal_message: String(error),
                        res_modal_status: 500
                    }));
                });
        } else {
            setCommunicationsState((prevState) => ({
                ...prevState,
                res_modal_message: 'You can only select up to 3 files.',
                res_modal_status: 423
            }));
        }
    };

    const handleClickSave = (
        e: React.MouseEvent,
        editorState: Record<string, unknown>
    ): void => {
        e.preventDefault();
        const message = JSON.stringify(editorState);

        const formData = new FormData();

        if (communicationsState.files) {
            communicationsState.files.forEach((file) => {
                formData.append('files', file);
            });
        }

        formData.append('message', message);
        mutate({
            studentId: communicationsState.student._id?.toString() ?? '',
            formData
        });
    };

    return {
        buttonDisabled: isPending,
        loadButtonDisabled: communicationsState.loadButtonDisabled,
        isDeleting,
        files: communicationsState.files,
        count: communicationsState.count,
        editorState: communicationsState.editorState,
        checkResult,
        accordionKeys: communicationsState.accordionKeys,
        uppderaccordionKeys: communicationsState.uppderaccordionKeys,
        upperThread: communicationsState.upperThread,
        thread: communicationsState.thread,
        handleLoadMessages,
        onDeleteSingleMessage,
        onFileChange,
        handleClickSave
    };
}

export default useCommunications;
