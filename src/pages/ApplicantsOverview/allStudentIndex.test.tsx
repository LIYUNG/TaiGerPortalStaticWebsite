import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AllApplicantsOverview from './allStudentIndex';

vi.mock('@hooks/useStudentsV3', () => ({
    useStudentsV3: vi.fn(() => ({ data: undefined, isLoading: true }))
}));
vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));
vi.mock('./ApplicationOverviewTabs', () => ({
    default: () => <div data-testid="application-overview-tabs" />
}));
vi.mock('@components/BreadcrumbsNavigation/BreadcrumbsNavigation', () => ({
    BreadcrumbsNavigation: () => <nav data-testid="breadcrumbs" />
}));
vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/', BASE_DOCUMENTS_LINK: '/docs' }
}));
vi.mock('../../config', () => ({ appConfig: { companyName: 'TaiGer' } }));
vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));

describe('AllApplicantsOverview', () => {
    test('renders the applications overview tabs', () => {
        render(
            <MemoryRouter>
                <AllApplicantsOverview />
            </MemoryRouter>
        );
        expect(
            screen.getByTestId('application-overview-tabs')
        ).toBeInTheDocument();
    });
});
