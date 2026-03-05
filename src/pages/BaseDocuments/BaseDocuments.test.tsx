import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BaseDocuments from './BaseDocuments';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));
vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Editor: vi.fn(() => false),
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
vi.mock('./BaseDocumentStudentView', () => ({
    default: () => <div data-testid="base-document-student-view" />
}));
vi.mock('@hooks/useStudentsAndDocLinks', () => ({
    useStudentsAndDocLinks: vi.fn(() => ({
        students: [],
        base_docs_link: [],
        isLoading: true,
        isError: false,
        error: null
    }))
}));
vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));

describe('BaseDocuments', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <BaseDocuments />
            </MemoryRouter>
        );
    });

    test('renders Loading when isLoading is true', () => {
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('renders company name in breadcrumb', () => {
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });
});
