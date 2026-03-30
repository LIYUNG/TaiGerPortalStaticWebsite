import React, { useEffect, useState, type FormEvent } from 'react';
import {
    Box,
    Breadcrumbs,
    Card,
    CircularProgress,
    Link,
    Typography,
    Alert
} from '@mui/material';
import { Link as LinkDom, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    is_TaiGer_Admin,
    is_TaiGer_Agent,
    is_TaiGer_Editor,
    is_TaiGer_Student
} from '@taiger-common/core';
import type { IUser } from '@taiger-common/model';

import EditDownloadFiles from './EditDownloadFiles';
import { templatelist } from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { deleteTemplateFile, getTemplates, uploadtemplate } from '@/api';
import type { ApiPayload } from '@/api/types';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { appConfig } from '../../config';
import { useAuth } from '@components/AuthProvider';

interface TemplateItem {
    category_name: string;
}

interface DownloadPageState {
    error: string;
    file: File | string;
    isLoaded: boolean;
    areLoaded: Record<string, boolean>;
    templates: TemplateItem[] | null;
    success: boolean;
    res_status: number;
    res_modal_message: string;
    res_modal_status: number;
}

const DownloadPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [downloadPageState, setDownloadPageState] = useState<DownloadPageState>({
        error: '',
        file: '',
        isLoaded: false,
        areLoaded: {},
        templates: null,
        success: false,
        res_status: 0,
        res_modal_message: '',
        res_modal_status: 0
    });
    useEffect(() => {
        getTemplates().then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    const areLoaded_temp: Record<string, boolean> = {};
                    for (let i = 0; i < templatelist.length; i++) {
                        areLoaded_temp[templatelist[i].prop] = true;
                    }
                    setDownloadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true, //false to reload everything
                        templates: data
                            ? (data as TemplateItem[])
                            : null,
                        success: success,
                        res_status: status,
                        areLoaded: areLoaded_temp
                    }));
                } else {
                    setDownloadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_status: status,
                        areLoaded: {}
                    }));
                }
            },
            (error) => {
                setDownloadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: (error as Error).message ?? '',
                    res_status: 500
                }));
            }
        );
    }, []);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setDownloadPageState((prevState) => ({
            ...prevState,
            file: e.target.files![0]
        }));
    };

    const onSubmitFile = (e: FormEvent<HTMLFormElement>, category: string) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', downloadPageState.file as Blob);
        const areLoaded_temp = { ...downloadPageState.areLoaded };
        areLoaded_temp[category] = false;
        setDownloadPageState((prevState) => ({
            ...prevState,
            areLoaded: areLoaded_temp
        }));
        uploadtemplate(category, formData as unknown as ApiPayload).then(
            (resp) => {
                const { success } = resp.data;
                const respData = (resp.data as Record<string, unknown>)
                    .data as TemplateItem | undefined;
                const { status } = resp;
                if (success) {
                    areLoaded_temp[category] = true;
                    const templates_temp = [
                        ...(downloadPageState.templates ?? [])
                    ];
                    if (respData) {
                        templates_temp.push(respData);
                    }
                    setDownloadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        templates: templates_temp,
                        success: success,
                        areLoaded: areLoaded_temp,
                        res_modal_status: status
                    }));
                } else {
                    const message =
                        ((resp.data as Record<string, unknown>)
                            .message as string) ?? '';
                    setDownloadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        areLoaded: areLoaded_temp,
                        res_modal_status: status,
                        res_modal_message: message
                    }));
                }
            },
            (error) => {
                setDownloadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: (error as Error).message ?? '',
                    areLoaded: areLoaded_temp,
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const submitFile = (
        e: React.FormEvent<HTMLFormElement>,
        docName: unknown
    ) => {
        if (downloadPageState.file === '') {
            e.preventDefault();
            alert('Please select file');
        } else {
            e.preventDefault();
            onSubmitFile(e, docName as string);
        }
    };

    const onDeleteTemplateFile = (
        e: React.MouseEvent<HTMLElement>,
        category: string
    ) => {
        e.preventDefault();
        deleteTemplateFile(category).then(
            (resp) => {
                const { success } = resp.data;
                const respData = (resp.data as Record<string, unknown>)
                    .data as TemplateItem[] | undefined;
                const { status } = resp;
                //TODO: backend logic
                if (success) {
                    setDownloadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true, //false to reload everything
                        templates: respData ?? null,
                        success: success,
                        res_modal_status: status
                    }));
                } else {
                    const message =
                        ((resp.data as Record<string, unknown>)
                            .message as string) ?? '';
                    setDownloadPageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_status: status,
                        res_modal_message: message
                    }));
                }
            },
            (error) => {
                setDownloadPageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: (error as Error).message ?? '',
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };

    const ConfirmError = () => {
        setDownloadPageState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    if (
        !is_TaiGer_Admin(user as IUser) &&
        !is_TaiGer_Editor(user as IUser) &&
        !is_TaiGer_Agent(user as IUser) &&
        !is_TaiGer_Student(user as IUser)
    ) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }
    TabTitle(t('Download Center', { ns: 'common' }));
    const { res_status, isLoaded, res_modal_status, res_modal_message } =
        downloadPageState;

    if (!isLoaded && !downloadPageState.templates) {
        return <CircularProgress />;
    }

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

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
                    {t('Download Center', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Box>
                <Card>
                    <Alert severity="info">
                        {`This is ${appConfig.companyName} templates helping you finish your CV ML RL tasks. Please download, fill and upload them to the corresponding task.`}
                        <Link
                            color="inherit"
                            component={LinkDom}
                            to={`${DEMO.CV_ML_RL_DOCS_LINK}`}
                            underline="hover"
                        >
                            {t('Read More', { ns: 'common' })}
                        </Link>
                    </Alert>

                    <EditDownloadFiles
                        areLoaded={downloadPageState.areLoaded}
                        onDeleteTemplateFile={onDeleteTemplateFile}
                        onFileChange={onFileChange}
                        submitFile={submitFile}
                        templates={downloadPageState.templates ?? []}
                        user={user}
                    />
                </Card>
            </Box>
        </Box>
    );
};

export default DownloadPage;
