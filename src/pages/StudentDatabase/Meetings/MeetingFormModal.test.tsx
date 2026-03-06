import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MeetingFormModal } from './MeetingFormModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    meeting: null,
    isLoading: false,
    student: null
};

describe('MeetingFormModal', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <MeetingFormModal {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders dialog title for new meeting', () => {
        expect(screen.getByText('Arrange Meeting')).toBeInTheDocument();
    });

    it('renders title input field', () => {
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    it('renders save button', () => {
        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('renders cancel button', () => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
});
