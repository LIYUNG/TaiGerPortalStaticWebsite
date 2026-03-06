import { useCallback, useEffect, useState } from 'react';
import type { OutputData } from '@editorjs/editorjs';
import { EMPTY_EDITOR_STATE } from '@components/EditorJs/editorConstants';

export interface UseEditorStateOptions {
    /** Initial state (e.g. from parent). When this reference changes, internal state syncs to it. */
    initialValue?: OutputData | null;
    /** If true, reset to empty after initialValue becomes empty (e.g. parent cleared). Default true. */
    syncFromInitial?: boolean;
}

export interface UseEditorStateReturn {
    /** Current editor value */
    value: OutputData;
    /** Callback to pass to EditorSimple handleEditorChange */
    onChange: (data: OutputData) => void;
    /** Set value to empty and bump key so editor can remount */
    reset: () => void;
    /** True when value has no blocks or empty blocks */
    isEmpty: boolean;
    /** Key to use for EditorSimple container so it remounts on reset */
    editorKey: number;
}

export function useEditorState(
    options: UseEditorStateOptions = {}
): UseEditorStateReturn {
    const { initialValue = null, syncFromInitial = true } = options;
    const [value, setValue] = useState<OutputData>(() => {
        const v = initialValue ?? EMPTY_EDITOR_STATE;
        return typeof v === 'object' && v !== null && 'blocks' in v
            ? (v as OutputData)
            : EMPTY_EDITOR_STATE;
    });
    const [editorKey, setEditorKey] = useState(0);

    useEffect(() => {
        if (!syncFromInitial) return;
        const next =
            initialValue == null || (initialValue && !initialValue.blocks?.length)
                ? EMPTY_EDITOR_STATE
                : (initialValue as OutputData);
        setValue(next);
    }, [initialValue, syncFromInitial]);

    const onChange = useCallback((data: OutputData) => {
        setValue(data);
    }, []);

    const reset = useCallback(() => {
        setValue(EMPTY_EDITOR_STATE);
        setEditorKey((k) => k + 1);
    }, []);

    const isEmpty =
        !value?.blocks || value.blocks.length === 0;

    return { value, onChange, reset, isEmpty, editorKey };
}
