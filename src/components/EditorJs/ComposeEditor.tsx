import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useCallback
} from 'react';
import type { OutputData } from '@editorjs/editorjs';
import EditorSimple from './EditorSimple';
import { useEditorState } from '@hooks/useEditorState';
import type { EditorSimpleProps } from './EditorSimple';

export interface ComposeEditorProps
    extends Pick<
        EditorSimpleProps,
        | 'defaultHeight'
        | 'imageEnable'
        | 'readOnly'
        | 'thread'
    > {
    /** Unique id for the editor holder (e.g. "doc-thread-editor" or "thread-editor-{id}") */
    holder: string;
    /** Optional initial value (e.g. from parent). When provided, syncs into internal state. */
    initialValue?: OutputData | null;
    /** Notify parent when content changes (e.g. to enable/disable Send button) */
    onContentChange?: (value: OutputData) => void;
}

export interface ComposeEditorRef {
    /** Current editor content (use before calling reset) */
    getValue: () => OutputData;
    /** Clear editor and remount so it shows empty. Call after submit. */
    reset: () => void;
    /** Whether the editor has no content */
    isEmpty: () => boolean;
}

const ComposeEditor = forwardRef<ComposeEditorRef, ComposeEditorProps>(
    function ComposeEditor(
        {
            holder,
            initialValue = null,
            defaultHeight = 0,
            imageEnable = false,
            readOnly = false,
            thread,
            onContentChange
        },
        ref
    ) {
        const { value, onChange, reset, editorKey } = useEditorState({
            initialValue,
            syncFromInitial: true
        });

        const valueRef = useRef(value);
        valueRef.current = value;

        const handleChange = useCallback(
            (data: OutputData) => {
                onChange(data);
                onContentChange?.(data);
            },
            [onChange, onContentChange]
        );

        useImperativeHandle(
            ref,
            () => ({
                getValue: () => valueRef.current,
                reset,
                isEmpty: () => !valueRef.current?.blocks?.length
            }),
            [reset]
        );

        const stableHolder = `${holder}-${editorKey}`;

        return (
            <div key={editorKey}>
                <EditorSimple
                    defaultHeight={defaultHeight}
                    editorState={value}
                    handleEditorChange={handleChange}
                    holder={stableHolder}
                    imageEnable={imageEnable}
                    readOnly={readOnly}
                    thread={thread}
                />
            </div>
        );
    }
);

export default ComposeEditor;
