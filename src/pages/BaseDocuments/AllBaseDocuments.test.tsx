import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AllBaseDocuments from './AllBaseDocuments';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));
vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));
vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/', BASE_DOCUMENTS_LINK: '/docs' }
}));
vi.mock('../../config', () => ({ appConfig: { companyName: 'TaiGer' } }));
vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));
vi.mock('./BaseDocumentsTable', () => ({
    BaseDocumentsTable: () => <div data-testid="base-documents-table" />
}));
vi.mock('@hooks/useStudentsAndDocLinks', () => ({
    useStudentsAndDocLinks: vi.fn(() => ({
        students: [],
        isLoading: true,
        isError: false,
        error: null
    }))
}));
vi.mock('@components/BreadcrumbsNavigation/BreadcrumbsNavigation', () => ({
    BreadcrumbsNavigation: () => <nav data-testid="breadcrumbs" />
}));
vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));

describe('AllBaseDocuments', () => {
    test('renders Loading when isLoading is true', () => {
        render(
            <MemoryRouter>
                <AllBaseDocuments />
            </MemoryRouter>
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('renders breadcrumbs navigation', () => {
        render(
            <MemoryRouter>
                <AllBaseDocuments />
            </MemoryRouter>
        );
        expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });
});
