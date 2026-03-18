import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'u1', firstname: 'Test' } })
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

vi.mock('@/api', () => ({
    createComplaintTicket: vi.fn()
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        CUSTOMER_CENTER_LINK: '/customer-center',
        CUSTOMER_CENTER_ADD_TICKET_LINK: '/customer-center/add'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

import CreateComplaintTicket from './CreateTicket';

describe('CreateComplaintTicket', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <CreateComplaintTicket />
            </MemoryRouter>
        );
        expect(
            screen.getAllByText(/Describe your title/i).length
        ).toBeGreaterThan(0);
    });

    it('renders submit button', () => {
        render(
            <MemoryRouter>
                <CreateComplaintTicket />
            </MemoryRouter>
        );
        expect(screen.getByRole('button', { name: /submit/i })).toBeTruthy();
    });

    it('renders category select', () => {
        render(
            <MemoryRouter>
                <CreateComplaintTicket />
            </MemoryRouter>
        );
        expect(screen.getByLabelText(/Select Category/i)).toBeTruthy();
    });
});
