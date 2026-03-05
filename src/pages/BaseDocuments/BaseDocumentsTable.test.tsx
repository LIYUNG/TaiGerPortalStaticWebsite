import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BaseDocumentsTable } from './BaseDocumentsTable';

vi.mock('@taiger-common/core', () => ({
    PROFILE_NAME: { passport: 'Passport', transcript: 'Transcript' }
}));
vi.mock('@taiger-common/model', () => ({
    DocumentStatusType: {
        Missing: 'Missing',
        Uploaded: 'Uploaded',
        Accepted: 'Accepted',
        Rejected: 'Rejected',
        NotNeeded: 'NotNeeded'
    }
}));
vi.mock('@/api', () => ({
    BASE_URL: 'http://localhost:3000',
    updateProfileDocumentStatus: vi.fn()
}));
vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        STUDENT_DATABASE_STUDENTID_LINK: (_id: string, _hash: string) =>
            `/student/${_id}`,
        TEAM_AGENT_LINK: (id: string) => `/agent/${id}`,
        PROFILE_HASH: '#profile'
    }
}));
vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="mrt" />,
    useMaterialReactTable: vi.fn(() => ({}))
}));
vi.mock('./AcceptedFilePreviewModal', () => ({
    default: () => <div data-testid="accepted-file-preview-modal" />
}));
vi.mock('@utils/contants', () => ({
    FILE_DONT_CARE_SYMBOL: '-',
    FILE_MISSING_SYMBOL: '?',
    FILE_NOT_OK_SYMBOL: 'X',
    FILE_OK_SYMBOL: 'OK',
    FILE_UPLOADED_SYMBOL: '^'
}));

describe('BaseDocumentsTable', () => {
    test('renders MaterialReactTable', () => {
        render(
            <MemoryRouter>
                <BaseDocumentsTable students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mrt')).toBeInTheDocument();
    });

    test('renders statistics card for Total Students', () => {
        render(
            <MemoryRouter>
                <BaseDocumentsTable students={[]} />
            </MemoryRouter>
        );
        expect(screen.getByText('Total Students')).toBeInTheDocument();
    });
});
