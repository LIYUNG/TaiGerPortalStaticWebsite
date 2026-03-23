import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import ReadyToSubmitTasksCard from './ReadyToSubmitTasksCard';

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: vi.fn(() => false)
}));

vi.mock('../../../Utils/util_functions', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        isCVFinished: vi.fn(() => false),
        is_program_ml_rl_essay_ready: vi.fn(() => false),
        is_the_uni_assist_vpd_uploaded: vi.fn(() => false),
        is_program_closed: vi.fn(() => false),
        application_deadline_V2_calculator: vi.fn(() => '2025-01-01')
    };
});

vi.mock('@utils/contants', () => ({
    isInTheFuture: vi.fn(() => true),
    convertDate: vi.fn((d: string) => d)
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: vi.fn(() => '/student/s1'),
        CVMLRL_HASH: 'cvmlrl'
    }
}));

describe('ReadyToSubmitTasksCard', () => {
    it('renders without crashing with empty data', () => {
        render(
            <MemoryRouter>
                <ReadyToSubmitTasksCard applications={[]} students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText(/Ready To Submit Tasks/i)).toBeInTheDocument();
    });

    it('renders table headers', () => {
        render(
            <MemoryRouter>
                <ReadyToSubmitTasksCard applications={[]} students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText('Student')).toBeInTheDocument();
        expect(screen.getByText('Deadline')).toBeInTheDocument();
    });

    it('renders with applications list', () => {
        const applications = [
            {
                _id: 'a1',
                studentId: { _id: 's1', firstname: 'Eve', lastname: 'Li' },
                programId: {
                    _id: 'p1',
                    school: 'TU Berlin',
                    program_name: 'CS',
                    degree: 'Master',
                    semester: 'WS'
                },
                decided: 'yes'
            }
        ] as never[];
        render(
            <MemoryRouter>
                <ReadyToSubmitTasksCard
                    applications={applications}
                    students={[]}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/Ready To Submit Tasks/i)).toBeInTheDocument();
    });
});
