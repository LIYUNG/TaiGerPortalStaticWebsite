import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k }),
    default: { t: (k: string) => k }
}));

vi.mock('i18next', () => ({
    default: { t: (k: string) => k }
}));

vi.mock('@/api', () => ({
    updateEssayWriter: vi.fn()
}));

vi.mock('../../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('@pages/Dashboard/MainViewTab/NoWritersEssaysCard/NoWritersEssaysCard', () => ({
    default: () => <tr data-testid="no-writers-card"><td /></tr>
}));

import AssignEssayWritersPage from './AssignEssayWritersPage';

const mockThreads = [
    {
        _id: 'e1',
        isFinalVersion: false,
        student_id: { _id: 's1', firstname: 'Jane', lastname: 'Doe' },
        outsourced_user_id: []
    }
] as any;

describe('AssignEssayWritersPage', () => {
    it('renders without crashing with empty threads', () => {
        render(
            <MemoryRouter>
                <AssignEssayWritersPage essayDocumentThreads={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText(/No Essay Writer/i)).toBeTruthy();
    });

    it('renders essay table with threads', () => {
        render(
            <MemoryRouter>
                <AssignEssayWritersPage essayDocumentThreads={mockThreads} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('no-writers-card')).toBeTruthy();
    });

    it('does not render modal by default', () => {
        render(
            <MemoryRouter>
                <AssignEssayWritersPage essayDocumentThreads={[]} />
            </MemoryRouter>
        );
        expect(screen.queryByTestId('modal-main')).toBeNull();
    });
});
