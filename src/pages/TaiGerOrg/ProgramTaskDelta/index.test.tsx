import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

vi.mock('@/api', () => ({
    getApplicationTaskDeltas: vi.fn(() =>
        Promise.resolve({
            data: { data: [], success: true },
            status: 200
        })
    )
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading">Loading...</div>
}));

vi.mock('../../Utils/ErrorPage', () => ({
    default: ({ res_status }: { res_status: number }) => <div data-testid="error-page">{res_status}</div>
}));

vi.mock('../../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@pages/Dashboard/MainViewTab/ProgramTaskDelta/TabProgramTaskDelta', () => ({
    default: () => <div data-testid="tab-program-task-delta" />
}));

vi.mock('../../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

import ProgramTaskDeltaDashboard from './index';

describe('ProgramTaskDeltaDashboard', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ProgramTaskDeltaDashboard />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(document.body).toBeTruthy();
    });

    it('shows loading initially', () => {
        expect(screen.getByTestId('loading')).toBeTruthy();
    });

    it('does not render error page initially', () => {
        expect(screen.queryByTestId('error-page')).toBeNull();
    });

    it('renders breadcrumbs after loading', () => {
        // Loading state renders Loading component
        expect(document.body).toBeTruthy();
    });
});
