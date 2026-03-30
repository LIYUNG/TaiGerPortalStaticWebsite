import { MouseEvent } from 'react';
import { Button, Tooltip, Card } from '@mui/material';
import { useTranslation } from 'react-i18next';

import EditorSimple from '@components/EditorJs/EditorSimple';
import { OutputData } from '@editorjs/editorjs';

interface NotesEditorProps {
    editorState: OutputData;
    handleEditorChange: (content: OutputData) => void;
    notes_id: string;
    readOnly?: boolean;
    thread?: unknown;
    buttonDisabled: boolean;
    handleClickSave: (
        e: MouseEvent<HTMLButtonElement>,
        editorState: OutputData
    ) => void;
}

const NotesEditor = ({
    editorState,
    handleEditorChange,
    notes_id,
    readOnly,
    buttonDisabled,
    handleClickSave
}: NotesEditorProps) => {
    const { t } = useTranslation();
    return (
        <>
            <Card sx={{ padding: 4, mb: 2, minHeight: 200 }}>
                <EditorSimple
                    defaultHeight={0}
                    editorState={editorState}
                    handleEditorChange={handleEditorChange}
                    holder={`${notes_id}`}
                    readOnly={readOnly}
                />
            </Card>
            {!readOnly ? (
                buttonDisabled ? (
                    <Tooltip title="Please write some text to improve the communication and understanding.">
                        <span>
                            <Button
                                disabled={true}
                                fullWidth
                                variant="outlined"
                            >
                                {t('Save', { ns: 'common' })}
                            </Button>
                        </span>
                    </Tooltip>
                ) : (
                    <Tooltip title="Please write some text to improve the communication and understanding.">
                        <span>
                            <Button
                                color="primary"
                                fullWidth
                                onClick={(e) => handleClickSave(e, editorState)}
                                variant="contained"
                            >
                                {t('Save', { ns: 'common' })}
                            </Button>
                        </span>
                    </Tooltip>
                )
            ) : null}
        </>
    );
};

export default NotesEditor;
