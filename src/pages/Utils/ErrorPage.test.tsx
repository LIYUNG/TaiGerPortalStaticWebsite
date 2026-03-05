import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorPage from './ErrorPage';

vi.mock('./PageNotFoundError', () => ({ default: () => <div>PageNotFoundError</div> }));
vi.mock('./TimeOutErrors', () => ({ default: () => <div>TimeOutErrors</div> }));
vi.mock('./UnauthorizedError', () => ({ default: () => <div>UnauthorizedError</div> }));
vi.mock('./UnauthenticatedError', () => ({ default: () => <div>UnauthenticatedError</div> }));
vi.mock('./TooManyRequestsError', () => ({ default: () => <div>TooManyRequestsError</div> }));
vi.mock('./ResourceLockedError', () => ({ default: () => <div>ResourceLockedError</div> }));

describe('ErrorPage', () => {
    it('renders 400 server problem message', () => {
        render(<MemoryRouter><ErrorPage res_status={400} /></MemoryRouter>);
        expect(screen.getByText(/server problem/i)).toBeInTheDocument();
    });

    it('renders 404 PageNotFoundError', () => {
        render(<MemoryRouter><ErrorPage res_status={404} /></MemoryRouter>);
        expect(screen.getByText('PageNotFoundError')).toBeInTheDocument();
    });

    it('renders 401 UnauthenticatedError', () => {
        render(<MemoryRouter><ErrorPage res_status={401} /></MemoryRouter>);
        expect(screen.getByText('UnauthenticatedError')).toBeInTheDocument();
    });

    it('renders 500 server problem message', () => {
        render(<MemoryRouter><ErrorPage res_status={500} /></MemoryRouter>);
        expect(screen.getByText(/server problem/i)).toBeInTheDocument();
    });
});
