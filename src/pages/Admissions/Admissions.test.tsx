import { createElement, forwardRef } from 'react';
import { render, screen } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import Admissions from './Admissions';
import { useAuth } from '@components/AuthProvider';
import { mockAdmissionsData } from '../../test/testingAdmissionsData';

const mockAdmissionsResponse = {
    data: mockAdmissionsData,
    result: [] as unknown[],
    success: true
};

const mockAuthAgent = {
    user: { role: 'Agent', _id: '639baebf8b84944b872cf648' },
    isAuthenticated: true,
    isLoaded: true,
    login: vi.fn(),
    logout: vi.fn()
};

let mockSearch = '';
let mockPathname = '/admissions-overview';

vi.mock('react-router-dom', () => ({
    Navigate: () => null,
    Link: forwardRef(
        (
            { children, to, ...props }: { to: string; children?: React.ReactNode },
            ref
        ) => createElement('a', { href: to, ref, ...props }, children)
    ),
    useLocation: () => ({ search: mockSearch, pathname: mockPathname }),
    useNavigate: () => vi.fn()
}));

vi.mock('@components/AuthProvider');

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('@tanstack/react-query')>();
    return {
        ...actual,
        useQuery: vi.fn(() => ({
            data: mockAdmissionsResponse,
            isLoading: false,
            isError: false,
            error: null,
            refetch: vi.fn()
        }))
    };
});

vi.mock('./AdmissionsTables', () => ({
    default: () => createElement('div', { 'data-testid': 'admissions-tables' })
}));
vi.mock('./Overview', () => ({
    default: () => createElement('div', { 'data-testid': 'overview' })
}));
vi.mock('./StudentAdmissionTables', () => ({
    default: () =>
        createElement('div', { 'data-testid': 'student-admission-tables' })
}));
vi.mock('./AdmissionsStat', () => ({
    default: () => createElement('div', { 'data-testid': 'admissions-stat' })
}));

const defaultQueryState = {
    data: mockAdmissionsResponse,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn()
};

describe('Admissions', () => {
    beforeEach(() => {
        mockSearch = '';
        mockPathname = '/admissions-overview';
        vi.mocked(useAuth).mockReturnValue(mockAuthAgent as never);
        vi.mocked(useQuery).mockReturnValue(defaultQueryState as never);
    });

    it('renders without crashing', () => {
        render(<Admissions />);
        expect(screen.getByTestId('admissinos_page')).toBeInTheDocument();
    });

    it('renders tab list when data is loaded', () => {
        render(<Admissions />);
        expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('respects tab from URL search', () => {
        mockSearch = '?tab=student';
        render(<Admissions />);
        expect(screen.getByTestId('admissinos_page')).toBeInTheDocument();
        expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('shows loading state when isLoading is true', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
            refetch: vi.fn()
        } as never);
        render(<Admissions />);
        expect(screen.getByTestId('admissinos_page')).toBeInTheDocument();
    });

    it('redirects non-TaiGer users', () => {
        vi.mocked(useAuth).mockReturnValue({
            ...mockAuthAgent,
            user: { role: 'Student', _id: '639baebf8b84944b872cf648' }
        } as never);
        render(<Admissions />);
        expect(screen.queryByTestId('admissinos_page')).not.toBeInTheDocument();
    });

    it('shows error when isError is true', () => {
        vi.mocked(useQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error('API Error'),
            refetch: vi.fn()
        } as never);
        render(<Admissions />);
        expect(screen.getByTestId('admissinos_page')).toBeInTheDocument();
        expect(screen.getByText('API Error')).toBeInTheDocument();
    });
});
