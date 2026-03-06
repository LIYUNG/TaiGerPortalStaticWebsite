import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import EditEssayWritersSubpage from './EditEssayWritersSubpage';

vi.mock('@/api', () => ({
    getEssayWriters: vi.fn().mockResolvedValue({
        data: { data: [], success: true }
    })
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
                />
            </MemoryRouter>
        );
        // Dialog is open, loading spinner shown initially
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not render dialog content when show=false', () => {
        const { container } = render(
            <MemoryRouter>
                <EditEssayWritersSubpage
                    actor="Essay Writer"
                    essayDocumentThread={makeThread('ml') as never}
                    onHide={vi.fn()}
                    show={false}
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
                />
            </MemoryRouter>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
