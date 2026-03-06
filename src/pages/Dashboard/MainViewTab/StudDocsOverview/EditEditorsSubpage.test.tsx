import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import EditEditorsSubpage from './EditEditorsSubpage';

vi.mock('@/api', () => ({
    getUsers: vi.fn().mockResolvedValue({
        data: { data: [], success: true }
    })
}));

const mockStudent = {
    _id: 's1',
    firstname: 'Ivan',
    lastname: 'Zhao',
    editors: []
} as never;

describe('EditEditorsSubpage', () => {
    it('renders dialog when show=true', () => {
        render(
            <MemoryRouter>
                <EditEditorsSubpage
                    onHide={vi.fn()}
                    show={true}
                    student={mockStudent}
                    submitUpdateEditorlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            screen.getByText(/Editor for Ivan - Zhao/i)
        ).toBeInTheDocument();
    });

    it('does not render dialog content when show=false', () => {
        render(
            <MemoryRouter>
                <EditEditorsSubpage
                    onHide={vi.fn()}
                    show={false}
                    student={mockStudent}
                    submitUpdateEditorlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            screen.queryByText(/Editor for Ivan - Zhao/i)
        ).not.toBeInTheDocument();
    });

    it('shows loading spinner before data is loaded', () => {
        render(
            <MemoryRouter>
                <EditEditorsSubpage
                    onHide={vi.fn()}
                    show={true}
                    student={mockStudent}
                    submitUpdateEditorlist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
