import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import NoEnoughDecidedProgramsTasksCard from './NoEnoughDecidedProgramsTasksCard';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('../../../Utils/util_functions', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        areProgramsDecidedMoreThanContract: vi.fn(() => true),
        is_num_Program_Not_specified: vi.fn(() => false)
    };
});

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_APPLICATIONS_ID_LINK: vi.fn(() => '/student/s1/applications')
    }
}));

describe('NoEnoughDecidedProgramsTasksCard', () => {
    it('renders without crashing with empty students', () => {
        render(
            <MemoryRouter>
                <NoEnoughDecidedProgramsTasksCard students={[]} />
            </MemoryRouter>
        );
        expect(
            screen.getByText(/No Enough Program Decided Tasks/i)
        ).toBeInTheDocument();
    });

    it('renders table headers', () => {
        render(
            <MemoryRouter>
                <NoEnoughDecidedProgramsTasksCard students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText('Tasks')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('Application Year')).toBeInTheDocument();
    });

    it('renders with student list', () => {
        const students = [
            {
                _id: { toString: () => 's1' },
                firstname: 'Bob',
                lastname: 'Lee',
                agents: [{ _id: 'u1' }]
            }
        ] as never[];
        render(
            <MemoryRouter>
                <NoEnoughDecidedProgramsTasksCard students={students} />
            </MemoryRouter>
        );
        expect(
            screen.getByText(/No Enough Program Decided Tasks/i)
        ).toBeInTheDocument();
    });
});
