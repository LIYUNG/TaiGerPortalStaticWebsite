import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocModificationThreadPage from './DocModificationThreadPage';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: { toString: () => 'a1' } } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ documentsthreadId: 'thread123' }),
        useLocation: () => ({ hash: '' }),
        useNavigate: () => vi.fn()
    };
});

vi.mock('../../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('../../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('@components/Tabs', () => ({
    CustomTabPanel: ({ children, index, value }: { children: React.ReactNode; index: number; value: number }) =>
        index === value ? <div data-testid={`tab-panel-${index}`}>{children}</div> : null,
    a11yProps: () => ({})
}));

vi.mock('./FilesList', () => ({
    default: () => <div data-testid="files-list" />
}));

vi.mock('../../Audit', () => ({
    default: () => <div data-testid="audit" />
}));

vi.mock('./DocumentCheckingResultModal', () => ({
    default: () => <div data-testid="document-checking-result-modal" />
}));

vi.mock('./DocumentThreadsPage/GeneralRLRequirementsTab', () => ({
    default: () => <div data-testid="general-rl-requirements-tab" />
}));

vi.mock('@pages/Dashboard/MainViewTab/StudDocsOverview/EditEssayWritersSubpage', () => ({
    default: () => <div data-testid="edit-essay-writers-subpage" />
}));

vi.mock('@components/Message/MessageList', () => ({
    default: () => <div data-testid="message-list" />
}));

vi.mock('@pages/CVMLRLCenter/DocModificationThreadPage/components/InformationBlock', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="information-block">{children}</div>
    )
}));

vi.mock('./components/SimilarThreadsTab', () => ({
    default: () => <div data-testid="similar-threads-tab" />
}));

vi.mock('./components/DiscussionEditorCard', () => ({
    default: () => <div data-testid="discussion-editor-card" />
}));

vi.mock('@utils/contants', () => ({
    templatelist: [],
    THREAD_TABS: {}
}));

vi.mock('../../Utils/util_functions', () => ({
    FILE_TYPE_E: { essay_required: 'Essay' },
    readDOCX: vi.fn(),
    readPDF: vi.fn(),
    readXLSX: vi.fn(),
    toogleItemInArray: vi.fn(() => []),
    calculateProgramLockStatus: vi.fn(() => ({ isLocked: false })),
    calculateApplicationLockStatus: vi.fn(() => ({ isLocked: false }))
}));

vi.mock('@/api', () => ({
    SubmitMessageWithAttachment: vi.fn(),
    deleteAMessageInThread: vi.fn(),
    SetFileAsFinal: vi.fn(),
    updateEssayWriter: vi.fn(),
    putThreadFavorite: vi.fn()
}));

vi.mock('../../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('react-pdf', () => ({
    pdfjs: { GlobalWorkerOptions: {}, version: '3.0.0' }
}));

vi.mock('i18next', () => ({
    default: { t: (key: string) => key }
}));

const mockThread = {
    _id: 'thread123',
    file_type: 'CV',
    student_id: {
        _id: { toString: () => 'student1' },
        firstname: 'John',
        lastname: 'Doe'
    },
    isFinalVersion: false,
    flag_by_user_id: [],
    messages: []
};

describe('DocModificationThreadPage', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <DocModificationThreadPage threadProps={mockThread} />
            </MemoryRouter>
        );
    });

    it('renders the tabs', () => {
        expect(screen.getAllByRole('tab').length).toBeGreaterThan(0);
    });

    it('renders the discussion tab panel by default', () => {
        expect(screen.getByTestId('tab-panel-0')).toBeInTheDocument();
    });

    it('renders the information block', () => {
        expect(screen.getByTestId('information-block')).toBeInTheDocument();
    });

    it('renders the document checking result modal', () => {
        expect(screen.getByTestId('document-checking-result-modal')).toBeInTheDocument();
    });
});
