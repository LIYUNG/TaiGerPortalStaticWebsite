import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CVMLRLCenterAll from './indexAll';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('./CVMLRLDashboard', () => ({
    default: () => <div data-testid="cvmlrl-dashboard" />
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/util_functions', () => ({
    open_tasks_v2: vi.fn(() => [])
}));

vi.mock('@hooks/useActiveThreads', () => ({
    useActiveThreads: vi.fn(() => ({ data: [], isLoading: false }))
}));

describe('CVMLRLCenterAll (indexAll)', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CVMLRLCenterAll />
            </MemoryRouter>
        );
    });

    it('renders breadcrumbs navigation', () => {
        expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    });

    it('renders the CVMLRLDashboard component', () => {
        expect(screen.getByTestId('cvmlrl-dashboard')).toBeInTheDocument();
    });

    it('renders All Students breadcrumb text', () => {
        expect(screen.getByText('All Students')).toBeInTheDocument();
    });

    it('renders company name link in breadcrumbs', () => {
        expect(screen.getByRole('link', { name: 'TaiGer' })).toBeInTheDocument();
    });
});
