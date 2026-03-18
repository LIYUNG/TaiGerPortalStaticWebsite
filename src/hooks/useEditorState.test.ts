import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorState } from './useEditorState';

vi.mock('@components/EditorJs/editorConstants', () => ({
    EMPTY_EDITOR_STATE: { blocks: [] }
}));

describe('useEditorState', () => {
    it('returns empty value and isEmpty true when no initialValue', () => {
        const { result } = renderHook(() => useEditorState({}));

        expect(result.current.value).toEqual({ blocks: [] });
        expect(result.current.isEmpty).toBe(true);
        expect(result.current.editorKey).toBe(0);
    });

    it('uses initialValue when provided', () => {
        const initial = {
            blocks: [{ type: 'paragraph', data: { text: 'Hello' } }]
        };
        const { result } = renderHook(() =>
            useEditorState({ initialValue: initial })
        );

        expect(result.current.value).toEqual(initial);
        expect(result.current.isEmpty).toBe(false);
    });

    it('onChange updates value', () => {
        const { result } = renderHook(() => useEditorState({}));

        const newData = {
            blocks: [{ type: 'paragraph', data: { text: 'New' } }]
        };
        act(() => {
            result.current.onChange(newData);
        });

        expect(result.current.value).toEqual(newData);
        expect(result.current.isEmpty).toBe(false);
    });

    it('reset sets value to empty and increments editorKey', () => {
        const initial = {
            blocks: [{ type: 'paragraph', data: { text: 'Hi' } }]
        };
        const { result } = renderHook(() =>
            useEditorState({ initialValue: initial })
        );

        expect(result.current.editorKey).toBe(0);
        expect(result.current.isEmpty).toBe(false);

        act(() => {
            result.current.reset();
        });

        expect(result.current.value).toEqual({ blocks: [] });
        expect(result.current.isEmpty).toBe(true);
        expect(result.current.editorKey).toBe(1);
    });
});
