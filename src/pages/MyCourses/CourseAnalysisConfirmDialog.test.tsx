import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CourseAnalysisConfirmDialog from './CourseAnalysisConfirmDialog';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@components/ProgramRequirementsTable/ProgramRequirementsTable', () => ({
    ProgramRequirementsTable: () => <div>ProgramRequirementsTable</div>
}));

const defaultProps = {
    show: true,
    data: [{ program_name: 'Computer Science', _id: 'p1' }],
    isButtonDisable: false,
    setModalHide: vi.fn(),
    onAnalyse: vi.fn()
};

describe('CourseAnalysisConfirmDialog', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CourseAnalysisConfirmDialog {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders dialog with program name', () => {
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
    });

    it('renders analyze button', () => {
        expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
    });

    it('renders cancel button', () => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
});

describe('CourseAnalysisConfirmDialog - closed', () => {
    it('does not render dialog when show is false', () => {
        render(
            <MemoryRouter>
                <CourseAnalysisConfirmDialog {...defaultProps} show={false} />
            </MemoryRouter>
        );
        expect(screen.queryByText('Computer Science')).not.toBeInTheDocument();
    });
});
