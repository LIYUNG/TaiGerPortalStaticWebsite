import { render, screen } from '@testing-library/react';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: { role: 'Agent', _id: 'a1', firstname: 'Agent', lastname: 'One' }
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
    postCommunicationThreadV2: vi.fn(),
    deleteAMessageInCommunicationThreadV2: vi.fn(),
    loadCommunicationThread: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@hooks/useCommunications', () => ({
    default: () => ({
        buttonDisabled: false,
        loadButtonDisabled: false,
        isDeleting: false,
        files: [],
        editorState: { blocks: [] },
        checkResult: [],
        accordionKeys: [],
        uppderaccordionKeys: [],
        upperThread: [],
        thread: [],
        count: 0,
        handleLoadMessages: vi.fn(),
        onDeleteSingleMessage: vi.fn(),
        onFileChange: vi.fn(),
        handleClickSave: vi.fn()
    })
}));

vi.mock('./MessageList', () => ({
    default: () => <div data-testid="message-list" />
}));

vi.mock('./CommunicationThreadEditor', () => ({
    default: () => <div data-testid="communication-thread-editor" />
}));

vi.mock('@pages/Utils/util_functions', () => ({
    readPDF: vi.fn(),
    readDOCX: vi.fn(),
    readXLSX: vi.fn()
}));

import CommunicationExpandPageMessagesComponent from './CommunicationExpandPageMessagesComponent';

const mockStudent = {
    _id: 'stu1',
    firstname: 'John',
    lastname: 'Doe',
    archiv: false,
    agents: [],
    editors: []
};

describe('CommunicationExpandPageMessagesComponent', () => {
    test('renders Load button', () => {
        render(
            <CommunicationExpandPageMessagesComponent
                data={[]}
                student={mockStudent as never}
            />
        );
        expect(screen.getByText('Load')).toBeInTheDocument();
    });

    test('renders message list and thread editor when student is active', () => {
        render(
            <CommunicationExpandPageMessagesComponent
                data={[]}
                student={mockStudent as never}
            />
        );
        expect(screen.getByTestId('message-list')).toBeInTheDocument();
        expect(
            screen.getByTestId('communication-thread-editor')
        ).toBeInTheDocument();
    });

    test('shows readonly message when student is archived', () => {
        const archivedStudent = { ...mockStudent, archiv: true };
        render(
            <CommunicationExpandPageMessagesComponent
                data={[]}
                student={archivedStudent as never}
            />
        );
        expect(
            screen.getByText(
                'The service is finished. Therefore, it is readonly.'
            )
        ).toBeInTheDocument();
    });
});
