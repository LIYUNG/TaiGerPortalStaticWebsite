import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LearningResources from './index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));

describe('LearningResources', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <LearningResources />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByText('Resources A')).toBeInTheDocument();
    });

    it('shows coming soon text', () => {
        expect(screen.getByText(/comming soon/i)).toBeInTheDocument();
    });
});
