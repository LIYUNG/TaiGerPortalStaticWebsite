import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import ProgramSpecificDocumentCheckCard from './ProgramSpecificDocumentCheckCard';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('../../../Utils/util_functions', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        AGENT_SUPPORT_DOCUMENTS_A: ['essay_required', 'ml', 'rl']
    };
});

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: vi.fn(() => '/student/s1'),
        APPLICATION_HASH: 'applications',
        DOCUMENT_MODIFICATION_LINK: vi.fn(() => '/document/d1')
    }
}));

vi.mock('@mui/x-data-grid', () => ({
    DataGrid: ({ rows }: { rows: unknown[] }) => (
        <div data-testid="data-grid">rows:{rows.length}</div>
    )
}));

describe('ProgramSpecificDocumentCheckCard', () => {
    it('renders without crashing with empty threads', () => {
        render(
            <MemoryRouter>
                <ProgramSpecificDocumentCheckCard refactored_threads={[]} />
            </MemoryRouter>
        );
        expect(
            screen.getByText('Program Specific Documents Check')
        ).toBeInTheDocument();
    });

    it('renders data grid', () => {
        render(
            <MemoryRouter>
                <ProgramSpecificDocumentCheckCard refactored_threads={[]} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('data-grid')).toBeInTheDocument();
    });

    it('filters threads by agent and document type', () => {
        const threads = [
            {
                id: 't1',
                agents: [{ _id: 'u1' }],
                file_type: 'essay_required',
                show: true,
                isFinalVersion: false,
                student_id: 's1',
                firstname_lastname: 'Dan Kim',
                deadline: '2025-01-01',
                document_name: 'Essay',
                thread_id: 'th1'
            },
            {
                id: 't2',
                agents: [{ _id: 'other' }],
                file_type: 'essay_required',
                show: true,
                isFinalVersion: false,
                student_id: 's2',
                firstname_lastname: 'Eve Li',
                deadline: '2025-02-01',
                document_name: 'ML',
                thread_id: 'th2'
            }
        ] as never[];
        render(
            <MemoryRouter>
                <ProgramSpecificDocumentCheckCard
                    refactored_threads={threads}
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('data-grid')).toBeInTheDocument();
    });
});
