import { useEffect, useRef, type MouseEvent } from 'react';
import { Dispatch } from 'react';
import { SetStateAction } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Embed from '@editorjs/embed';
import ImageTool from '@editorjs/image';
import Table from '@editorjs/table';
import InlineCode from '@editorjs/inline-code';
import Delimiter from '@editorjs/delimiter';
import CodeTool from '@editorjs/code';
import Underline from '@editorjs/underline';
import ColorPlugin from 'editorjs-text-color-plugin';
import TextAlign from '@canburaks/text-align-editorjs';

import { uploadImage, uploadDocumentThreadImage } from '../../api';

export interface EditorStateData {
    time?: number;
    blocks?: unknown[];
}

export interface EditorSimpleProps {
    holder: string;
    editorState?: EditorStateData | null;
    readOnly?: boolean;
    defaultHeight?: number;
    imageEnable?: boolean;
    thread?: { _id: string; student_id: { _id: string } };
    handleEditorChange?: (outputData: EditorStateData) => void;
}

const EditorSimple = (props: EditorSimpleProps) => {
    const ejInstance = useRef<EditorJS | null>(null);
    let editor: EditorJS | undefined;

    const configuration: Record<string, unknown> = {
        holder: `${props.holder}`,
        logLevel: 'ERROR',
        data: props.editorState,
        onReady: () => {
            ejInstance.current = editor ?? null;
        },
        onChange: async (api: {
            saver: { save: () => Promise<EditorStateData> };
        }) => {
            if (!props.readOnly && props.handleEditorChange) {
                api.saver.save().then((outputData) => {
                    props.handleEditorChange!(outputData);
                });
            }
        },
        placeholder:
            'Please organize your questions and expected help concretely.',
        readOnly: props.readOnly,
        minHeight: props.defaultHeight
    };

    let tools: Record<string, unknown> = {
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
        table: {
            class: Table,
            inlineToolbar: true,
            config: {
                rows: 2,
                cols: 3
            }
        },
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
                type: 'text'
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
        inlineCode: {
            class: InlineCode
        }
    };

    if (props.imageEnable) {
        tools = {
            ...tools,
            image: {
                class: ImageTool,
                config: {
                    uploader: {
                        async uploadByFile(file: File) {
                            const formData = new FormData();
                            formData.append('file', file);
                            let res: { data: { data: string } };
                            if (props.thread) {
                                res = await uploadDocumentThreadImage(
                                    props.thread._id.toString(),
                                    props.thread.student_id._id.toString(),
                                    formData
                                );
                            } else {
                                res = await uploadImage(formData);
                            }
                            return {
                                success: 1,
                                file: { url: res.data.data }
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
            }
        };
    }

    const fullConfig = {
        ...configuration,
        tools
    };

    useEffect(() => {
        const initEditor = () => {
            editor = new EditorJS(
                fullConfig as Parameters<typeof EditorJS>[0]
            ) as EditorJS;
        };
        if (!ejInstance.current) {
            initEditor();
        }
        return () => {
            if (ejInstance.current) {
                ejInstance.current.destroy();
                ejInstance.current = null;
            }
        };
    }, [props.editorState]);

    return <div id={`${props.holder}`} />;
};

export default EditorSimple;
