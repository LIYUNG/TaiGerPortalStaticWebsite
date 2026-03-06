import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocModificationThreadInput from './DocModificationThreadInput';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        STUDENT_DATABASE_STUDENTID_LINK: () => '/student/123',
        DOCUMENT_MODIFICATION_LINK: () => '/doc/123',
        CVMLRL_HASH: '#cvmlrl'
    }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ documentsthreadId: 'thread123' }),
        useNavigate: () => vi.fn()
    };
});

vi.mock('../../Utils/ErrorPage', () => ({
    default: () => <div data-testid="error-page" />
}));

vi.mock('../../Utils/ModalHandler/ModalMain', () => ({
    default: () => <div data-testid="modal-main" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('../../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@utils/contants', () => ({
    prepQuestions: vi.fn(() => []),
    convertDate: vi.fn(() => '2025-01-01')
}));

vi.mock('../../Utils/checking-functions', () => ({
    LinkableNewlineText: ({ text }: { text: string }) => <div>{text}</div>
}));

vi.mock('../../Utils/util_functions', () => ({
    getRequirement: vi.fn(() => 'requirement text')
}));

vi.mock('@/api', () => ({
    cvmlrlAi2: vi.fn(),
    getSurveyInputs: vi.fn(() =>
        Promise.resolve({
            data: {
                success: true,
                status: 200,
                data: {
                    file_type: 'CV',
                    student_id: { _id: { toString: () => 'student1' }, firstname: 'John', lastname: 'Doe' },
                    program_id: null,
                    surveyInputs: {
                        general: {
                            surveyContent: [
                                { questionId: 'q1', question: 'Question 1', answer: '', type: 'paragraph' }
                            ]
                        }
                    }
                }
            }
        })
    ),
    putSurveyInput: vi.fn(),
    postSurveyInput: vi.fn()
}));

describe('DocModificationThreadInput', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <DocModificationThreadInput />
            </MemoryRouter>
        );
    });

    it('renders loading state initially', () => {
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('does not render error page while loading', () => {
        expect(screen.queryByTestId('error-page')).not.toBeInTheDocument();
    });

    it('does not render modal while loading', () => {
        expect(screen.queryByTestId('modal-main')).not.toBeInTheDocument();
    });

    it('renders without crashing', () => {
        const loadingOrContent = screen.queryByTestId('loading');
        expect(loadingOrContent).not.toBeNull();
    });
});
