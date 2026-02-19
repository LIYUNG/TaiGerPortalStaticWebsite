import { createElement, forwardRef } from 'react';
import { render, screen } from '@testing-library/react';

import StudentOverviewPage from '.';
import { useAuth } from '@components/AuthProvider';
import { useActiveStudents } from '@hooks/useActiveStudents';

vi.mock('react-router-dom', () => ({
    Navigate: () => null,
    Link: forwardRef((props, ref) =>
        createElement('a', {
            href: props.to,
            ref,
            ...props
        }, props.children)
    )
}));

vi.mock('@components/AuthProvider');
vi.mock('@hooks/useActiveStudents');

vi.mock('@components/StudentOverviewTable', () => ({
    default: () =>
        createElement('div', { 'data-testid': 'student-overview-table' }, 'Table')
}));

const mockAgentUser = {
    role: 'Agent',
    _id: '639baebf8b84944b872cf648',
    firstname: 'Agent',
    lastname: 'User'
};

describe('StudentOverviewPage', () => {
    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({
            user: mockAgentUser,
            isAuthenticated: true,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
        vi.mocked(useActiveStudents).mockReturnValue({
            data: [],
            isLoading: false
        } as never);
    });

    it('renders without crashing', () => {
        render(<StudentOverviewPage />);
        expect(screen.getByTestId('student_overview')).toBeInTheDocument();
    });

    it('renders StudentOverviewTable', () => {
        render(<StudentOverviewPage />);
        expect(
            screen.getByTestId('student-overview-table')
        ).toBeInTheDocument();
    });
});
