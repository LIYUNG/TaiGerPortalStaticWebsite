import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: { role: 'Admin', _id: 'u1', firstname: 'Test', lastname: 'User' }
    })
}));

const mockTicket = {
    _id: 't1',
    title: 'Test Ticket',
    description: 'Description',
    status: 'open',
    messages: [],
    requester_id: { _id: 'u2', firstname: 'Jane', lastname: 'Doe' }
};

vi.mock('react-router-dom', async (orig) => {
    const actual = await orig<typeof import('react-router-dom')>();
    return {
        ...actual,
        useLoaderData: vi.fn(() => ({
            complaintTicket: Promise.resolve(mockTicket)
        })),
        useNavigate: vi.fn(() => vi.fn()),
        Await: ({
            children
        }: {
            resolve: unknown;
            children: (data: unknown) => ReactNode;
        }) => {
            return <>{children(mockTicket)}</>;
        }
    };
});

vi.mock('./CustomerTicketDetailPageBody', () => ({
    default: () => <div data-testid="ticket-detail-body" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@store/constant', () => ({
    default: {
        CUSTOMER_CENTER_LINK: '/customer-center',
        DASHBOARD_LINK: '/dashboard'
    }
}));

import CustomerTicketDetailPage from './CustomerTicketDetailPage';

describe('CustomerTicketDetailPage', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <CustomerTicketDetailPage />
            </MemoryRouter>
        );
        expect(screen.getByTestId('customer_support')).toBeTruthy();
    });

    it('renders ticket detail body', () => {
        render(
            <MemoryRouter>
                <CustomerTicketDetailPage />
            </MemoryRouter>
        );
        expect(screen.getByTestId('ticket-detail-body')).toBeTruthy();
    });
});
