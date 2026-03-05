import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotesCard from './NotesCard';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@/api', () => ({
    updateStudentNotes: vi.fn(() => Promise.resolve({ data: { success: true }, status: 200 }))
}));

vi.mock('./NotesEditor', () => ({
    default: ({ notes_id }: { notes_id: string }) => (
        <div data-testid="notes-editor" data-notes-id={notes_id}>
            NotesEditor
        </div>
    )
}));

describe('NotesCard', () => {
    it('renders NotesEditor', () => {
        render(
            <NotesCard
                notes={null}
                isLoaded={true}
                student_id="student1"
            />
        );
        expect(screen.getByTestId('notes-editor')).toBeInTheDocument();
    });

    it('passes correct notes_id to NotesEditor', () => {
        render(
            <NotesCard
                notes={null}
                isLoaded={true}
                student_id="student42"
            />
        );
        expect(screen.getByTestId('notes-editor')).toHaveAttribute(
            'data-notes-id',
            'notes-student42'
        );
    });

    it('renders with initial notes data', () => {
        const notes = { blocks: [] };
        render(
            <NotesCard
                notes={notes}
                isLoaded={true}
                student_id="student1"
            />
        );
        expect(screen.getByTestId('notes-editor')).toBeInTheDocument();
    });
});
