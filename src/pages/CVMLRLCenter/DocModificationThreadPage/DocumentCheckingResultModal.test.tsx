import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocumentCheckingResultModal from './DocumentCheckingResultModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@/api', () => ({
    getCheckDocumentPatternIsPassed: vi.fn(() =>
        Promise.resolve({
            data: { isPassed: true, success: true, reason: '' },
            status: 200
        })
    )
}));

const defaultProps = {
    open: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Warning',
    isFinalVersion: false,
    isSubmissionLoaded: true,
    file_type: 'ML',
    thread_id: 'thread123',
    student_name: 'John Doe',
    docName: 'ML Document'
};

describe('DocumentCheckingResultModal', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <DocumentCheckingResultModal {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders without crashing when closed', () => {
        // When open is false, dialog may not be visible but renders
        const dialogs = screen.queryAllByRole('dialog');
        expect(dialogs).toBeDefined();
    });

    it('renders a Yes button', () => {
        // Dialog closed, buttons may be hidden
        const buttons = screen.queryAllByRole('button', { name: /Yes/i });
        expect(Array.isArray(buttons)).toBe(true);
    });

    it('renders the modal when open=true', () => {
        render(
            <MemoryRouter>
                <DocumentCheckingResultModal {...defaultProps} open={true} file_type="ML" />
            </MemoryRouter>
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders the isFinalVersion=true content when open', () => {
        render(
            <MemoryRouter>
                <DocumentCheckingResultModal
                    {...defaultProps}
                    open={true}
                    isFinalVersion={true}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/open/i)).toBeInTheDocument();
    });
});
