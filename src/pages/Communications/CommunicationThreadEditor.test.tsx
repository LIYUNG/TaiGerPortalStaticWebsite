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

vi.mock('@components/EditorJs/ComposeEditor', async (importOriginal) => {
    const React = await import('react');
    return {
        default: React.forwardRef(function MockComposeEditor(
            _props: unknown,
            _ref: unknown
        ) {
            return <div data-testid="compose-editor" />;
        })
    };
});

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
    test('renders compose editor component', () => {
        render(
            <CommunicationThreadEditor
                editorState={{ blocks: [] }}
                files={[]}
                handleClickSave={vi.fn()}
                thread={[]}
            />
        );
        expect(screen.getByTestId('compose-editor')).toBeInTheDocument();
    });

    test('renders Send button', () => {
        render(
            <CommunicationThreadEditor
                editorState={{ blocks: [] }}
                files={[]}
                handleClickSave={vi.fn()}
                thread={[]}
            />
        );
        expect(screen.getByText('Send')).toBeInTheDocument();
    });

    test('shows user name in editor header', () => {
        render(
            <CommunicationThreadEditor
                editorState={{ blocks: [] }}
                files={[]}
                handleClickSave={vi.fn()}
                thread={[]}
            />
        );
        expect(screen.getByText('Agent One')).toBeInTheDocument();
    });
});
