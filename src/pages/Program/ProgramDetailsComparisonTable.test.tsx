import { render, screen } from '@testing-library/react';
import ProgramDetailsComparisonTable from './ProgramDetailsComparisonTable';

vi.mock('@utils/contants', () => ({
    program_fields: [
        { name: 'School', prop: 'school' },
        { name: 'Program', prop: 'program_name' },
        { name: 'Degree', prop: 'degree' }
    ]
}));

vi.mock('../Utils/checking-functions', () => ({
    LinkableNewlineText: ({ text }: { text: string }) => <span>{text}</span>
}));

const mockApplications = [
    {
        _id: 'app1',
        programId: {
            _id: 'prog1',
            school: 'TU Berlin',
            program_name: 'Computer Science',
            degree: 'Master',
            country: 'Germany'
        }
    },
    {
        _id: 'app2',
        programId: {
            _id: 'prog2',
            school: 'TU Munich',
            program_name: 'Engineering',
            degree: 'Bachelor',
            country: 'Germany'
        }
    }
];

describe('ProgramDetailsComparisonTable', () => {
    beforeEach(() => {
        render(<ProgramDetailsComparisonTable applications={mockApplications as any} />);
    });

    it('renders without crashing', () => {
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders field names from program_fields', () => {
        expect(screen.getByText('School')).toBeInTheDocument();
        expect(screen.getByText('Program')).toBeInTheDocument();
    });

    it('renders program data values', () => {
        expect(screen.getByText('TU Berlin')).toBeInTheDocument();
        expect(screen.getByText('TU Munich')).toBeInTheDocument();
    });

    it('renders Country row', () => {
        expect(screen.getByText('Country')).toBeInTheDocument();
    });
});
