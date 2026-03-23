import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import EditEssayWritersSubpage from './EditEssayWritersSubpage';

vi.mock('@/api/query', () => ({
    getUsersQuery: vi.fn(() => ({
        queryKey: ['users'],
        queryFn: vi.fn().mockResolvedValue([])
    }))
}));

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: [], isLoading: false }))
}));

vi.mock('../../../Utils/util_functions', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        FILE_TYPE_E: { essay_required: 'essay_required' }
    };
});

const makeThread = (fileType = 'ml') => ({
    _id: 'th1',
    file_type: fileType,
    outsourced_user_id: [],
    program_id: {
        school: 'TU Berlin',
        program_name: 'CS',
        degree: 'Master',
        semester: 'WS'
    },
    student_id: { firstname: 'Jack', lastname: 'Zhang' }
});

describe('EditEssayWritersSubpage', () => {
    it('renders dialog when show=true', () => {
        render(
            <MemoryRouter>
                <EditEssayWritersSubpage
                    actor="Essay Writer"
                    essayDocumentThread={makeThread('ml') as never}
                    onHide={vi.fn()}
                    show={true}
                    submitUpdateEssayWriterlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/Essay Writer for ml-/i)).toBeInTheDocument();
    });

    it('does not render dialog content when show=false', () => {
        const { container } = render(
            <MemoryRouter>
                <EditEssayWritersSubpage
                    actor="Essay Writer"
                    essayDocumentThread={makeThread('ml') as never}
                    onHide={vi.fn()}
                    show={false}
                    submitUpdateEssayWriterlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            container.querySelector('[role="dialog"]')
        ).not.toBeInTheDocument();
    });

    it('renders with essay_required file type', () => {
        render(
            <MemoryRouter>
                <EditEssayWritersSubpage
                    actor="Essay Writer"
                    essayDocumentThread={makeThread('essay_required') as never}
                    onHide={vi.fn()}
                    show={true}
                    submitUpdateEssayWriterlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            screen.getByText(/Essay Writer for essay_required-/i)
        ).toBeInTheDocument();
    });
});
