import { render, screen } from '@testing-library/react';
import SchoolConfigContent from './SchoolConfigContent';

vi.mock('@components/MaterialReactTable', () => ({
    default: () => <div data-testid="mrt-table" />
}));

vi.mock('@utils/contants', () => ({
    COUNTRIES_ARRAY_OPTIONS: [{ value: 'DE', label: 'Germany' }],
    SCHOOL_TAGS_DETAILED: [{ value: 'TU', label: 'Technical University' }]
}));

vi.mock('@/api', () => ({
    updateSchoolAttributes: vi.fn(() => Promise.resolve({ data: { success: true } }))
}));

vi.mock('@components/Input/searchableMuliselect', () => ({
    default: () => <div data-testid="searchable-multi-select" />
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

const mockData = [
    { school: 'TU Berlin', count: 10, country: 'Germany', schoolType: 'University', isPrivateSchool: false, isPartnerSchool: true, tags: [] },
    { school: 'LMU Munich', count: 8, country: 'Germany', schoolType: 'University', isPrivateSchool: false, isPartnerSchool: false, tags: [] }
];

describe('SchoolConfigContent', () => {
    it('renders without crashing', () => {
        render(<SchoolConfigContent data={mockData} />);
        expect(screen.getByTestId('mrt-table')).toBeInTheDocument();
    });

    it('renders the MRT table component', () => {
        render(<SchoolConfigContent data={mockData} />);
        expect(screen.getByTestId('mrt-table')).toBeInTheDocument();
    });

    it('renders with empty data', () => {
        render(<SchoolConfigContent data={[]} />);
        expect(screen.getByTestId('mrt-table')).toBeInTheDocument();
    });
});
