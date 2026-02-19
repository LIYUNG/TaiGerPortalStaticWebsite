import { createElement, forwardRef } from 'react';
import { render, screen } from '@testing-library/react';

import ApplicantsOverview from '.';
import { useAuth } from '@components/AuthProvider';
import { useStudentsV3 } from '@hooks/useStudentsV3';
import { useMyStudentsApplicationsV2 } from '@hooks/useMyStudentsApplicationsV2';
import { mockSingleData } from '../../test/testingStudentData';

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
vi.mock('@hooks/useStudentsV3');
vi.mock('@hooks/useMyStudentsApplicationsV2');

vi.mock('./ApplicationOverviewTabs', () => ({
    default: () =>
        createElement('div', {
            'data-testid': 'application_overview_tabs'
        })
}));

const mockAgentUser = {
    role: 'Agent',
    _id: '639baebf8b84944b872cf648',
    firstname: 'Agent',
    lastname: 'User'
};

describe('ApplicantsOverview', () => {
    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({
            user: mockAgentUser,
            isAuthenticated: true,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
        vi.mocked(useStudentsV3).mockReturnValue({
            data: mockSingleData.data,
            isLoading: false
        } as never);
        vi.mocked(useMyStudentsApplicationsV2).mockReturnValue({
            data: { applications: [] },
            isLoading: false
        } as never);
    });

    it('renders without crashing', () => {
        render(<ApplicantsOverview />);
        expect(
            screen.getByTestId('application_overview_component')
        ).toBeInTheDocument();
    });

    it('renders ApplicationOverviewTabs when not loading', () => {
        render(<ApplicantsOverview />);
        expect(
            screen.getByTestId('application_overview_tabs')
        ).toBeInTheDocument();
    });
});
