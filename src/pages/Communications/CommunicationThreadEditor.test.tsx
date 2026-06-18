import { render, screen, waitFor } from '@testing-library/react';
import type { OutputData } from '@editorjs/editorjs';

// Shared spies/state for the mocked ComposeEditor + draft hook.
const { restoreSpy, draftState, draftHook } = vi.hoisted(() => ({
    restoreSpy: vi.fn(),
    draftState: { value: null as OutputData | null },
    draftHook: {
        saveDraft: vi.fn(),
        clearDraft: vi.fn()
    }
}));

vi.mock('react-router-dom', async (orig) => ({
    ...(await orig<typeof import('react-router-dom')>()),
    useParams: () => ({ studentId: 'stu1' })
}));

vi.mock('@hooks/useCommunicationDraft', () => ({
    default: () => ({
        draft: draftState.value,
        isDraftLoaded: true,
        status: 'idle',
        saveDraft: draftHook.saveDraft,
        clearDraft: draftHook.clearDraft
    })
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

vi.mock('@components/EditorJs/ComposeEditor', async () => {
    const React = await import('react');
    return {
        default: React.forwardRef(function MockComposeEditor(_props, ref) {
            React.useImperativeHandle(ref, () => ({
                getValue: () => ({ blocks: [] }),
                reset: vi.fn(),
                restore: restoreSpy,
                isEmpty: () => true
            }));
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
    beforeEach(() => {
        draftState.value = null;
        restoreSpy.mockClear();
        draftHook.saveDraft.mockClear();
        draftHook.clearDraft.mockClear();
    });

    test('restores a saved draft into the (empty) editor on load', async () => {
        const draft: OutputData = {
            time: 1,
            blocks: [{ id: 'b1', type: 'paragraph', data: { text: 'wip' } }]
        } as OutputData;
        draftState.value = draft;
        render(
            <CommunicationThreadEditor
                editorState={{ blocks: [] }}
                files={[]}
                handleClickSave={vi.fn()}
                thread={[]}
            />
        );
        await waitFor(() => expect(restoreSpy).toHaveBeenCalledWith(draft));
    });

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

    test('renders the attach-file action in the composer', () => {
        render(
            <CommunicationThreadEditor
                editorState={{ blocks: [] }}
                files={[]}
                handleClickSave={vi.fn()}
                thread={[]}
            />
        );
        expect(screen.getByLabelText('attach file')).toBeInTheDocument();
    });
});
