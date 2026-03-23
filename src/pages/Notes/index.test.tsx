import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Notes from './index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('../Utils/ErrorPage', () => ({ default: () => <div>ErrorPage</div> }));
vi.mock('@components/Loading/Loading', () => ({
    default: () => <div>Loading</div>
}));
vi.mock('./NotesCard', () => ({
    default: () => <div data-testid="notes-card">NotesCard</div>
}));
vi.mock('@/api', () => ({
    getStudentNotes: vi.fn(() =>
        Promise.resolve({
            data: { data: { notes: '{}' }, success: true },
            status: 200
        })
    )
}));

describe('Notes', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Notes student_id="student123" />
            </MemoryRouter>
        );
    });

    it('initially renders loading', () => {
        expect(screen.getByText('Loading')).toBeInTheDocument();
    });
});

describe('Notes - loaded state', () => {
    it('renders notes card after loading', async () => {
        render(
            <MemoryRouter>
                <Notes student_id="student123" />
            </MemoryRouter>
        );
        const notesCard = await screen.findByTestId('notes-card');
        expect(notesCard).toBeInTheDocument();
    });
});
