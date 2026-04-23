import React, { useEffect, useState } from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as LinkDom, useParams } from 'react-router-dom';
import { OutputData } from '@editorjs/editorjs';

import SingleDocEdit from './SingleDocEdit';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { getDocumentation, updateDocumentation } from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import Loading from '@components/Loading/Loading';
import { appConfig } from '../../config';
import DEMO from '@store/constant';
import { documentation_categories } from '@utils/contants';
import DocPageView from './DocPageView';

interface SingleDocProps {
    item?: string;
}

interface SingleDocState {
    error: string;
    author: string;
    isLoaded: boolean;
    success: boolean;
    editorState: OutputData | null;
    isEdit: boolean;
    res_status: number;
    res_modal_message: string;
    res_modal_status: number;
    document_title: string;
    category: string;
}

const SingleDoc = (props: SingleDocProps) => {
    const { documentation_id } = useParams();
    const [singleDocState, setSingleDocState] = useState<SingleDocState>({
        error: '',
        author: '',
        isLoaded: false,
        success: false,
        editorState: null,
        isEdit: false,
        res_status: 0,
        res_modal_message: '',
        res_modal_status: 0,
        document_title: '',
        category: ''
    });
    useEffect(() => {
        getDocumentation(documentation_id).then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (!data) {
                    setSingleDocState((prevState) => ({
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
                    setSingleDocState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        document_title: data.title ?? '',
                        category: data.category ?? '',
                        editorState: initialEditorState,
                        author,
                        success: success,
                        res_status: status
                    }));
                } else {
                    setSingleDocState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_status: status
                    }));
                }
            },
            (error: unknown) => {
                setSingleDocState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: (error as Error).message ?? '',
                    res_status: 500
                }));
            }
        );
    }, [documentation_id]);

    const handleClickEditToggle = () => {
        setSingleDocState((prevState) => ({
            ...prevState,
            isEdit: !singleDocState.isEdit
        }));
    };
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
            prop: props.item,
            text: message
        };
        updateDocumentation(documentation_id, msg).then(
            (resp) => {
                const { success, data } = resp.data;
                const { status } = resp;
                if (success) {
                    setSingleDocState((prevState) => ({
                        ...prevState,
                        success,
                        document_title: data.title ?? '',
                        editorState: editorState as OutputData | null,
                        isEdit: !prevState.isEdit,
                        author: data.author ?? '',
                        isLoaded: true,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setSingleDocState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_message: message,
                        res_modal_status: status
                    }));
                }
            },
            (error: unknown) => {
                setSingleDocState((prevState) => ({
                    ...prevState,
                    error: (error as Error).message ?? ''
                }));
            }
        );
        setSingleDocState((prevState) => ({
            ...prevState,
            isEdit: false
        }));
    };

    const ConfirmError = () => {
        setSingleDocState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    const {
        res_status,
        editorState,
        isLoaded,
        res_modal_status,
        res_modal_message
    } = singleDocState;

    if (!isLoaded && !editorState) {
        return <Loading />;
    }

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }
    TabTitle(`Doc: ${singleDocState.document_title}`);
    if (singleDocState.isEdit) {
        return (
            <>
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
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.DOCS_ROOT_LINK(singleDocState.category)}`}
                        underline="hover"
                    >
                        {documentation_categories[singleDocState.category as keyof typeof documentation_categories]}
                    </Link>
                    <Typography color="text.primary">
                        {singleDocState.document_title}
                    </Typography>
                </Breadcrumbs>
                <SingleDocEdit
                    category={singleDocState.category}
                    document_title={singleDocState.document_title}
                    editorState={singleDocState.editorState}
                    handleClickEditToggle={handleClickEditToggle}
                    handleClickSave={handleClickSave}
                />
            </>
        );
    } else {
        return (
            <>
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
                    <Link
                        color="inherit"
                        component={LinkDom}
                        to={`${DEMO.DOCS_ROOT_LINK(singleDocState.category)}`}
                        underline="hover"
                    >
                        {
                            documentation_categories[
                                singleDocState.category as keyof typeof documentation_categories
                            ]
                        }
                    </Link>
                    <Typography color="text.primary">
                        {singleDocState.document_title}
                    </Typography>
                </Breadcrumbs>
                <DocPageView
                    author={singleDocState.author}
                    category={singleDocState.category}
                    editorState={
                        singleDocState.editorState ?? ({} as OutputData)
                    }
                    handleClickEditToggle={handleClickEditToggle}
                    handleClickSave={() => {}}
                />
            </>
        );
    }
};
export default SingleDoc;
