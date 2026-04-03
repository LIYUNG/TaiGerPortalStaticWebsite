import { useRef, useState } from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'success' | 'error';

export type AutosaveState = {
    status: AutosaveStatus;
    errorMessage?: string;
    resultId: number;
};

export type UseAutosaveStateOptions = {
    onStateChange?: (state: AutosaveState) => void;
};

const INITIAL_AUTOSAVE_STATE: AutosaveState = {
    status: 'idle',
    resultId: 0
};

export const useAutosaveState = (options?: UseAutosaveStateOptions) => {
    const [saveState, setSaveState] = useState<AutosaveState>(
        INITIAL_AUTOSAVE_STATE
    );
    const resultIdRef = useRef(0);

    const updateSaveState = (
        next: AutosaveState | ((prev: AutosaveState) => AutosaveState)
    ) => {
        setSaveState((prev) => {
            const resolved = typeof next === 'function' ? next(prev) : next;
            options?.onStateChange?.(resolved);
            return resolved;
        });
    };

    const setSaving = () => {
        updateSaveState((prev) => ({
            status: 'saving',
            errorMessage: undefined,
            resultId: prev.resultId
        }));
    };

    const setSuccess = () => {
        resultIdRef.current += 1;
        updateSaveState({
            status: 'success',
            errorMessage: undefined,
            resultId: resultIdRef.current
        });
    };

    const setError = (errorMessage: string) => {
        resultIdRef.current += 1;
        updateSaveState({
            status: 'error',
            errorMessage,
            resultId: resultIdRef.current
        });
    };

    const reset = () => {
        updateSaveState((prev) => ({
            status: 'idle',
            resultId: prev.resultId
        }));
    };

    return {
        saveState,
        setSaving,
        setSuccess,
        setError,
        reset,
        updateSaveState
    };
};
