import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DefaultErrorPage from './DefaultErrorPage';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useRouteError: () => ({ status: 404, message: 'Not Found' })
    };
});

vi.mock('i18next', () => ({
    default: { t: (k: string) => k }
}));

const renderComponent = () =>
    render(
        <MemoryRouter>
            <DefaultErrorPage />
        </MemoryRouter>
    );

describe('DefaultErrorPage', () => {
    it('renders without crashing', () => {
        renderComponent();
        expect(screen.getByText(/something-went-wrong/i)).toBeInTheDocument();
    });

    it('shows error status', () => {
        renderComponent();
        expect(screen.getByText(/404/)).toBeInTheDocument();
    });

    it('renders Go to Home button', () => {
        renderComponent();
        expect(
            screen.getByRole('button', { name: /go to home/i })
        ).toBeInTheDocument();
    });

    it('renders Retry button', () => {
        renderComponent();
        expect(
            screen.getByRole('button', { name: /retry/i })
        ).toBeInTheDocument();
    });
});
