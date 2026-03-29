import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'u1' } })
}));

vi.mock('react-router-dom', async (orig) => {
    const actual = await orig<typeof import('react-router-dom')>();
    return {
        ...actual,
        useLoaderData: vi.fn(() => ({
            complaintTickets: Promise.resolve([])
        })),
        Await: ({
            children
        }: {
            resolve: unknown;
            children: (data: unknown) => ReactNode;
        }) => {
            return <>{children([])}</>;
        }
    };
});

vi.mock('./CustomerSupportBody', () => ({
    default: () => <div data-testid="customer-support-body" />
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

import CustomerSupport from './index';

describe('CustomerSupport', () => {
    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <CustomerSupport />
            </MemoryRouter>
        );
        expect(screen.getByTestId('customer_support')).toBeTruthy();
    });

    it('renders CustomerSupportBody via Await', () => {
        render(
            <MemoryRouter>
                <CustomerSupport />
            </MemoryRouter>
        );
        expect(screen.getByTestId('customer-support-body')).toBeTruthy();
    });
});
