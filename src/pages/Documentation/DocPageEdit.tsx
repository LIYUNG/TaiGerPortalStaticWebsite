import React, { useEffect, useState } from 'react';
import DocumentsListItemsEditor from './DocumentsListItemsEditor';
import { Card } from '@mui/material';
import { OutputData } from '@editorjs/editorjs';

export interface DocPageEditProps {
    document_title: string;
    category: string;
    editorState: OutputData;
    handleClickEditToggle: () => void;
    handleClickSave: (
        e: React.MouseEvent,
        docTitle: string,
        editorState: OutputData
    ) => void;
}

const DocPageEdit = (props: DocPageEditProps) => {
    const [docPageEditState, setDocPageEditState] = useState({
        doc_title: props.document_title
    });

    useEffect(() => {
        const docTitle = props.document_title;
        queueMicrotask(() => {
            setDocPageEditState((prevState) => ({
                ...prevState,
                doc_title: docTitle
            }));
        });
    }, [props.document_title]);

    const handleClickSave = (
        e: React.MouseEvent,
        editorState: OutputData
    ) => {
        e.preventDefault();
        props.handleClickSave(e, docPageEditState.doc_title, editorState);
    };
    return (
        <Card sx={{ px: 8, py: 2, mt: 2 }}>
            <DocumentsListItemsEditor
                category={props.category}
                doc_title="not_used"
                editorState={props.editorState}
                handleClickEditToggle={props.handleClickEditToggle}
                handleClickSave={handleClickSave}
            />
        </Card>
    );
};
export default DocPageEdit;
