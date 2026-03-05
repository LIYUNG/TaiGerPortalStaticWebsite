import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

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

vi.mock('@components/TopBar/TopBar', () => ({
    TopBar: () => <div data-testid="top-bar" />
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/dashboard',
        SURVEY_LINK: '/survey',
        BASE_DOCUMENTS_LINK: '/documents',
        COURSES_LINK: '/courses',
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/students/${id}#${hash}`,
        TEAM_AGENT_PROFILE_LINK: (id: string) => `/team/${id}`,
        SURVEY_HASH: 'survey',
        PROFILE_HASH: 'profile'
    }
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));

vi.mock('@pages/Utils/util_functions', () => ({
    readPDF: vi.fn(),
    readDOCX: vi.fn(),
    readXLSX: vi.fn()
}));

import CommunicationSinglePageBody from './CommunicationSinglePageBody';

const mockLoadedData = {
    data: [],
    student: {
        _id: 'stu1',
        firstname: 'John',
        lastname: 'Doe',
        archiv: false,
        agents: [],
        editors: []
    }
};

describe('CommunicationSinglePageBody', () => {
    test('renders Load button and message list', () => {
        render(
            <BrowserRouter>
                <CommunicationSinglePageBody
                    loadedData={mockLoadedData as never}
                />
            </BrowserRouter>
        );
        expect(screen.getByText('Load')).toBeInTheDocument();
        expect(screen.getByTestId('message-list')).toBeInTheDocument();
    });

    test('renders thread editor when student is active', () => {
        render(
            <BrowserRouter>
                <CommunicationSinglePageBody
                    loadedData={mockLoadedData as never}
                />
            </BrowserRouter>
        );
        expect(
            screen.getByTestId('communication-thread-editor')
        ).toBeInTheDocument();
    });

    test('shows readonly message when student is archived', () => {
        const archivedData = {
            ...mockLoadedData,
            student: { ...mockLoadedData.student, archiv: true }
        };
        render(
            <BrowserRouter>
                <CommunicationSinglePageBody
                    loadedData={archivedData as never}
                />
            </BrowserRouter>
        );
        expect(
            screen.getByText(
                'The service is finished. Therefore, it is readonly.'
            )
        ).toBeInTheDocument();
    });
});
