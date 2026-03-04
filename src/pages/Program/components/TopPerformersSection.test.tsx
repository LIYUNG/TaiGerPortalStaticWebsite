import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TopPerformersSection from './TopPerformersSection';

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return { ...actual, useNavigate: () => vi.fn() };
});

const t = (key: string) => key;

const defaultProps = {
    topSchools: [
        { school: 'TU Munich', country: 'Germany', city: 'Munich', programCount: 120 },
        { school: 'MIT', country: 'USA', city: 'Cambridge', programCount: 95 }
    ],
    topApplicationPrograms: [
        {
            programId: 'prog-1',
            program_name: 'Computer Science MSc',
            degree: 'Master',
            semester: 'WS',
            school: 'TU Munich',
            country: 'Germany',
            totalApplications: 50,
            submittedCount: 40,
            admittedCount: 20,
            rejectedCount: 10,
            pendingCount: 10,
            admissionRate: 55.0
        },
        {
            programId: 'prog-2',
            program_name: 'Data Science MSc',
            degree: 'Master',
            semester: 'SS',
            school: 'MIT',
            country: 'USA',
            totalApplications: 30,
            submittedCount: 25,
            admittedCount: 5,
            rejectedCount: 15,
            pendingCount: 5,
            admissionRate: 20.0
        }
    ],
    t
};

describe('TopPerformersSection', () => {
    it('renders Top Performers heading', () => {
        render(
            <MemoryRouter>
                <TopPerformersSection {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByText('Top Performers')).toBeInTheDocument();
    });

    it('renders Top Schools by Program Count card', () => {
        render(
            <MemoryRouter>
                <TopPerformersSection {...defaultProps} />
            </MemoryRouter>
        );
        expect(
            screen.getByText('Top Schools by Program Count')
        ).toBeInTheDocument();
    });

    it('renders Most Popular Programs card', () => {
        render(
            <MemoryRouter>
                <TopPerformersSection {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByText('Most Popular Programs')).toBeInTheDocument();
    });

    it('renders school rows in the table', () => {
        render(
            <MemoryRouter>
                <TopPerformersSection {...defaultProps} />
            </MemoryRouter>
        );
        // TU Munich appears in both the schools table and the programs table (as school name)
        const tuMunichElements = screen.getAllByText('TU Munich');
        expect(tuMunichElements.length).toBeGreaterThan(0);
        const mitElements = screen.getAllByText('MIT');
        expect(mitElements.length).toBeGreaterThan(0);
    });

    it('renders program rows with admission rate chips', () => {
        render(
            <MemoryRouter>
                <TopPerformersSection {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByText('Computer Science MSc')).toBeInTheDocument();
        expect(screen.getByText('55.0%')).toBeInTheDocument();
        expect(screen.getByText('20.0%')).toBeInTheDocument();
    });

    it('renders program link pointing to correct path', () => {
        render(
            <MemoryRouter>
                <TopPerformersSection {...defaultProps} />
            </MemoryRouter>
        );
        const link = screen.getByRole('link', { name: 'Computer Science MSc' });
        expect(link).toHaveAttribute('href', '/programs/prog-1');
    });
});
