import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Student', _id: 'u1' } })
}));

vi.mock('react-router-dom', async (orig) => {
    const actual = await orig<typeof import('react-router-dom')>();
    return {
        ...actual,
        Navigate: () => null,
        useLoaderData: vi.fn(() => ({
            data: {
                data: [
                    {
                        editors: [
                            { firstname: 'Alice', lastname: 'Editor', email: 'alice@example.com' }
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
                ]
            }
        }))
    };
});

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

    it('renders agent and editor contact rows', () => {
        render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );
        // Multiple elements may contain "Alice" and "Bob" as parts of text
        const aliceEls = screen.getAllByText(/Alice/i);
        expect(aliceEls.length).toBeGreaterThan(0);
        const bobEls = screen.getAllByText(/Bob/i);
        expect(bobEls.length).toBeGreaterThan(0);
    });

    it('renders the team table', () => {
        render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );
        expect(screen.getByRole('table')).toBeInTheDocument();
    });
});
