import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToggleableUploadFileForm from './ToggleableUploadFileForm';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('../Utils/util_functions', () => ({
    calculateApplicationLockStatus: vi.fn(() => ({ isLocked: false }))
}));

const mockStudent = { _id: 'student1' };

describe('ToggleableUploadFileForm', () => {
    const defaultProps = {
        filetype: 'General',
        category: '',
        student: mockStudent,
        handleSelect: vi.fn(),
        handleCreateGeneralMessageThread: vi.fn(),
        handleCreateProgramSpecificMessageThread: vi.fn()
    };

    it('renders Category select dropdown', () => {
        render(<ToggleableUploadFileForm {...defaultProps} />);
        expect(screen.getByLabelText('Category')).toBeInTheDocument();
    });

    it('renders Add Task button', () => {
        render(<ToggleableUploadFileForm {...defaultProps} />);
        expect(screen.getByText('Add Task')).toBeInTheDocument();
    });

    it('renders Add Task button when filetype is ProgramSpecific', () => {
        render(
            <ToggleableUploadFileForm
                {...defaultProps}
                filetype="ProgramSpecific"
                application={{
                    _id: 'app1',
                    decided: 'O',
                    closed: '-',
                    programId: { _id: 'prog1' }
                } as any}
            />
        );
        expect(screen.getByText('Add Task')).toBeInTheDocument();
    });
});
