import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardBody from './DashboardBody';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Guest', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_External: vi.fn(() => false),
    is_TaiGer_Guest: vi.fn(() => true),
    is_TaiGer_Manager: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('./AdminDashboard/AdminMainView', () => ({
    default: () => <div data-testid="admin-view">AdminMainView</div>
}));

vi.mock('./AgentDashboard/AgentMainView', () => ({
    default: () => <div data-testid="agent-view">AgentMainView</div>
}));

vi.mock('./EditorDashboard/EditorMainView', () => ({
    default: () => <div data-testid="editor-view">EditorMainView</div>
}));

vi.mock('./StudentDashboard/StudentDashboard', () => ({
    default: () => <div data-testid="student-view">StudentDashboard</div>
}));

vi.mock('./GuestDashboard/GuestDashboard', () => ({
    default: () => <div data-testid="guest-view">GuestDashboard</div>
}));

vi.mock('./ExternalDashboard/ExternalMainView', () => ({
    default: () => <div data-testid="external-view">ExternalMainView</div>
}));

describe('DashboardBody', () => {
    it('renders the breadcrumb with company name', () => {
        render(
            <MemoryRouter>
                <DashboardBody />
            </MemoryRouter>
        );
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders Dashboard breadcrumb text', () => {
        render(
            <MemoryRouter>
                <DashboardBody />
            </MemoryRouter>
        );
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders GuestDashboard for guest user', () => {
        render(
            <MemoryRouter>
                <DashboardBody />
            </MemoryRouter>
        );
        expect(screen.getByTestId('guest-view')).toBeInTheDocument();
    });
});
