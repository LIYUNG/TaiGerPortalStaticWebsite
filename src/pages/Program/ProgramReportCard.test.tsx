import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProgramReportCard from './ProgramReportCard';

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`
    }
}));

vi.mock('@/api/query', () => ({
    getProgramTicketsQuery: vi.fn(() => ({
        queryKey: ['program-tickets'],
        queryFn: vi.fn()
    }))
}));

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: () => ({
            data: {
                data: [
                    {
                        _id: 't1',
                        description:
                            'Wrong deadline information for this program',
                        program_id: {
                            _id: 'prog1',
                            school: 'TU Berlin',
                            program_name: 'Computer Science'
                        }
                    }
                ]
            },
            isLoading: false
        })
    };
});

describe('ProgramReportCard', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ProgramReportCard />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByText(/Program Update Request/i)).toBeInTheDocument();
    });

    it('renders table headers', () => {
        expect(screen.getByText('idx')).toBeInTheDocument();
        expect(screen.getByText('Program')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders ticket rows', () => {
        expect(
            screen.getByText(/TU Berlin - Computer Science/i)
        ).toBeInTheDocument();
    });

    it('renders alert with error severity', () => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });
});
