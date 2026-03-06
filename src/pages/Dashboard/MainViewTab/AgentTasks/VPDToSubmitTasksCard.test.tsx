import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import VPDToSubmitTasksCard from './VPDToSubmitTasksCard';

vi.mock('../../../Utils/util_functions', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        isUniAssistVPDNeeded: vi.fn(() => false),
        application_deadline_V2_calculator: vi.fn(() => '2025-01-01'),
        is_uni_assist_paid_and_docs_uploaded: vi.fn(() => false)
    };
});

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: vi.fn(() => '/student/s1'),
        UNIASSIST_HASH: 'uniassist'
    }
}));

describe('VPDToSubmitTasksCard', () => {
    it('renders without crashing with empty applications', () => {
        render(
            <MemoryRouter>
                <VPDToSubmitTasksCard applications={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText('VPD missing:')).toBeInTheDocument();
    });

    it('renders table headers', () => {
        render(
            <MemoryRouter>
                <VPDToSubmitTasksCard applications={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText('Student')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Deadline')).toBeInTheDocument();
        expect(screen.getByText('Program')).toBeInTheDocument();
    });

    it('renders with applications list without showing VPD rows when not needed', () => {
        const applications = [
            {
                _id: 'a1',
                studentId: {
                    _id: 's1',
                    firstname: 'Frank',
                    lastname: 'Müller',
                    toString: () => 's1'
                },
                programId: { school: 'LMU', program_name: 'Physics' }
            }
        ] as never[];
        render(
            <MemoryRouter>
                <VPDToSubmitTasksCard applications={applications} />
            </MemoryRouter>
        );
        // isUniAssistVPDNeeded is mocked to false, so no VPD rows rendered
        expect(screen.getByText('VPD missing:')).toBeInTheDocument();
        expect(screen.queryByText('Frank Müller')).not.toBeInTheDocument();
    });
});
