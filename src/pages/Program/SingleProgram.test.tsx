import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import SingleProgram from './SingleProgram';
import { useAuth } from '@components/AuthProvider';
import { mockSingleProgramNoStudentsData } from '../../test/testingSingleProgramPageData';

const mockLoaderData = {
    data: Promise.resolve({
        data: mockSingleProgramNoStudentsData.data,
        students: [],
        vc: []
    })
};

vi.mock('react-router-dom', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('react-router-dom');
    return {
        ...actual,
        useLoaderData: () => mockLoaderData,
        useNavigate: () => vi.fn(),
        useRevalidator: () => ({ revalidate: vi.fn() })
    };
});

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('@tanstack/react-query');
    return {
        ...actual,
        useMutation: () => ({
            mutate: vi.fn(),
            isPending: false
        })
    };
});

vi.mock('@components/AuthProvider');
vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('./SingleProgramView', () => ({
    default: () =>
        createElement('div', { 'data-testid': 'single-program-view' })
}));
vi.mock('./ProgramDeleteWarning', () => ({
    default: () => null
}));
vi.mock('./AssignProgramsToStudentDialog', () => ({
    AssignProgramsToStudentDialog: () => null
}));
vi.mock('./ProgramDiffModal', () => ({
    default: () => null
}));

describe('Single Program Page checking', () => {
    beforeEach(() => {
        vi.mocked(useAuth).mockReturnValue({
            user: { role: 'Student', _id: '639baebf8b84944b872cf648' },
            isAuthenticated: true,
            isLoaded: true,
            login: vi.fn(),
            logout: vi.fn()
        } as never);
    });

    it('renders without crashing', async () => {
        render(<SingleProgram />);
        expect(screen.getByTestId('single_program_page')).toBeInTheDocument();
        await screen.findByTestId('single-program-view');
    });

    it('renders SingleProgramView when loader data resolves', async () => {
        render(<SingleProgram />);
        expect(
            await screen.findByTestId('single-program-view')
        ).toBeInTheDocument();
    });
});
