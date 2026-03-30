import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { is_TaiGer_role } from '@taiger-common/core';
import { useMutation } from '@tanstack/react-query';
import { OutputData } from '@editorjs/editorjs';

import SingleDocEdit from './SingleDocEdit';
import ErrorPage from '../Utils/ErrorPage';

import { updateInternalDocumentation, getInternalDocumentation } from '@/api';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import DocPageView from './DocPageView';

/** Props reserved for parent; documentation_id comes from useParams */
export type SingleDocProps = Record<string, never>;

interface SingleInternalDocState {
    error: string;
    isLoaded: boolean;
    success: boolean;
    document_title: string;
    editorState: OutputData | null;
    isEdit: boolean;
    internal: boolean;
    res_status: number;
    category: string;
    author: string;
}

const SingleDoc = () => {
    const { documentation_id } = useParams();
    const { user } = useAuth();
    const [singleInternalDocState, setSingleInternalDocState] =
        useState<SingleInternalDocState>({
            error: '',
            isLoaded: false,
            success: false,
            document_title: '',
            editorState: null,
            isEdit: false,
            internal: false,
            res_status: 0,
            category: '',
            author: ''
        });

    useEffect(() => {
        getInternalDocumentation(documentation_id).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (!data) {
                    setSingleInternalDocState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_status: 404
                    }));
                    return;
                }
                if (success) {
                    let initialEditorState: OutputData | null = null;
                    const author = data.author ?? '';
                    if (data.text) {
                        initialEditorState = JSON.parse(data.text);
                    } else {
                        initialEditorState = {} as OutputData;
                    }
                    setSingleInternalDocState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        document_title: data.title ?? '',
                        category: data.category ?? '',
                        internal: data.internal ?? false,
                        editorState: initialEditorState,
                        author,
                        success: success,
                        res_status: status
                    }));
                } else {
                    setSingleInternalDocState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_status: status
                    }));
                }
            },
            (error: unknown) => {
                setSingleInternalDocState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: (error as Error).message ?? ''
                }));
            }
        );
    }, [documentation_id]);

    const handleClickEditToggle = () => {
        setSingleInternalDocState((prevState) => ({
            ...prevState,
            isEdit: !singleInternalDocState.isEdit
        }));
    };

    type UpdateInternalDocPayload = {
        msg: {
            title: string;
            category: string;
            text: string;
        };
        editorState: unknown;
    };

    const { mutate: updateInternalDocMutation } = useMutation({
        mutationFn: (payload: UpdateInternalDocPayload) =>
            updateInternalDocumentation(documentation_id, payload.msg),
        onSuccess: (resp, payload) => {
            const { success, data } = resp.data;
            const { status } = resp;
            if (success) {
                setSingleInternalDocState((prevState) => ({
                    ...prevState,
                    success,
                    document_title: data.title ?? '',
                    editorState: payload.editorState as OutputData | null,
                    isEdit: !prevState.isEdit,
                    author: data.author ?? '',
                    isLoaded: true,
                    res_status: status
                }));
            } else {
                setSingleInternalDocState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    res_status: status
                }));
            }
        },
        onError: (error: unknown) => {
            setSingleInternalDocState((prevState) => ({
                ...prevState,
                error: (error as Error).message ?? ''
            }));
        }
    });

    const handleClickSave = (
        e: React.MouseEvent<HTMLElement>,
        category: string,
        doc_title: string,
        editorState: unknown
    ) => {
        e.preventDefault();
        const message = JSON.stringify(editorState);
        const msg = {
            title: doc_title,
            category,
            text: message
        };

        updateInternalDocMutation({ msg, editorState });

        setSingleInternalDocState((prevState) => ({
            ...prevState,
            in_edit_mode: false
        }));
    };

    if (!is_TaiGer_role(user)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { res_status, editorState, isLoaded } = singleInternalDocState;

    if (!isLoaded && !editorState) {
        return <Loading />;
    }

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    if (singleInternalDocState.isEdit) {
        return (
            <SingleDocEdit
                category={singleInternalDocState.category}
                document_title={singleInternalDocState.document_title}
                editorState={singleInternalDocState.editorState}
                handleClickEditToggle={handleClickEditToggle}
                handleClickSave={handleClickSave}
                internal={singleInternalDocState.internal}
            />
        );
    } else {
        return (
            <DocPageView
                category={singleInternalDocState.category}
                author={singleInternalDocState.author}
                editorState={singleInternalDocState.editorState ?? ({} as OutputData)}
                handleClickEditToggle={handleClickEditToggle}
                handleClickSave={() => {}}
            />
        );
    }
};
export default SingleDoc;
