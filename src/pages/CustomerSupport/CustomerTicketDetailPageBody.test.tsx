import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Admin',
            _id: 'u1',
            firstname: 'Test',
            lastname: 'User',
            archiv: false,
            pictureUrl: ''
        }
    })
}));

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

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        CUSTOMER_CENTER_LINK: '/customer-center'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@/api', () => ({
    deleteAMessageinTicket: vi.fn(),
    deleteComplaintsTicket: vi.fn(),
    submitMessageInTicketWithAttachment: vi.fn(),
    updateComplaintsTicket: vi.fn()
}));

vi.mock('@components/Message/MessageList', () => ({
    default: () => <div data-testid="message-list" />
}));

vi.mock('@components/Message/DocThreadEditor', () => ({
    default: () => <div data-testid="doc-thread-editor" />
}));

vi.mock('@components/TopBar/TopBar', () => ({
    TopBar: () => <div data-testid="top-bar" />
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: vi.fn(() => ({ children: 'TU' }))
}));

vi.mock('../Utils/util_functions', () => ({
    readPDF: vi.fn(),
    readDOCX: vi.fn(),
    readXLSX: vi.fn()
}));

import CustomerTicketDetailPageBody from './CustomerTicketDetailPageBody';

const mockTicket = {
    _id: 't1',
    title: 'Test Ticket',
    description: 'A description',
    status: 'open',
    messages: [],
    requester_id: { _id: 'u2', firstname: 'Jane', lastname: 'Doe' }
} as any;

describe('CustomerTicketDetailPageBody', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <CustomerTicketDetailPageBody complaintTicket={mockTicket} />
            </MemoryRouter>
        );
        expect(screen.getByText(/Test Ticket/i)).toBeTruthy();
    });

    it('renders message list component', () => {
        render(
            <MemoryRouter>
                <CustomerTicketDetailPageBody complaintTicket={mockTicket} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('message-list')).toBeTruthy();
    });

    it('renders Delete Ticket button', () => {
        render(
            <MemoryRouter>
                <CustomerTicketDetailPageBody complaintTicket={mockTicket} />
            </MemoryRouter>
        );
        expect(screen.getByRole('button', { name: /Delete Ticket/i })).toBeTruthy();
    });
});
