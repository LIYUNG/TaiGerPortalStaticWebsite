import React, { useEffect, useState } from 'react';
import {
    Typography,
    Card,
    FormControl,
    Select,
    MenuItem,
    TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import DocumentsListItemsEditor from './DocumentsListItemsEditor';
import {
    valid_categories,
    valid_internal_categories
} from '@utils/contants';

const SingleDocEdit = ({
    editorState,
    document_title,
    category,
    handleClickSave,
    handleClickEditToggle,
    internal
}) => {
    const { t } = useTranslation();
    const [singleDocEditState, setSingleDocEdit] = useState({
        doc_title: document_title,
        category: category
    });

    useEffect(() => {
        queueMicrotask(() => {
            setSingleDocEdit((prevState) => ({
                ...prevState,
                doc_title: document_title
            }));
        });
    }, [document_title]);

    const handleChange_category = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        let category_temp = { ...singleDocEditState.category };
        category_temp = e.target.value;
        setSingleDocEdit((prevState) => ({
            ...prevState,
            category: category_temp
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        let doc_title_temp = { ...singleDocEditState.doc_title };
        doc_title_temp = e.target.value;
        setSingleDocEdit((prevState) => ({
            ...prevState,
            doc_title: doc_title_temp
        }));
    };

    const handleClickSave2 = (
        e: React.MouseEvent<HTMLElement>,
        editorState: unknown
    ) => {
        e.preventDefault();
        handleClickSave(
            e,
            singleDocEditState.category,
            singleDocEditState.doc_title,
            editorState
        );
    };

    return (
        <Card sx={{ px: 8, py: 2, mt: 2 }}>
            {internal ? (
                <>
                    <Typography variant="body1">
                        {t('Category', { ns: 'common' })}:
                        <b>{t('Internal', { ns: 'common' })}</b>
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            id="category"
                            labelId="category"
                            name="category"
                            onChange={(e) => handleChange_category(e)}
                            size="small"
                            value={singleDocEditState.category || ''}
                        >
                            <MenuItem value="">
                                Select Document Category
                            </MenuItem>
                            {valid_internal_categories.map((cat, i) => (
                                <MenuItem key={i} value={cat.key}>
                                    {t(cat.value, { ns: 'comon' })}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </>
            ) : (
                <>
                    <Typography variant="body1">
                        Category: <b>Public</b>
                    </Typography>
                    <FormControl fullWidth>
                        <Select
                            id="category"
                            labelId="category"
                            name="category"
                            onChange={(e) => handleChange_category(e)}
                            size="small"
                            value={singleDocEditState.category || ''}
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
                </>
            )}
            <TextField
                defaultValue={document_title}
                fullWidth
                onChange={(e) => handleChange(e)}
                placeholder="Title"
                size="small"
                type="text"
            />
            <DocumentsListItemsEditor
                doc_title={singleDocEditState.doc_title}
                editorState={editorState}
                handleClickEditToggle={handleClickEditToggle}
                handleClickSave={handleClickSave2}
            />
        </Card>
    );
};
export default SingleDocEdit;
