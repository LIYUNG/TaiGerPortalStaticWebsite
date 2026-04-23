import React, { useEffect, useState } from 'react';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import {
    Box,
    Card,
    Breadcrumbs,
    Button,
    Grid,
    Link,
    Typography,
    FormControl,
    Select,
    MenuItem,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { is_TaiGer_AdminAgent, is_TaiGer_role } from '@taiger-common/core';

import DocumentsListItems from './DocumentsListItems';
import DocumentsListItemsEditor from './DocumentsListItemsEditor';
import {
    valid_internal_categories,
    internal_documentation_categories
} from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import {
    getAllInternalDocumentations,
    createInternalDocumentation,
    deleteInternalDocumentation
} from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import ModalMain from '../Utils/ModalHandler/ModalMain';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { appConfig } from '../../config';
import type { IInternaldocWithId, IUser } from '@taiger-common/model';
import type { OutputData } from '@editorjs/editorjs';
import type { SelectChangeEvent } from '@mui/material';

interface InternalDocCreatePageState {
    error: string;
    isLoaded: boolean;
    data: null;
    success: boolean;
    documentlists: IInternaldocWithId[];
    doc_id_toBeDelete: string;
    doc_title_toBeDelete: string;
    doc_title: string;
    category: string;
    SetDeleteDocModel: boolean;
    isEdit: boolean;
    expand: boolean;
    editorState: OutputData | null;
    res_status: number;
    res_modal_status: number;
    res_modal_message: string;
    [key: string]: unknown;
}

interface InternalDocCreatePageProps {
    item?: string;
    role?: string;
}

const InternalDocCreatePage = (props: InternalDocCreatePageProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [internalDocCreatePageState, setInternalDocCreatePageState] =
        useState<InternalDocCreatePageState>({
            error: '',
            isLoaded: false,
            data: null,
            success: false,
            documentlists: [],
            doc_id_toBeDelete: '',
            doc_title_toBeDelete: '',
            doc_title: '',
            category: '',
            SetDeleteDocModel: false,
            isEdit: false,
            expand: true,
            editorState: null,
            res_status: 0,
            res_modal_status: 0,
            res_modal_message: ''
        });

    useEffect(() => {
        getAllInternalDocumentations().then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    setInternalDocCreatePageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        documentlists: (data ?? []) as IInternaldocWithId[],
                        success: success,
                        res_status: status
                    }));
                } else {
                    setInternalDocCreatePageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_status: status
                    }));
                }
            },
            (error: unknown) => {
                setInternalDocCreatePageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: String(error),
                    res_status: 500
                }));
            }
        );
    }, []);

    const handleChange_doc_title = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;
        setInternalDocCreatePageState((prevState) => ({
            ...prevState,
            doc_title: value
        }));
    };

    const handleChange_category = (e: SelectChangeEvent<unknown>) => {
        e.preventDefault();
        const value = e.target.value as string;
        setInternalDocCreatePageState((prevState) => ({
            ...prevState,
            category: value
        }));
    };

    const handleDeleteDoc = () => {
        deleteInternalDocumentation(
            internalDocCreatePageState.doc_id_toBeDelete
        ).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    const documentlists_temp = [
                        ...internalDocCreatePageState.documentlists
                    ];
                    const to_be_delete_doc_idx = documentlists_temp.findIndex(
                        (doc) =>
                            doc._id.toString() ===
                            internalDocCreatePageState.doc_id_toBeDelete
                    );
                    if (to_be_delete_doc_idx > -1) {
                        // only splice array when item is found
                        documentlists_temp.splice(to_be_delete_doc_idx, 1); // 2nd parameter means remove one item only
                    }
                    setInternalDocCreatePageState((prevState) => ({
                        ...prevState,
                        success,
                        documentlists: documentlists_temp,
                        SetDeleteDocModel: false,
                        isEdit: false,
                        isLoaded: true,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setInternalDocCreatePageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_status: status,
                        res_modal_message: message ?? ''
                    }));
                }
            },
            (error: unknown) => {
                setInternalDocCreatePageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: String(error),
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
    };
    const openDeleteDocModalWindow = (doc: { _id: string; title: string }) => {
        setInternalDocCreatePageState((prevState) => ({
            ...prevState,
            doc_id_toBeDelete: doc._id,
            doc_title_toBeDelete: doc.title,
            SetDeleteDocModel: true
        }));
    };

    const closeDeleteDocModalWindow = () => {
        setInternalDocCreatePageState((prevState) => ({
            ...prevState,
            SetDeleteDocModel: false
        }));
    };

    const handleClickEditToggle = () => {
        setInternalDocCreatePageState((prevState) => ({
            ...prevState,
            isEdit: !internalDocCreatePageState.isEdit
        }));
    };

    const handleClickSave = (
        e: React.MouseEvent,
        editorState: OutputData
    ) => {
        e.preventDefault();
        // Editorjs. editorState is in JSON form
        const message = JSON.stringify(editorState);
        const msg = {
            title: internalDocCreatePageState.doc_title,
            category: internalDocCreatePageState.category,
            prop: props.item,
            text: message
        };
        createInternalDocumentation(msg).then(
            (resp) => {
                const { success, data } = resp.data;
                const { status } = resp;
                if (success) {
                    const documentlists_temp = [
                        ...internalDocCreatePageState.documentlists
                    ];
                    if (data) {
                        documentlists_temp.push(data as IInternaldocWithId);
                    }
                    setInternalDocCreatePageState((prevState) => ({
                        ...prevState,
                        success,
                        documentlists: documentlists_temp,
                        editorState: null,
                        isEdit: !internalDocCreatePageState.isEdit,
                        isLoaded: true,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setInternalDocCreatePageState((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_status: status,
                        res_modal_message: message ?? ''
                    }));
                }
            },
            (error: unknown) => {
                setInternalDocCreatePageState((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: String(error),
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
        setInternalDocCreatePageState((prevState) => ({
            ...prevState,
            in_edit_mode: false
        }));
    };

    const ConfirmError = () => {
        setInternalDocCreatePageState((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };
    if (!is_TaiGer_role(user as IUser)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { res_status, res_modal_status, res_modal_message, isLoaded } =
        internalDocCreatePageState;

    if (!isLoaded) {
        return <Loading />;
    }

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    const documentlist_key = Object.keys(internal_documentation_categories);

    const document_list = (cat: string) => {
        const sections: Record<string, IInternaldocWithId[]> = {};
        sections[`${cat}`] = (
            internalDocCreatePageState.documentlists as IInternaldocWithId[]
        ).filter((document: IInternaldocWithId) => document.category === cat);
        return sections[`${cat}`].map(
            (document: IInternaldocWithId, i: number) => (
                <DocumentsListItems
                    document={document as { _id: string; title: string }}
                    idx={i}
                    key={i}
                    openDeleteDocModalWindow={openDeleteDocModalWindow}
                    path="/docs/internal/search"
                />
            )
        );
    };
    TabTitle(t('Internal Docs Database', { ns: 'common' }));
    return (
        <Box>
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
                    {t('Docs Database', { ns: 'common' })}
                </Typography>
                <Typography color="text.primary">
                    {t('Internal Docs Database', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Card>
                        {internalDocCreatePageState.isEdit ? (
                            <Box sx={{ p: 1 }}>
                                <FormControl fullWidth>
                                    <Select
                                        id="category"
                                        labelId="category"
                                        name="category"
                                        onChange={(e) =>
                                            handleChange_category(e)
                                        }
                                        size="small"
                                    >
                                        <MenuItem value="">
                                            Select Document Category
                                        </MenuItem>
                                        {valid_internal_categories.map(
                                            (cat, i) => (
                                                <MenuItem
                                                    key={i}
                                                    value={cat.key}
                                                >
                                                    {cat.value}
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>
                                <TextField
                                    defaultValue=""
                                    fullWidth
                                    onChange={(e) => handleChange_doc_title(e)}
                                    placeholder="Title"
                                    size="small"
                                    type="text"
                                />
                                <DocumentsListItemsEditor
                                    category={
                                        internalDocCreatePageState.category
                                    }
                                    doc_title={
                                        internalDocCreatePageState.doc_title
                                    }
                                    editorState={
                                        internalDocCreatePageState.editorState
                                    }
                                    handleClickEditToggle={
                                        handleClickEditToggle
                                    }
                                    handleClickSave={handleClickSave}
                                />
                            </Box>
                        ) : (
                            <>
                                {is_TaiGer_AdminAgent(user as IUser) ? (
                                    <Button
                                        color="primary"
                                        fullWidth
                                        onClick={handleClickEditToggle}
                                        size="small"
                                        startIcon={<AddIcon />}
                                        sx={{ m: 1 }}
                                        variant="contained"
                                    >
                                        {t('Add', { ns: 'common' })}
                                    </Button>
                                ) : null}
                                {documentlist_key.map((catego, i) => (
                                    <Box key={i} sx={{ p: 1 }}>
                                        <Typography variant="h6">
                                            -{' '}
                                            {
                                                internal_documentation_categories[
                                                    catego as keyof typeof internal_documentation_categories
                                                ]
                                            }
                                        </Typography>
                                        {document_list(catego)}
                                    </Box>
                                ))}
                            </>
                        )}
                    </Card>
                </Grid>
            </Grid>
            {res_modal_status >= 400 ? (
                <ModalMain
                    ConfirmError={ConfirmError}
                    res_modal_message={res_modal_message}
                    res_modal_status={res_modal_status}
                />
            ) : null}
            <Dialog
                onClose={closeDeleteDocModalWindow}
                open={internalDocCreatePageState.SetDeleteDocModel}
            >
                <DialogTitle>{t('Warning', { ns: 'common' })}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to delete documentation of title:{' '}
                        {internalDocCreatePageState.doc_title_toBeDelete}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button disabled={!isLoaded} onClick={handleDeleteDoc}>
                        {t('Yes', { ns: 'common' })}
                    </Button>
                    <Button onClick={closeDeleteDocModalWindow}>
                        {t('No', { ns: 'common' })}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InternalDocCreatePage;
