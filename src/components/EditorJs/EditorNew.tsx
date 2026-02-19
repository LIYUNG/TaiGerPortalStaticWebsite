import React, { useEffect, useRef, useState } from 'react';
import { Box, Button } from '@mui/material';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Embed from '@editorjs/embed';
import ImageTool from '@editorjs/image';
import Table from '@editorjs/table';
import InlineCode from '@editorjs/inline-code';
import Delimiter from '@editorjs/delimiter';
import CodeTool from '@editorjs/code';
import Quote from '@editorjs/quote';
import Underline from '@editorjs/underline';
import AttachesTool from '@editorjs/attaches';
import Warning from '@editorjs/warning';
import ColorPlugin from 'editorjs-text-color-plugin';
import TextAlign from '@canburaks/text-align-editorjs';

import { uploadImage, uploadDocDocs } from '@/api';
import { useTranslation } from 'react-i18next';

export interface EditorNewProps {
    editorState?: OutputData | null;
    readOnly?: boolean;
    doc_title?: string;
    category: string;
    handleClickSave: (e: React.MouseEvent, editorState: OutputData) => void;
    handleClickEditToggle: (e: React.MouseEvent) => void;
}

const EditorNew = (props: EditorNewProps) => {
    const { t } = useTranslation();
    const ejInstance = useRef<EditorJS | null>(null);
    const [editorState, setEditorState] = useState<OutputData>(
        props.editorState ?? { time: 0, blocks: [] }
    );
    const [contentReady, setContentready] = useState(true);
    let editor: EditorJS;

    const initEditor = () => {
        editor = new EditorJS({
            holder: 'editorjs',
            logLevel: 'ERROR',
            data: props.editorState,
            onReady: () => {
                ejInstance.current = editor ?? null;
            },
            onChange: async (api: {
                saver: { save: () => Promise<OutputData> };
            }) => {
                if (!props.readOnly) {
                    setContentready(false);
                    api.saver.save().then((outputData) => {
                        setEditorState(outputData);
                        setContentready(true);
                    });
                }
            },
            readOnly: props.readOnly,
            minHeight: 30,
            tools: {
                header: {
                    class: Header,
                    config: {
                        placeholder: 'Enter a header',
                        levels: [2, 3, 4, 5, 6],
                        defaultLevel: 3
                    },
                    inlineToolbar: true
                },
                list: {
                    class: List,
                    inlineToolbar: true
                },
                underline: Underline,
                code: CodeTool,
                Color: {
                    class: ColorPlugin,
                    config: {
                        colorCollections: [
                            '#000000',
                            '#FF0000',
                            '#00FF00',
                            '#0000FF',
                            '#999999',
                            '#00FFFF',
                            '#FF00FF',
                            '#800080',
                            '#FFF'
                        ],
                        type: 'text',
                        customPicker: true
                    }
                },
                Marker: {
                    class: ColorPlugin,
                    config: {
                        colorCollections: [
                            '#000000',
                            '#FF0000',
                            '#00FF00',
                            '#0000FF',
                            '#999999',
                            '#00FFFF',
                            '#FF00FF',
                            '#800080',
                            '#FFF'
                        ],
                        defaultColor: '#FFF',
                        type: 'marker'
                    }
                },
                textAlign: TextAlign,
                attaches: {
                    class: AttachesTool,
                    config: {
                        uploader: {
                            async uploadByFile(file: File) {
                                const formData = new FormData();
                                formData.append('file', file);
                                const res = await uploadDocDocs(formData);
                                const { url, title, extension, success } =
                                    res.data as {
                                        url: string;
                                        title: string;
                                        extension: string;
                                        success: boolean;
                                    };
                                if (success) {
                                    return {
                                        success: 1,
                                        file: {
                                            url,
                                            title,
                                            extension
                                        }
                                    };
                                }
                                alert(
                                    (res.data as { message?: string }).message
                                );
                            }
                        }
                    }
                },
                quote: Quote,
                table: {
                    class: Table,
                    inlineToolbar: true,
                    config: {
                        rows: 2,
                        cols: 3
                    }
                },
                image: {
                    class: ImageTool,
                    config: {
                        uploader: {
                            async uploadByFile(file: File) {
                                const formData = new FormData();
                                formData.append('file', file);
                                const res = await uploadImage(formData);
                                return {
                                    success: 1,
                                    file: {
                                        url: (res.data as { data: string }).data
                                    }
                                };
                            },
                            async uploadByUrl(url: string) {
                                return {
                                    success: 1,
                                    file: { url }
                                };
                            }
                        }
                    }
                },
                delimiter: Delimiter,
                embed: {
                    class: Embed,
                    inlineToolbar: false,
                    config: {
                        services: {
                            youtube: true,
                            coub: true
                        }
                    }
                },
                warning: Warning,
                inlineCode: {
                    class: InlineCode
                }
            }
        }) as EditorJS;
    };

    useEffect(() => {
        if (ejInstance.current === null) {
            initEditor();
        }
        return () => {
            ejInstance?.current?.destroy();
            ejInstance.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Box id="editorjs" />
            {props.readOnly ? null : (
                <>
                    <Button
                        color="primary"
                        disabled={
                            !contentReady ||
                            props.doc_title?.replace(/ /g, '').length === 0 ||
                            props.category === '' ||
                            !editorState.blocks ||
                            editorState.blocks.length === 0
                        }
                        onClick={(e) => props.handleClickSave(e, editorState)}
                        size="small"
                        sx={{ marginRight: 1 }}
                        variant="contained"
                    >
                        {t('Save', { ns: 'common' })}
                    </Button>
                    <Button
                        onClick={props.handleClickEditToggle}
                        size="small"
                        variant="outlined"
                    >
                        {t('Cancel', { ns: 'common' })}
                    </Button>
                </>
            )}
        </>
    );
};

export default EditorNew;
