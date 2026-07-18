import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { IStudentResponse } from '@taiger-common/model';
import MyDocumentCard from './MyDocumentCard';

// hoisted: vi.mock factories are lifted above normal top-level consts.
const { CHECK_ITEMS } = vi.hoisted(() => ({
    CHECK_ITEMS: [
        'English version ?',
        'School Stamp or signature',
        'Date of referral ?'
    ]
}));

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
    // Wired up: this is what opens the preview dialog under test.
    DownloadIconButton: ({ showPreview }: { showPreview?: () => void }) => (
        <button data-testid="download-btn" onClick={showPreview} />
    ),
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
    base_documents_checklist: {
        High_School_Diploma: CHECK_ITEMS
    },
    convertDate: (d: string) => d
}));

// Only the fields MyDocumentCard actually reads; cast through unknown because
// this is deliberately a partial stand-in for the full IStudentResponse.
const student = {
    _id: { toString: () => 'stu1' },
    firstname: 'John',
    lastname: 'Doe',
    profile: []
} as unknown as IStudentResponse;

const defaultProps = {
    status: 'Missing',
    document_name: '',
    student,
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

    describe('preview dialog checklist', () => {
        // The download icon button is what opens the preview, and it only
        // renders for these statuses.
        const checklistProps = {
            ...defaultProps,
            status: 'Uploaded',
            category: 'High_School_Diploma'
        };

        const openPreview = (props = checklistProps) => {
            render(
                <MemoryRouter>
                    <MyDocumentCard {...props} />
                </MemoryRouter>
            );
            fireEvent.click(screen.getByTestId('download-btn'));
        };

        const dialog = () => screen.getByRole('dialog');
        const acceptButton = () =>
            within(dialog()).getByRole('button', { name: /Accept/ });
        const checkboxFor = (label: string) =>
            within(dialog()).getByRole('checkbox', { name: label });

        test('renders every checklist point for the category', () => {
            openPreview();
            for (const item of CHECK_ITEMS) {
                expect(checkboxFor(item)).toBeInTheDocument();
            }
            expect(within(dialog()).getByText('0 / 3')).toBeInTheDocument();
        });

        test('keeps Accept disabled until every point is checked', () => {
            openPreview();
            expect(acceptButton()).toBeDisabled();

            fireEvent.click(checkboxFor(CHECK_ITEMS[0]));
            fireEvent.click(checkboxFor(CHECK_ITEMS[1]));
            expect(acceptButton()).toBeDisabled();
            expect(within(dialog()).getByText('2 / 3')).toBeInTheDocument();

            fireEvent.click(checkboxFor(CHECK_ITEMS[2]));
            expect(acceptButton()).toBeEnabled();
            expect(within(dialog()).getByText('3 / 3')).toBeInTheDocument();
        });

        test('unchecking a point disables Accept again', () => {
            openPreview();
            for (const item of CHECK_ITEMS) {
                fireEvent.click(checkboxFor(item));
            }
            expect(acceptButton()).toBeEnabled();

            fireEvent.click(checkboxFor(CHECK_ITEMS[1]));
            expect(checkboxFor(CHECK_ITEMS[1])).not.toBeChecked();
            expect(acceptButton()).toBeDisabled();
        });

        test('Check all / Clear all toggles every point at once', () => {
            openPreview();

            fireEvent.click(
                within(dialog()).getByRole('button', { name: /Check all/ })
            );
            for (const item of CHECK_ITEMS) {
                expect(checkboxFor(item)).toBeChecked();
            }
            expect(acceptButton()).toBeEnabled();

            fireEvent.click(
                within(dialog()).getByRole('button', { name: /Clear all/ })
            );
            for (const item of CHECK_ITEMS) {
                expect(checkboxFor(item)).not.toBeChecked();
            }
            expect(acceptButton()).toBeDisabled();
        });

        // Regression: checkedBoxes used to survive a close while the rendered
        // checkboxes reset, so reopening showed an empty checklist with Accept
        // already enabled.
        test('resets the checklist when the dialog is reopened', () => {
            openPreview();
            fireEvent.click(
                within(dialog()).getByRole('button', { name: /Check all/ })
            );
            expect(acceptButton()).toBeEnabled();

            fireEvent.click(
                within(dialog()).getByRole('button', { name: /Close/ })
            );
            fireEvent.click(screen.getByTestId('download-btn'));

            for (const item of CHECK_ITEMS) {
                expect(checkboxFor(item)).not.toBeChecked();
            }
            expect(acceptButton()).toBeDisabled();
        });

        test('shows no checklist for a category that has none', () => {
            openPreview({ ...checklistProps, category: 'passport' });

            expect(
                within(dialog()).queryByRole('checkbox')
            ).not.toBeInTheDocument();
            // Nothing to confirm, so Accept must not be blocked.
            expect(acceptButton()).toBeEnabled();
        });
    });
});
