import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProgramEditPage from './ProgramEditPage';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLoaderData: () => ({
            distinctSchools: Promise.resolve([
                { school: 'TU Berlin', count: 10 }
            ])
        }),
        useNavigate: () => vi.fn(),
        useParams: () => ({ programId: 'prog1' })
    };
});

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useMutation: () => ({
            mutate: vi.fn(),
            isPending: false
        })
    };
});

vi.mock('@hooks/useProgram', () => ({
    useProgram: () => ({
        data: {
            data: {
                _id: 'prog1',
                school: 'TU Berlin',
                program_name: 'CS',
                degree: 'Master'
            }
        },
        isLoading: false
    })
}));

vi.mock('@/api', () => ({
    updateProgramV2: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`
    }
}));

vi.mock('./NewProgramEdit', () => ({
    default: () => <div data-testid="new-program-edit" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

describe('ProgramEditPage', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ProgramEditPage />
            </MemoryRouter>
        );
    });

    it('renders without crashing', async () => {
        expect(
            await screen.findByTestId('new-program-edit')
        ).toBeInTheDocument();
    });

    it('renders NewProgramEdit after data loads', async () => {
        const editor = await screen.findByTestId('new-program-edit');
        expect(editor).toBeInTheDocument();
    });

    it('renders a Box container', async () => {
        // Wait for suspended Await to resolve so updates happen inside act()
        await screen.findByTestId('new-program-edit');
        expect(document.querySelector('div')).toBeInTheDocument();
    });
});
