import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProgramUpdateStatusTable from './ProgramUpdateStatusTable';

vi.mock('material-react-table', () => ({
    MaterialReactTable: () => <div data-testid="mrt" />,
    useMaterialReactTable: vi.fn(() => ({}))
}));
vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        SINGLE_PROGRAM_LINK: (id: string) => `/program/${id}`
    }
}));
vi.mock('@utils/contants', () => ({
    convertDate: (d: string) => d
}));

describe('ProgramUpdateStatusTable', () => {
    test('renders MaterialReactTable', () => {
        render(
            <MemoryRouter>
                <ProgramUpdateStatusTable data={[]} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mrt')).toBeInTheDocument();
    });

    test('renders with data without crashing', () => {
        const data = [
            {
                program_id: 'p1',
                school: 'MIT',
                program_name: 'CS',
                degree: 'MS',
                semester: 'WS2025',
                whoupdated: 'admin',
                updatedAt: '2025-01-01'
            }
        ];
        render(
            <MemoryRouter>
                <ProgramUpdateStatusTable data={data} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('mrt')).toBeInTheDocument();
    });
});
