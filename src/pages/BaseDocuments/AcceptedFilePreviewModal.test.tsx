import { render, screen } from '@testing-library/react';
import AcceptProfileFileModel from './AcceptedFilePreviewModal';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));
vi.mock('@components/FilePreview/FilePreview', () => ({
    default: () => <div data-testid="file-preview" />
}));
vi.mock('@/api', () => ({ BASE_URL: 'http://localhost:3000' }));
vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false)
}));
vi.mock('@taiger-common/model', () => ({
    DocumentStatusType: { Rejected: 'Rejected' }
}));

const defaultProps = {
    closePreviewWindow: vi.fn(),
    showPreview: true,
    path: 'test-document.pdf',
    k: 'passport',
    onUpdateProfileDocStatus: vi.fn(),
    isLoaded: true,
    student_id: 'stu1',
    preview_path: 'stu1/test-document.pdf'
};

describe('AcceptProfileFileModel', () => {
    test('renders dialog with path as title', () => {
        render(<AcceptProfileFileModel {...defaultProps} />);
        expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    });

    test('renders FilePreview component', () => {
        render(<AcceptProfileFileModel {...defaultProps} />);
        expect(screen.getByTestId('file-preview')).toBeInTheDocument();
    });

    test('renders Close button when isLoaded is true', () => {
        render(<AcceptProfileFileModel {...defaultProps} />);
        expect(screen.getByText('Close')).toBeInTheDocument();
    });
});
