import { render, screen, fireEvent } from '@testing-library/react';
import DiscussionEditorCard from './DiscussionEditorCard';
import type { DiscussionEditorCardProps } from './DiscussionEditorCard';

vi.mock('@components/Message/DocThreadEditor', () => ({
    default: ({
        handleClickSave
    }: {
        handleClickSave: (
            e: React.MouseEvent<HTMLElement>,
            state: unknown
        ) => void;
    }) => (
        <div data-testid="doc-thread-editor">
            <button
                onClick={(e) =>
                    handleClickSave(
                        e as unknown as React.MouseEvent<HTMLElement>,
                        {}
                    )
                }
            >
                Send
            </button>
        </div>
    )
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: vi.fn(() => ({ children: 'JD' }))
}));

vi.mock('i18next', () => ({
    default: {
        t: (key: string) => key
    }
}));

const t = (key: string) => key;

const baseUser = {
    firstname: 'Jane',
    lastname: 'Doe',
    _id: '1',
    archiv: false
};

const baseThread = {
    isFinalVersion: false,
    _id: '1',
    student_id: { _id: '1' }
};

const baseProps: DiscussionEditorCardProps = {
    isReadOnlyThread: false,
    isLocked: false,
    lockTooltip: 'locked msg',
    user: baseUser,
    thread: baseThread,
    buttonDisabled: false,
    checkResult: [],
    editorState: {},
    file: null,
    isSubmissionLoaded: true,
    isTaiGerUser: true,
    handleAsFinalFile: vi.fn(),
    handleClickSave: vi.fn(),
    onFileChange: vi.fn(),
    t
};

describe('DiscussionEditorCard', () => {
    beforeEach(() => {
        render(<DiscussionEditorCard {...baseProps} />);
    });

    it('renders DocThreadEditor when not read-only and not archived', () => {
        expect(screen.getByTestId('doc-thread-editor')).toBeInTheDocument();
    });

    it('renders Mark as finished button for TaiGer users when not locked', () => {
        expect(
            screen.getByRole('button', { name: 'Mark as finished' })
        ).toBeInTheDocument();
    });

    describe('with different props', () => {
        it('renders "read-only mode" message when user is archived', () => {
            render(
                <DiscussionEditorCard
                    {...baseProps}
                    user={{ ...baseUser, archiv: true }}
                />
            );
            expect(
                screen.getByText(
                    /Your service is finished. Therefore, you are in read-only mode./
                )
            ).toBeInTheDocument();
        });

        it('renders lock warning icon when isLocked is true and thread is read-only', () => {
            render(
                <DiscussionEditorCard
                    {...baseProps}
                    isLocked={true}
                    isReadOnlyThread={true}
                />
            );
            // The lockTooltip text is shown when isLocked is true
            expect(screen.getByText('locked msg')).toBeInTheDocument();
        });

        it('renders checkmark icon when thread is finished (isReadOnlyThread and not isLocked)', () => {
            render(
                <DiscussionEditorCard
                    {...baseProps}
                    isLocked={false}
                    isReadOnlyThread={true}
                />
            );
            // i18next.t('thread-close') returns 'thread-close' from our mock
            expect(screen.getByText('thread-close')).toBeInTheDocument();
        });

        it('renders Mark as open button when isFinalVersion is true and not locked', () => {
            render(
                <DiscussionEditorCard
                    {...baseProps}
                    thread={{ ...baseThread, isFinalVersion: true }}
                />
            );
            expect(
                screen.getByRole('button', { name: 'Mark as open' })
            ).toBeInTheDocument();
        });

        it('calls handleAsFinalFile when Mark as finished button is clicked', () => {
            const handleAsFinalFile = vi.fn();
            render(
                <DiscussionEditorCard
                    {...baseProps}
                    handleAsFinalFile={handleAsFinalFile}
                />
            );
            fireEvent.click(
                screen.getAllByRole('button', { name: 'Mark as finished' })[1]
            );
            expect(handleAsFinalFile).toHaveBeenCalledTimes(1);
        });
    });
});
