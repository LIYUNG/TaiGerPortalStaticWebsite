import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyDocumentCard from './MyDocumentCard';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));
vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => false),
    is_TaiGer_AdminAgent: vi.fn(() => true),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false)
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
    updateProfileDocumentStatusV2: vi.fn(),
    uploadforstudentV2: vi.fn(),
    deleteFileV2: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));
vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return {
        ...actual,
        useMutation: vi.fn(() => ({
            mutate: vi.fn(),
            isPending: false
        }))
    };
});
vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));
vi.mock('@components/FilePreview/FilePreview', () => ({
    default: () => <div data-testid="file-preview" />
}));
vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));
vi.mock('@components/Offcanvas/OffcanvasBaseDocument', () => ({
    default: () => <div data-testid="offcanvas-base-document" />
}));
vi.mock('@components/Buttons/Button', () => ({
    CommentsIconButton: () => <button data-testid="comments-btn" />,
    DeleteIconButton: () => <button data-testid="delete-btn" />,
    DownloadIconButton: () => <button data-testid="download-btn" />,
    SetNeededIconButton: () => <button data-testid="set-needed-btn" />,
    SetNotNeededIconButton: () => <button data-testid="set-not-needed-btn" />,
    UploadIconButton: () => <button data-testid="upload-btn" />
}));
vi.mock('@utils/contants', () => ({
    FILE_DONT_CARE_SYMBOL: '-',
    FILE_MISSING_SYMBOL: '?',
    FILE_NOT_OK_SYMBOL: 'X',
    FILE_OK_SYMBOL: 'OK',
    FILE_UPLOADED_SYMBOL: '^',
    base_documents_checklist: {},
    convertDate: (d: string) => d
}));

const student = {
    _id: { toString: () => 'stu1' },
    firstname: 'John',
    lastname: 'Doe',
    profile: []
};

const defaultProps = {
    status: 'Missing',
    document_name: '',
    student: student as any,
    link: '',
    message: '',
    isLoaded: true,
    category: 'passport',
    docName: 'Passport',
    time: '',
    updateDocLink: vi.fn()
};

describe('MyDocumentCard', () => {
    test('renders without crashing', () => {
        const { container } = render(
            <MemoryRouter>
                <MyDocumentCard {...defaultProps} />
            </MemoryRouter>
        );
        expect(container).toBeInTheDocument();
    });
});
