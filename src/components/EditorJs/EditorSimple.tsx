import { useEffect, useRef } from 'react';
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

import { type ToolConfig, type OutputData } from '@editorjs/editorjs';
import { uploadImage, uploadDocumentThreadImage } from '@/api';

/**
 * Props for the low-level EditorJS wrapper.
 * Use this for read-only display or edit-in-place (e.g. MessageEdit, MessageCard).
 * For composing new messages with reset-on-submit, use ComposeEditor instead.
 */
export interface EditorSimpleProps {
    holder: string;
    editorState?: OutputData | undefined;
    readOnly?: boolean;
    defaultHeight?: number;
    imageEnable?: boolean;
    thread?: { _id: string; student_id: { _id: string } };
    handleEditorChange?: (outputData: OutputData) => void;
}

const EditorSimple = (props: EditorSimpleProps) => {
    const ejInstance = useRef<EditorJS | null>(null);
    const tools = {
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
        },
        ...(props.imageEnable
            ? {
                  image: {
                      class: ImageTool,
                      config: {
                          uploader: {
                              async uploadByFile(file: File) {
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  let url: string;
                                  if (props.thread) {
                                      const res =
                                          await uploadDocumentThreadImage(
                                              props.thread._id.toString(),
                                              props.thread.student_id._id.toString(),
                                              formData
                                          );
                                      url =
                                          (res.data?.data as
                                              | string
                                              | undefined) ?? '';
                                  } else {
                                      const res = await uploadImage(formData);
                                      url =
                                          (res.data?.data as
                                              | string
                                              | undefined) ?? '';
                                  }
                                  return {
                                      success: 1,
                                      file: { url }
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
              }
            : undefined)
    };

    const initEditor = () => {
        const editor = new EditorJS({
            holder: `${props.holder}`,
            logLevel: 'ERROR',
            data: props.editorState,
            onReady: () => {
                ejInstance.current = editor ?? null;
            },
            onChange: async (api: {
                saver: { save: () => Promise<OutputData> };
            }) => {
                if (!props.readOnly && props.handleEditorChange) {
                    api.saver.save().then((outputData) => {
                        props.handleEditorChange?.(outputData);
                    });
                }
            },
            placeholder:
                'Please organize your questions and expected help concretely.',
            readOnly: props.readOnly,
            minHeight: props.defaultHeight,
            tools: tools as ToolConfig
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

    return <div id={`${props.holder}`} />;
};

export default EditorSimple;
