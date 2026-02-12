import React, { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import InlineCode from '@editorjs/inline-code';
import Delimiter from '@editorjs/delimiter';
import CodeTool from '@editorjs/code';
import Underline from '@editorjs/underline';
import ColorPlugin from 'editorjs-text-color-plugin';
import TextAlign from '@canburaks/text-align-editorjs';

import type { EditorSimpleProps } from './EditorSimple';

export type EditorNoteProps = Pick<
    EditorSimpleProps,
    | 'holder'
    | 'editorState'
    | 'readOnly'
    | 'defaultHeight'
    | 'handleEditorChange'
>;

const EditorNote = (props: EditorNoteProps) => {
    const { holder, editorState, readOnly, defaultHeight, handleEditorChange } =
        props;
    const ejInstance = useRef<EditorJS | null>(null);
    let editor: EditorJS;

    const initEditor = () => {
        editor = new EditorJS({
            holder: `${holder}`,
            logLevel: 'ERROR',
            data: editorState,
            onReady: () => {
                ejInstance.current = editor ?? null;
            },
            onChange: async (api: {
                saver: { save: () => Promise<OutputData> };
            }) => {
                if (!readOnly && handleEditorChange) {
                    api.saver.save().then((outputData) => {
                        handleEditorChange?.(outputData);
                    });
                }
            },
            placeholder:
                'Please organize your questions and expected help concretely.',
            readOnly: readOnly,
            minHeight: defaultHeight,
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

    return <div id={`${holder}`} />;
};

export default EditorNote;
