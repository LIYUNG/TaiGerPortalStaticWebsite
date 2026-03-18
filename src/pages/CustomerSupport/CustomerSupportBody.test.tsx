import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-router-dom', async (orig) => {
    const actual = await orig<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: vi.fn(() => vi.fn())
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        CUSTOMER_CENTER_LINK: '/customer-center',
        CUSTOMER_CENTER_ADD_TICKET_LINK: '/customer-center/add',
        CUSTOMER_CENTER_TICKET_DETAIL_PAGE_LINK: (id: string) =>
            `/customer-center/${id}`
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@utils/contants', () => ({
    convertDateUXFriendly: vi.fn(() => '2024-01-01')
}));

import CustomerSupportBody from './CustomerSupportBody';

const mockTickets = [
    {
        _id: 't1',
        title: 'Test Ticket',
        description: 'A test description',
        status: 'open',
        updatedAt: '2024-01-01',
        requester_id: { firstname: 'Jane', lastname: 'Doe' }
    }
] as any;

describe('CustomerSupportBody', () => {
    it('renders without crashing with empty tickets', () => {
        render(
            <MemoryRouter>
                <CustomerSupportBody complaintTickets={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText(/Latest Support History/i)).toBeTruthy();
    });

    it('renders ticket list items', () => {
        render(
            <MemoryRouter>
                <CustomerSupportBody complaintTickets={mockTickets} />
            </MemoryRouter>
        );
        expect(screen.getByText(/Test Ticket/i)).toBeTruthy();
    });

    it('renders Add Ticket button', () => {
        render(
            <MemoryRouter>
                <CustomerSupportBody complaintTickets={[]} />
            </MemoryRouter>
        );
        expect(
            screen.getByRole('button', { name: /Add Ticket/i })
        ).toBeTruthy();
    });
});
