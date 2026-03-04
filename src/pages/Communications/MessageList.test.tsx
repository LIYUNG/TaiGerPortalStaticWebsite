import { render, screen } from '@testing-library/react';
import MessageList from './MessageList';

vi.mock('./MessageContainer', () => ({
    default: ({ message }: { message: { _id: string } }) => (
        <div data-testid={`message-container-${message._id}`} />
    )
}));

const makeMessage = (id: string) => ({
    _id: id,
    message: '{}',
    createdAt: '2024-01-01',
    user_id: {
        _id: 'u1',
        firstname: 'Alice',
        lastname: 'Smith',
        pictureUrl: ''
    }
});

describe('MessageList', () => {
    test('renders one MessageContainer per thread item', () => {
        const thread = [makeMessage('msg1'), makeMessage('msg2')];
        render(
            <MessageList
                accordionKeys={[0, 1]}
                isUpperMessagList={false}
                student_id="stu1"
                thread={thread}
            />
        );
        expect(
            screen.getByTestId('message-container-msg1')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('message-container-msg2')
        ).toBeInTheDocument();
    });

    test('renders empty list when thread is empty', () => {
        const { container } = render(
            <MessageList
                accordionKeys={[]}
                isUpperMessagList={false}
                student_id="stu1"
                thread={[]}
            />
        );
        expect(container.firstChild).toBeNull();
    });
});
