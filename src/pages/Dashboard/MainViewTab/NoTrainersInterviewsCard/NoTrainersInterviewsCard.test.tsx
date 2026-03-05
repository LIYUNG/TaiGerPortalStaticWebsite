import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Table, TableBody } from '@mui/material';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => true)
}));

vi.mock('../StudDocsOverview/EditInterviewTrainersSubpage', () => ({
    default: () => <div data-testid="edit-interview-trainers-subpage" />
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) => `/students/${id}#${hash}`,
        INTERVIEW_SINGLE_LINK: (id: string) => `/interviews/${id}`,
        PROFILE_HASH: 'profile'
    }
}));

vi.mock('@utils/contants', () => ({
    convertDate: vi.fn((d: string) => d),
    showTimezoneOffset: vi.fn(() => '+00:00')
}));

import NoTrainersInterviewsCard from './NoTrainersInterviewsCard';

const interviewWithoutTrainers = {
    _id: 'iv1',
    trainer_id: [],
    student_id: { _id: 's1', firstname: 'Jane', lastname: 'Doe' },
    program_id: { _id: 'p1', school: 'MIT', program_name: 'CS', degree: 'MS', semester: 'WS2025' },
    interview_date: '2025-01-15T10:00:00Z'
} as any;

const interviewWithTrainers = {
    _id: 'iv2',
    trainer_id: [{ _id: 't1', firstname: 'Trainer', lastname: 'One' }],
    student_id: { _id: 's2', firstname: 'John', lastname: 'Smith' },
    program_id: { _id: 'p2', school: 'Stanford', program_name: 'EE', degree: 'PhD', semester: 'SS2025' },
    interview_date: '2025-02-20T10:00:00Z'
} as any;

describe('NoTrainersInterviewsCard', () => {
    it('renders interview row when interview has no trainers', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <NoTrainersInterviewsCard
                            interview={interviewWithoutTrainers}
                            isArchivPage={false}
                            submitUpdateInterviewTrainerlist={vi.fn()}
                        />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(screen.getByText(/Jane/)).toBeTruthy();
        expect(screen.getByText(/MIT/)).toBeTruthy();
    });

    it('renders nothing when interview already has trainers', () => {
        const { container } = render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <NoTrainersInterviewsCard
                            interview={interviewWithTrainers}
                            isArchivPage={false}
                            submitUpdateInterviewTrainerlist={vi.fn()}
                        />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(container.querySelector('tr')).toBeNull();
    });
});
