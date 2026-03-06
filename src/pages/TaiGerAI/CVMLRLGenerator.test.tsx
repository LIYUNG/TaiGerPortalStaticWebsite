import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CVMLRLGenerator from './CVMLRLGenerator';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('../Utils/ErrorPage', () => ({ default: () => <div>ErrorPage</div> }));
vi.mock('@components/Loading/Loading', () => ({ default: () => <div>Loading</div> }));

vi.mock('react-markdown', () => ({
    default: ({ children }: { children: string }) => <div>{children}</div>
}));
vi.mock('remark-gfm', () => ({ default: vi.fn() }));

vi.mock('@/api', () => ({
    TaiGerAiGeneral2: vi.fn()
}));

describe('CVMLRLGenerator', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CVMLRLGenerator />
            </MemoryRouter>
        );
    });

    it('renders breadcrumb with company name', () => {
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders AI playground text', () => {
        expect(screen.getByText(/ai playground/i)).toBeInTheDocument();
    });

    it('renders text input area', () => {
        expect(screen.getByPlaceholderText(/how many train stations/i)).toBeInTheDocument();
    });

    it('renders submit button', () => {
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
});
