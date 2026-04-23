import React, { useEffect, useState } from 'react';
import { Navigate, Link as LinkDom } from 'react-router-dom';
import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    Link,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { is_TaiGer_AdminAgent, is_TaiGer_role } from '@taiger-common/core';

import DocumentsListItems from './DocumentsListItems';
import DocumentsListItemsEditor from './DocumentsListItemsEditor';
import { valid_categories, documentation_categories } from '@utils/contants';
import ErrorPage from '../Utils/ErrorPage';
import ModalMain from '../Utils/ModalHandler/ModalMain';

import {
    getAllDocumentations,
    createDocumentation,
    deleteDocumentation
} from '@/api';
import { TabTitle } from '../Utils/TabTitle';
import DEMO from '@store/constant';
import { useAuth } from '@components/AuthProvider';
import Loading from '@components/Loading/Loading';
import { useTranslation } from 'react-i18next';
import { appConfig } from '../../config';
import type { IDocumentationWithId, IUser } from '@taiger-common/model';
import type { OutputData } from '@editorjs/editorjs';
import type { SelectChangeEvent } from '@mui/material';

interface DocCreatePageState {
    error: string;
    isLoaded: boolean;
    data: null;
    success: boolean;
    documentlists: IDocumentationWithId[];
    doc_id_toBeDelete: string;
    doc_title_toBeDelete: string;
    doc_title: string;
    category: string;
    SetDeleteDocModel: boolean;
    isEdit: boolean;
    expand: boolean;
    editorState: OutputData | null;
    res_status: number;
    res_modal_message: string;
    res_modal_status: number;
    [key: string]: unknown;
}

interface DocCreatePageProps {
    item?: string;
    role?: string;
}

const DocCreatePage = (props: DocCreatePageProps) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [DocCreatePageState, setDocCreatePage] = useState<DocCreatePageState>({
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
        res_modal_message: '',
        res_modal_status: 0
    });

    useEffect(() => {
        getAllDocumentations().then(
            (resp) => {
                const { data, success } = resp.data;
                const { status } = resp;
                if (success) {
                    setDocCreatePage((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        documentlists: (data ?? []) as IDocumentationWithId[],
                        success: success,
                        res_status: status
                    }));
                } else {
                    setDocCreatePage((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_status: status
                    }));
                }
            },
            (error: unknown) => {
                setDocCreatePage((prevState) => ({
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
        setDocCreatePage((prevState) => ({
            ...prevState,
            doc_title: value
        }));
    };

    const handleClick = () => {
        setDocCreatePage((prevState) => ({
            ...prevState,
            isEdit: !DocCreatePageState.isEdit
        }));
    };

    const handleChange_category = (e: SelectChangeEvent<unknown>) => {
        e.preventDefault();
        const value = e.target.value as string;
        setDocCreatePage((prevState) => ({
            ...prevState,
            category: value
        }));
    };

    const handleDeleteDoc = () => {
        deleteDocumentation(DocCreatePageState.doc_id_toBeDelete).then(
            (resp) => {
                const { success } = resp.data;
                const { status } = resp;
                if (success) {
                    const documentlists_temp = [
                        ...DocCreatePageState.documentlists
                    ];
                    const to_be_delete_doc_idx = documentlists_temp.findIndex(
                        (doc) =>
                            doc._id.toString() ===
                            DocCreatePageState.doc_id_toBeDelete
                    );
                    if (to_be_delete_doc_idx > -1) {
                        // only splice array when item is found
                        documentlists_temp.splice(to_be_delete_doc_idx, 1); // 2nd parameter means remove one item only
                    }
                    setDocCreatePage((prevState) => ({
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
                    setDocCreatePage((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_message: message ?? '',
                        res_modal_status: status
                    }));
                }
            },
            (error: unknown) => {
                setDocCreatePage((prevState) => ({
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
        setDocCreatePage((prevState) => ({
            ...prevState,
            doc_id_toBeDelete: doc._id,
            doc_title_toBeDelete: doc.title,
            SetDeleteDocModel: true
        }));
    };

    const closeDeleteDocModalWindow = () => {
        setDocCreatePage((prevState) => ({
            ...prevState,
            SetDeleteDocModel: false
        }));
    };

    const handleClickEditToggle = () => {
        setDocCreatePage((prevState) => ({
            ...prevState,
            isEdit: !DocCreatePageState.isEdit
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
            title: DocCreatePageState.doc_title,
            category: DocCreatePageState.category,
            prop: props.item,
            text: message
        };
        createDocumentation(msg).then(
            (resp) => {
                const { success, data } = resp.data;
                const { status } = resp;
                if (success) {
                    const documentlists_temp = [
                        ...DocCreatePageState.documentlists
                    ];
                    if (data) {
                        documentlists_temp.push(data as IDocumentationWithId);
                    }
                    setDocCreatePage((prevState) => ({
                        ...prevState,
                        success,
                        documentlists: documentlists_temp,
                        editorState: null,
                        isEdit: !DocCreatePageState.isEdit,
                        isLoaded: true,
                        res_modal_status: status
                    }));
                } else {
                    const { message } = resp.data;
                    setDocCreatePage((prevState) => ({
                        ...prevState,
                        isLoaded: true,
                        res_modal_message: message ?? '',
                        res_modal_status: status
                    }));
                }
            },
            (error: unknown) => {
                setDocCreatePage((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    error: String(error),
                    res_modal_status: 500,
                    res_modal_message: ''
                }));
            }
        );
        setDocCreatePage((prevState) => ({
            ...prevState,
            in_edit_mode: false
        }));
    };

    const ConfirmError = () => {
        setDocCreatePage((prevState) => ({
            ...prevState,
            res_modal_status: 0,
            res_modal_message: ''
        }));
    };

    if (!is_TaiGer_role(user as IUser)) {
        return <Navigate to={`${DEMO.DASHBOARD_LINK}`} />;
    }

    const { res_status, isLoaded, res_modal_status, res_modal_message } =
        DocCreatePageState;

    if (!isLoaded) {
        return <Loading />;
    }

    if (res_status >= 400) {
        return <ErrorPage res_status={res_status} />;
    }

    const documentlist_key = Object.keys(documentation_categories);

    const document_list = (cat: string) => {
        const sections: Record<string, IDocumentationWithId[]> = {};
        sections[`${cat}`] = (
            DocCreatePageState.documentlists as IDocumentationWithId[]
        ).filter((document: IDocumentationWithId) => document.category === cat);
        return sections[`${cat}`].map(
            (document: IDocumentationWithId, i: number) => (
                <DocumentsListItems
                    document={document as { _id: string; title: string }}
                    idx={i}
                    key={i}
                    openDeleteDocModalWindow={openDeleteDocModalWindow}
                    path="/docs/search"
                />
            )
        );
    };
    TabTitle('Docs Database');
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
                    {t('Docs Database', { ns: 'common' })}
                </Typography>
                <Typography color="text.primary">
                    {t('Public Docs Database', { ns: 'common' })}
                </Typography>
            </Breadcrumbs>

            {DocCreatePageState.isEdit ? (
                <Card sx={{ mt: 2, p: 4 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel id="select-target-group">
                            {t('Select Target Group')}
                        </InputLabel>
                        <Select
                            id="decided"
                            label="Select target group"
                            labelId="decided"
                            name="decided"
                            onChange={(e) => handleChange_category(e)}
                        >
                            <MenuItem value="">
                                Select Document Category
                            </MenuItem>
                            {valid_categories.map((cat, i) => (
                                <MenuItem key={i} value={cat.key}>
                                    {cat.value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        defaultValue=""
                        id="doc_title"
                        label="title"
                        onChange={(e) => handleChange_doc_title(e)}
                        placeholder="title"
                        size="small"
                        sx={{ mt: 1 }}
                        type="text"
                    />
                    <DocumentsListItemsEditor
                        category={DocCreatePageState.category}
                        doc_title={DocCreatePageState.doc_title}
                        editorState={DocCreatePageState.editorState}
                        handleClickEditToggle={handleClickEditToggle}
                        handleClickSave={handleClickSave}
                    />
                </Card>
            ) : (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {documentlist_key.map((catego, i) => (
                        <Grid item key={i} lg={4} md={6} xl={3} xs={12}>
                            <Card>
                                <Typography sx={{ m: 2 }} variant="h6">
                                    {documentation_categories[catego as keyof typeof documentation_categories]}
                                </Typography>
                                {document_list(catego)}
                            </Card>
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        {is_TaiGer_AdminAgent(user as IUser) ? (
                            <Button
                                color="primary"
                                onClick={handleClick}
                                variant="contained"
                            >
                                {t('Add', { ns: 'common' })}
                            </Button>
                        ) : null}
                    </Grid>
                </Grid>
            )}
            <Dialog
                onClose={closeDeleteDocModalWindow}
                open={DocCreatePageState.SetDeleteDocModel}
            >
                <DialogTitle>{t('Warning', { ns: 'common' })}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to delete documentation of title:{' '}
                        {DocCreatePageState.doc_title_toBeDelete}?
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

export default DocCreatePage;
