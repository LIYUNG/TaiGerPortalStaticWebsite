import { render, screen } from '@testing-library/react';

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

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig<typeof import('@tanstack/react-query')>()),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false }))
}));

vi.mock('@/api', () => ({
    IgnoreMessageV2: vi.fn(),
    BASE_URL: 'http://localhost:3000',
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@components/EditorJs/EditorSimple', () => ({
    default: () => <div data-testid="editor-simple" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('@components/FilePreview/FilePreview', () => ({
    default: () => <div data-testid="file-preview" />
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: (name: string) => ({ children: name[0], sx: {} }),
    convertDate: (d: string) => d ?? '',
    convertDateUXFriendly: (d: string) => d ?? ''
}));

vi.mock('react-file-icon', () => ({
    FileIcon: () => <svg data-testid="file-icon" />,
    defaultStyles: {}
}));

import Message from './Message';

const baseMessage = {
    _id: 'msg1',
    message: JSON.stringify({
        time: 1,
        blocks: [{ type: 'paragraph', data: { text: 'Hello' } }]
    }),
    createdAt: '2024-01-01',
    user_id: {
        _id: 'other-user',
        firstname: 'Bob',
        lastname: 'Smith',
        pictureUrl: ''
    },
    files: [],
    student_id: { _id: 'stu1', firstname: 'Jane', lastname: 'Doe' },
    readBy: [],
    ignore_message: false
};

describe('Message', () => {
    test('shows loading state initially before editorState resolves', () => {
        render(
            <Message
                accordionKeys={[0]}
                handleClickSave={vi.fn()}
                idx={0}
                isDeleting={false}
                isLoaded={false}
                isTaiGerView={false}
                message={baseMessage as never}
                onDeleteSingleMessage={vi.fn()}
                onEditMode={vi.fn()}
                path=""
            />
        );
        // Initially shows loading since editorState is null
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('renders without crashing when message has no user_id', () => {
        const msg = { ...baseMessage, user_id: null };
        render(
            <Message
                accordionKeys={[0]}
                handleClickSave={vi.fn()}
                idx={0}
                isDeleting={false}
                isLoaded={false}
                isTaiGerView={false}
                message={msg as never}
                onDeleteSingleMessage={vi.fn()}
                onEditMode={vi.fn()}
                path=""
            />
        );
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
});
