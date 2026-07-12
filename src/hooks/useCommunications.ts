import { useEffect, useState } from 'react';
import type { IUser } from '@taiger-common/model';
import { is_TaiGer_role } from '@taiger-common/core';

import { useAuth } from '@components/AuthProvider';
import { readDOCX, readPDF, readXLSX } from '@pages/Utils/util_functions';
import {
    deleteAMessageInCommunicationThreadV2,
    loadCommunicationThread,
    postCommunicationThreadV2
} from '@/api';
import { useSnackBar } from '@contexts/use-snack-bar';
import { queryClient } from '@/api';
import { useMutation } from '@tanstack/react-query';
import { OutputData } from '@editorjs/editorjs';

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
        isLoadingOlder: false,
        res_modal_status: 0,
        res_modal_message: ''
    });
    const { setMessage, setSeverity, setOpenSnackbar } = useSnackBar();

    // The optimistic-message lifecycle (insert pending row -> confirm/rollback)
    // is handled in handleClickSave so it can await the send; the mutation just
    // surfaces the error toast.
    const { mutateAsync, isPending } = useMutation({
        mutationFn: postCommunicationThreadV2,
        onError: (error: Error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        }
    });

    // Which message is being deleted (for its per-row loading/dark overlay).
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
        null
    );
    const { mutate: mutateDelete, isPending: isDeleting } = useMutation({
        mutationFn: (vars: {
            student_id: string;
            communication_messageId: string;
        }) => deleteAMessageInCommunicationThreadV2(vars),
        onError: (error: Error) => {
            setSeverity('error');
            setMessage(error.message || 'An error occurred. Please try again.');
            setOpenSnackbar(true);
        },
        onSettled: () => setDeletingMessageId(null),
        onSuccess: (
            _data: unknown,
            variables: { student_id: string; communication_messageId: string }
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
                (message: unknown) =>
                    (
                        message as { _id?: { toString: () => string } }
                    )._id?.toString() === message_id
            );
            if (idx !== -1) {
                new_messages.splice(idx, 1);
            }
            const new_upper_messages = [...communicationsState.upperThread];
            const idx2 = new_upper_messages.findIndex(
                (message: unknown) =>
                    (
                        message as { _id?: { toString: () => string } }
                    )._id?.toString() === message_id
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
        const nextState = {
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
        };
        queueMicrotask(() => {
            setCommunicationsState((prevState) => ({
                ...prevState,
                ...nextState
            }));
        });
    }, [data, student]);

    const handleLoadMessages = (): void => {
        setCommunicationsState((prevState) => ({
            ...prevState,
            loadButtonDisabled: true,
            isLoadingOlder: true
        }));
        loadCommunicationThread(
            student._id?.toString() ?? '',
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
                        student: (respStudent ??
                            student) as typeof prevState.student,
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
                        loadButtonDisabled: respData.length === 0,
                        isLoadingOlder: false
                    }));
                } else {
                    setCommunicationsState((prevState) => ({
                        ...prevState,
                        isLoadingOlder: false
                    }));
                }
            },
            (error: unknown) => {
                setCommunicationsState((prevState) => ({
                    ...prevState,
                    error,
                    isLoadingOlder: false
                }));
            }
        );
    };

    const onDeleteSingleMessage = (message_id: string): void => {
        setDeletingMessageId(message_id);
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
            if (user == null || !is_TaiGer_role(user as IUser)) {
                setCommunicationsState((prevState) => ({
                    ...prevState,
                    files: Array.from(e.target.files ?? [])
                }));
                return;
            }
            const checkPromises = Array.from(e.target.files).map(
                (file: File) => {
                    const extension = file.name.split('.').pop()?.toLowerCase();
                    const studentName =
                        communicationsState.student?.firstname ?? '';

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
                        files: Array.from(e.target.files ?? [])
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

    // Returns the send promise so the composer can await it and commit/rollback
    // its draft (text + attachments) atomically. The sent message appears in the
    // list immediately as a "pending" row (loading overlay) and is replaced by
    // the real message on success, or removed on failure.
    const handleClickSave = async (
        e: React.MouseEvent,
        editorState: OutputData,
        // The draft's staged attachments, so the pending row shows them too
        // (they're already in S3, so they download/preview like a real message).
        files?: Array<{ name: string; path: string }>
    ): Promise<unknown> => {
        e.preventDefault();
        const message = JSON.stringify(editorState);
        const studentId = communicationsState.student._id?.toString() ?? '';
        const tempId = `pending-${Date.now()}`;

        // Optimistically insert the message as a pending row.
        const optimistic = {
            _id: tempId,
            message,
            user_id: user
                ? {
                      _id: user._id?.toString(),
                      firstname: user.firstname,
                      lastname: user.lastname,
                      pictureUrl: (user as { pictureUrl?: string }).pictureUrl
                  }
                : undefined,
            file: files ?? [],
            // So the pending row's attachment links resolve (Message builds the
            // download URL from student_id._id).
            student_id: { _id: studentId },
            createdAt: new Date(),
            pending: true
        };
        setCommunicationsState((prev) => ({
            ...prev,
            thread: [...prev.thread, optimistic],
            accordionKeys: [...prev.accordionKeys, prev.accordionKeys.length]
        }));

        const formData = new FormData();
        if (communicationsState.files) {
            communicationsState.files.forEach((file) => {
                formData.append('files', file);
            });
        }
        formData.append('message', message);

        try {
            const responseData = await mutateAsync({ studentId, formData });
            const data = (responseData as { data?: unknown[] })?.data ?? [];
            queryClient.invalidateQueries({
                queryKey: ['communications', studentId]
            });
            queryClient.invalidateQueries({
                queryKey: ['communications', 'my']
            });
            // The server moved the draft's staged files onto the message and
            // deleted the draft — refetch so the composer's attachment list clears.
            queryClient.invalidateQueries({
                queryKey: ['communications', studentId, 'draft']
            });
            // Replace the pending row with the confirmed message(s).
            setCommunicationsState((prev) => ({
                ...prev,
                editorState: {},
                count: prev.count + 1,
                thread: [
                    ...prev.thread.filter(
                        (m) => (m as { _id?: unknown })._id !== tempId
                    ),
                    ...data
                ],
                files: []
            }));
            return responseData;
        } catch (error) {
            // Remove the pending row; the composer rolls back text + attachments.
            setCommunicationsState((prev) => ({
                ...prev,
                thread: prev.thread.filter(
                    (m) => (m as { _id?: unknown })._id !== tempId
                )
            }));
            throw error;
        }
    };

    return {
        buttonDisabled: isPending,
        loadButtonDisabled: communicationsState.loadButtonDisabled,
        isLoadingOlder: communicationsState.isLoadingOlder,
        isDeleting,
        deletingMessageId,
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
