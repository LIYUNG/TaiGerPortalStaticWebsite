import { render, screen } from '@testing-library/react';

vi.mock('react-router-dom', async (orig) => ({
    ...(await orig<typeof import('react-router-dom')>()),
    useParams: () => ({ studentId: 'stu1' })
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Agent',
            _id: 'a1',
            firstname: 'Agent',
            lastname: 'One',
            pictureUrl: ''
        }
    })
}));

vi.mock('@components/EditorJs/EditorSimple', () => ({
    default: () => <div data-testid="editor-simple" />
}));

vi.mock('@/api', () => ({
    TaiGerChatAssistant: vi.fn(),
    BASE_URL: 'http://localhost:3000'
}));

vi.mock('react-markdown', () => ({
    default: ({ children }: { children: string }) => <span>{children}</span>
}));

vi.mock('remark-gfm', () => ({ default: () => undefined }));

vi.mock('@utils/contants', () => ({
    stringAvatar: (name: string) => ({ children: name[0], sx: {} }),
    CVMLRL_DOC_PRECHECK_STATUS_E: {
        OK_SYMBOL: '✓',
        NOT_OK_SYMBOL: '✗',
        WARNING_SYMBOK: '⚠'
    },
    convertDate: (d: string) => d
}));

import CommunicationThreadEditor from './CommunicationThreadEditor';

describe('CommunicationThreadEditor', () => {
    test('renders editor simple component', () => {
        render(
            <CommunicationThreadEditor
                buttonDisabled={false}
                editorState={{ blocks: [] }}
                files={[]}
                handleClickSave={vi.fn()}
                onFileChange={vi.fn()}
                thread={[]}
            />
        );
        expect(screen.getByTestId('editor-simple')).toBeInTheDocument();
    });

    test('renders Send button', () => {
        render(
            <CommunicationThreadEditor
                buttonDisabled={false}
                editorState={{ blocks: [] }}
                files={[]}
                handleClickSave={vi.fn()}
                onFileChange={vi.fn()}
                thread={[]}
            />
        );
        expect(screen.getByText('Send')).toBeInTheDocument();
    });

    test('shows user name in editor header', () => {
        render(
            <CommunicationThreadEditor
                buttonDisabled={false}
                editorState={{ blocks: [] }}
                files={[]}
                handleClickSave={vi.fn()}
                onFileChange={vi.fn()}
                thread={[]}
            />
        );
        expect(screen.getByText('Agent One')).toBeInTheDocument();
    });
});
