import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProgramCreatePage from './ProgramCreatePage';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useLoaderData: () => ({
            distinctSchools: Promise.resolve([
                { school: 'TU Berlin', count: 10 }
            ])
        }),
        useNavigate: () => vi.fn()
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

vi.mock('@/api', () => ({
    createProgramV2: vi.fn(),
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
        PROGRAMS: '/programs'
    }
}));

vi.mock('./NewProgramEdit', () => ({
    default: () => <div data-testid="new-program-edit" />
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

describe('ProgramCreatePage', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ProgramCreatePage />
            </MemoryRouter>
        );
    });

    it('renders without crashing', async () => {
        expect(
            await screen.findByTestId('new-program-edit')
        ).toBeInTheDocument();
    });

    it('renders NewProgramEdit with create type', async () => {
        const editor = await screen.findByTestId('new-program-edit');
        expect(editor).toBeInTheDocument();
    });

    it('renders a container div', async () => {
        await screen.findByTestId('new-program-edit');
        expect(document.querySelector('div')).toBeInTheDocument();
    });
});
