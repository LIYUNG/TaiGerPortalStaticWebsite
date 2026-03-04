import { render, screen } from '@testing-library/react';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Agent',
            _id: 'agent1',
            firstname: 'Agent',
            lastname: 'One'
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
    updateAMessageInCommunicationThreadV2: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('./Message', () => ({
    default: ({ message }: { message: { _id: string } }) => (
        <div data-testid={`message-${message._id}`} />
    )
}));

vi.mock('./MessageEdit', () => ({
    default: () => <div data-testid="message-edit" />
}));

import MessageContainer from './MessageContainer';

const makeMessage = (id: string) => ({
    _id: id,
    message: '{}',
    createdAt: '2024-01-01',
    user_id: {
        _id: 'agent1',
        firstname: 'Agent',
        lastname: 'One',
        pictureUrl: ''
    }
});

describe('MessageContainer', () => {
    test('renders Message component by default', () => {
        render(
            <MessageContainer
                accordionKeys={[0]}
                idx={0}
                isDeleting={false}
                isTaiGerView={false}
                message={makeMessage('msg1')}
                student_id="stu1"
            />
        );
        expect(screen.getByTestId('message-msg1')).toBeInTheDocument();
    });

    test('renders with no user_id on message', () => {
        const msg = { ...makeMessage('msg2'), user_id: null };
        render(
            <MessageContainer
                accordionKeys={[0]}
                idx={0}
                isDeleting={false}
                isTaiGerView={false}
                message={msg}
                student_id="stu1"
            />
        );
        expect(screen.getByTestId('message-msg2')).toBeInTheDocument();
    });
});
