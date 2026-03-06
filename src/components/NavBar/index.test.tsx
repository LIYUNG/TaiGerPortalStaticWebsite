import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../AuthProvider', () => ({
    useAuth: () => ({
        user: { _id: 'u1', role: 'Agent', firstname: 'Alice', lastname: 'Smith' },
        isAuthenticated: true,
        isLoaded: true,
        logout: vi.fn()
    })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Agent: vi.fn(() => true),
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_AdminAgent: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        LOGIN_LINK: '/login',
        PROFILE: '/profile',
        SETTINGS: '/settings',
        EVENT_TAIGER_LINK: (id: string) => `/events/${id}`,
        EVENT_STUDENT_STUDENTID_LINK: (id: string) => `/events/${id}`,
        COMMUNICATIONS_LINK: (id: string) => `/comm/${id}`
    }
}));

vi.mock('@/api', () => ({
    getMyCommunicationUnreadNumber: vi.fn(() =>
        Promise.resolve({ data: { data: 0 } })
    ),
    getActiveEventsNumber: vi.fn(() =>
        Promise.resolve({ data: { data: 0 } })
    )
}));

vi.mock('../../config', () => ({
    appConfig: {
        logoSmallNoText: '/logo-small',
        darkLogoSmall: '/logo-dark'
    }
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: vi.fn((name: string) => ({ children: name[0] }))
}));

vi.mock('./NavSearch', () => ({
    default: () => <div data-testid="nav-search" />
}));

vi.mock('../ChatList', () => ({
    default: () => <div data-testid="chat-list" />
}));

vi.mock('../Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('./Drawer', () => ({
    CustomDrawer: () => <div data-testid="custom-drawer" />
}));

import NavBar from './index';

describe('NavBar', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <NavBar>
                    <div data-testid="child-content">Page Content</div>
                </NavBar>
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTestId('navbar_component')).toBeDefined();
    });

    it('renders child content', () => {
        expect(screen.getByTestId('child-content')).toBeDefined();
    });

    it('renders NavSearch for Agent', () => {
        expect(screen.getByTestId('nav-search')).toBeDefined();
    });
});

describe('NavBar with drawer', () => {
    it('renders custom drawer', () => {
        render(
            <MemoryRouter>
                <NavBar>
                    <div>Content</div>
                </NavBar>
            </MemoryRouter>
        );
        expect(screen.getByTestId('custom-drawer')).toBeDefined();
    });
});
