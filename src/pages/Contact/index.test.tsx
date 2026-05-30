import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Student', _id: 'u1' } })
}));

vi.mock('@tanstack/react-query', () => ({
    useQuery: () => ({
        data: {
            data: {
                data: {
                    editors: [
                        {
                            firstname: 'Alice',
                            lastname: 'Editor',
                            email: 'alice@example.com'
                        }
                    ],
                    agents: [
                        {
                            _id: { toString: () => 'agent1' },
                            firstname: 'Bob',
                            lastname: 'Agent',
                            email: 'bob@example.com'
                        }
                    ]
                }
            }
        },
        isLoading: false
    })
}));

vi.mock('@/api/query', () => ({
    getStudentQuery: vi.fn(() => ({ queryKey: ['student', 'u1'] }))
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        TEAM_AGENT_PROFILE_LINK: (id: string) => `/team/agent/${id}`
    }
}));

vi.mock('../../config', () => ({ appConfig: { companyName: 'TaiGer' } }));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));

vi.mock('@components/BreadcrumbsNavigation/BreadcrumbsNavigation', () => ({
    BreadcrumbsNavigation: () => <nav data-testid="breadcrumbs" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div>Loading</div>
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

import Contact from './index';

describe('Contact', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );
        expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });

    it('renders agent and editor contact cards', () => {
        render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );
        const aliceEls = screen.getAllByText(/Alice/i);
        expect(aliceEls.length).toBeGreaterThan(0);
        const bobEls = screen.getAllByText(/Bob/i);
        expect(bobEls.length).toBeGreaterThan(0);
        expect(screen.getByText('alice@example.com')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('renders team section headings', () => {
        render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );
        expect(screen.getByText('Agents')).toBeInTheDocument();
        expect(screen.getByText('Editors')).toBeInTheDocument();
    });
});
