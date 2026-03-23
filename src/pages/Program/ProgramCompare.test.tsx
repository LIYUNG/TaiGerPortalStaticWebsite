import { render, screen } from '@testing-library/react';
import ProgramCompare from './ProgramCompare';

vi.mock('@/api', () => ({
    updateProgram: vi.fn(() => Promise.resolve({ data: {} })),
    reviewProgramChangeRequests: vi.fn(() => Promise.resolve({ data: {} }))
}));

vi.mock('@utils/contants', () => ({
    programField2Label: { school: 'School', program_name: 'Program Name' },
    sortProgramFields: vi.fn((a: string, b: string) => a.localeCompare(b))
}));

const defaultProps = {
    originalProgram: {
        _id: 'prog1',
        school: 'TU Berlin',
        program_name: 'CS',
        degree: 'Master'
    },
    incomingChanges: {
        _id: 'change1',
        programChanges: {
            school: 'TU Munich',
            degree: 'Bachelor'
        }
    },
    submitCallBack: vi.fn()
};

describe('ProgramCompare', () => {
    beforeEach(() => {
        render(<ProgramCompare {...defaultProps} />);
    });

    it('renders without crashing', () => {
        expect(
            screen.getByRole('button', { name: /Accept All/i })
        ).toBeInTheDocument();
    });

    it('renders Reject All button', () => {
        expect(
            screen.getByRole('button', { name: /Reject All/i })
        ).toBeInTheDocument();
    });

    it('renders comparison table headers', () => {
        expect(screen.getByText('Field')).toBeInTheDocument();
    });

    it('renders Submit button disabled when no delta', () => {
        const submitBtn = screen.getByRole('button', { name: /Submit/i });
        expect(submitBtn).toBeDisabled();
    });
});
