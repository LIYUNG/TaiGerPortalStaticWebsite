import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotesEditor from './NotesEditor';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@components/EditorJs/EditorSimple', () => ({
    default: ({ holder }: { holder: string }) => (
        <div data-testid="editor-note" data-holder={holder}>
            EditorSimple
        </div>
    )
}));

describe('NotesEditor', () => {
    const defaultProps = {
        editorState: null,
        handleEditorChange: vi.fn(),
        notes_id: 'notes-student1',
        buttonDisabled: true,
        handleClickSave: vi.fn()
    };

    it('renders EditorNote component', () => {
        render(<NotesEditor {...defaultProps} />);
        expect(screen.getByTestId('editor-note')).toBeInTheDocument();
    });

    it('renders disabled Save button when buttonDisabled is true', () => {
        render(<NotesEditor {...defaultProps} buttonDisabled={true} />);
        expect(screen.getByText('Save')).toBeDisabled();
    });

    it('renders enabled Save button when buttonDisabled is false', () => {
        render(<NotesEditor {...defaultProps} buttonDisabled={false} />);
        expect(screen.getByText('Save')).not.toBeDisabled();
    });
});
