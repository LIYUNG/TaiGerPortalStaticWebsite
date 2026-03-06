import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AgentProfile from './AgentProfile';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Student',
            _id: { toString: () => 's1' },
            timezone: 'UTC'
        }
    })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Student: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        EVENT_STUDENT_STUDENTID_LINK: () => '/event'
    }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useParams: () => ({ user_id: 'agent1' }) };
});

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('../Utils/ErrorPage', () => ({ default: () => <div>ErrorPage</div> }));
vi.mock('../Utils/ModalHandler/ModalMain', () => ({ default: () => <div>Modal</div> }));
vi.mock('@components/Loading/Loading', () => ({ default: () => <div>Loading</div> }));

vi.mock('react-timezone-select', () => ({
    default: () => <div data-testid="timezone-select">TimezoneSelect</div>
}));

vi.mock('react-select', () => ({
    default: () => <div>Select</div>
}));

vi.mock('@/api', () => ({
    getAgentProfile: vi.fn(() =>
        Promise.resolve({
            data: {
                success: true,
                data: {
                    firstname: 'Jane',
                    lastname: 'Smith',
                    email: 'jane@example.com',
                    selfIntroduction: 'Hello, I am Jane.',
                    officehours: {}
                }
            },
            status: 200
        })
    )
}));

vi.mock('@utils/contants', () => ({
    daysOfWeek: ['Monday', 'Tuesday'],
    time_slots: []
}));

vi.mock('i18next', () => ({
    default: { t: (k: string) => k }
}));

describe('AgentProfile', () => {
    it('renders loading initially', () => {
        render(
            <MemoryRouter>
                <AgentProfile />
            </MemoryRouter>
        );
        expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('renders agent profile after loading', async () => {
        render(
            <MemoryRouter>
                <AgentProfile />
            </MemoryRouter>
        );
        expect(await screen.findByText(/jane smith profile/i)).toBeInTheDocument();
    });

    it('renders agent email after loading', async () => {
        render(
            <MemoryRouter>
                <AgentProfile />
            </MemoryRouter>
        );
        expect(await screen.findByText(/jane@example.com/)).toBeInTheDocument();
    });

    it('renders office hours section after loading', async () => {
        render(
            <MemoryRouter>
                <AgentProfile />
            </MemoryRouter>
        );
        expect(await screen.findByText(/office hours/i)).toBeInTheDocument();
    });
});
