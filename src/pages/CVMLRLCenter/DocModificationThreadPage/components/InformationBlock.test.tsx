import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import InformationBlock from './InformationBlock';

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_AdminAgent: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/programs/${id}`,
        TEAM_AGENT_LINK: (id: string) => `/teams/agents/${id}`,
        TEAM_EDITOR_LINK: (id: string) => `/teams/editors/${id}`,
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/students/${id}${hash}`,
        CVMLRL_HASH: '#cvmlrl',
        CV_ML_RL_DOCS_LINK: '/docs',
        DOCUMENT_MODIFICATION_INPUT_LINK: (id: string) => `/docs/${id}`
    }
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: () => ({ children: 'AB', sx: {} })
}));

vi.mock('../../../Utils/util_functions', () => ({
    AGENT_SUPPORT_DOCUMENTS_A: [],
    FILE_TYPE_E: { essay_required: 'Essay' }
}));

vi.mock('@components/TopBar/TopBar', () => ({
    TopBar: () => <div data-testid="top-bar">TopBar</div>
}));

vi.mock('./OriginAuthorStatementBar', () => ({
    default: () => <div data-testid="origin-author-bar">OriginAuthorStatementBar</div>
}));

vi.mock('./DescriptionBlock', () => ({
    default: () => <div data-testid="description-block">DescriptionBlock</div>
}));

vi.mock('./RequirementsBlock', () => ({
    default: () => <div data-testid="requirements-block">RequirementsBlock</div>
}));

vi.mock('@/api', () => ({
    BASE_URL: 'http://localhost:3000'
}));

const theme = createTheme();

const baseThread = {
    _id: 'thread-1',
    isFinalVersion: false,
    file_type: 'ML',
    program_id: null,
    student_id: {
        _id: 'student-1',
        firstname: 'Jane',
        lastname: 'Doe',
        firstname_chinese: '',
        lastname_chinese: ''
    },
    outsourced_user_id: [],
    isOriginAuthorDeclarationConfirmedByStudent: false
} as any;

const baseUser = {
    _id: 'user-1',
    role: 'Student',
    firstname: 'Jane',
    lastname: 'Doe'
} as any;

const defaultProps = {
    agents: [],
    deadline: '2099-12-31',
    editors: [],
    conflict_list: [],
    documentsthreadId: 'thread-1',
    isFavorite: false,
    isGeneralRL: false,
    template_obj: null,
    startEditingEditor: vi.fn(),
    handleFavoriteToggle: vi.fn(),
    thread: baseThread,
    user: baseUser,
    children: <div data-testid="children-content">Thread Content</div>
};

const renderBlock = (props = {}) =>
    render(
        <MemoryRouter>
            <ThemeProvider theme={theme}>
                <InformationBlock {...defaultProps} {...props} />
            </ThemeProvider>
        </MemoryRouter>
    );

describe('InformationBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderBlock();
        expect(screen.getByTestId('children-content')).toBeInTheDocument();
    });

    it('shows deadline section', () => {
        renderBlock({ deadline: '2099-12-31' });
        expect(screen.getByText('2099-12-31')).toBeInTheDocument();
    });

    it('shows team section with Your Team heading', () => {
        renderBlock();
        expect(screen.getByText('Your Team')).toBeInTheDocument();
    });

    it('renders the children in the right column', () => {
        renderBlock();
        expect(screen.getByText('Thread Content')).toBeInTheDocument();
    });

    it('does not render TopBar when thread is not final version', () => {
        renderBlock({ thread: { ...baseThread, isFinalVersion: false } });
        expect(screen.queryByTestId('top-bar')).not.toBeInTheDocument();
    });

    it('renders TopBar when thread is final version', () => {
        renderBlock({ thread: { ...baseThread, isFinalVersion: true } });
        expect(screen.getByTestId('top-bar')).toBeInTheDocument();
    });

    it('shows No Conflicts badge when conflict_list is empty and user is not student', () => {
        // is_TaiGer_Student is mocked to return false (user is not a student),
        // so the conflict card is rendered and shows "No Conflicts"
        renderBlock({ conflict_list: [] });
        expect(screen.getByText('No Conflicts')).toBeInTheDocument();
    });

    it('renders deadline label', () => {
        renderBlock();
        expect(screen.getByText('Deadline')).toBeInTheDocument();
    });
});
