import { describe, it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ComposeEditor from './ComposeEditor';
import type { ComposeEditorRef } from './ComposeEditor';

vi.mock('./EditorSimple', () => ({
    default: ({
        holder,
        editorState
    }: {
        holder: string;
        editorState: { blocks?: unknown[] };
    }) => (
        <div data-testid="editor-simple" data-holder={holder}>
            {editorState?.blocks?.length ? 'has-content' : 'empty'}
        </div>
    )
}));

describe('ComposeEditor', () => {
    it('renders EditorSimple with holder and initial empty state', () => {
        render(<ComposeEditor holder="test-editor" />);
        expect(screen.getByTestId('editor-simple')).toBeInTheDocument();
        expect(screen.getByText('empty')).toBeInTheDocument();
    });

    it('renders with initial value when provided', () => {
        const initial = {
            blocks: [{ type: 'paragraph', data: { text: 'Hi' } }]
        };
        render(<ComposeEditor holder="test-editor" initialValue={initial} />);
        expect(screen.getByText('has-content')).toBeInTheDocument();
    });

    it('exposes getValue, reset, isEmpty via ref', () => {
        const ref = React.createRef<ComposeEditorRef>();
        render(<ComposeEditor ref={ref} holder="test-editor" />);

        expect(ref.current).not.toBeNull();
        expect(ref.current?.isEmpty()).toBe(true);
        expect(ref.current?.getValue()).toEqual({ blocks: [] });

        ref.current?.reset();
        expect(ref.current?.getValue()).toEqual({ blocks: [] });
        expect(ref.current?.isEmpty()).toBe(true);
    });

    it('calls onContentChange when content would change (via EditorSimple)', () => {
        const onContentChange = vi.fn();
        render(
            <ComposeEditor
                holder="test-editor"
                onContentChange={onContentChange}
            />
        );
        expect(screen.getByTestId('editor-simple')).toBeInTheDocument();
        expect(onContentChange).not.toHaveBeenCalled();
    });
});
