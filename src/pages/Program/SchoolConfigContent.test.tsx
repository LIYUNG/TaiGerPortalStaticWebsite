import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SchoolConfigContent from './SchoolConfigContent';

const { mockUpdateSchoolAttributes, mockSetMessage, mockSetSeverity } =
    vi.hoisted(() => ({
        mockUpdateSchoolAttributes: vi.fn(),
        mockSetMessage: vi.fn(),
        mockSetSeverity: vi.fn()
    }));

// Stand-in for the MRT table: renders one button per row that reports the
// selection back the same way MRT does (an updater keyed by row index), so the
// selection -> detail-panel wiring is exercised for real. Each row also renders
// its schoolType so tests can observe what the table was told to display.
vi.mock('@components/MaterialReactTable', () => ({
    default: ({
        data,
        onRowSelectionChange
    }: {
        data: { school?: string; schoolType?: string }[];
        onRowSelectionChange?: (
            updater: (old: Record<string, boolean>) => Record<string, boolean>
        ) => void;
    }) => (
        <div data-testid="mrt-table">
            {data.map((row, index) => (
                <div key={row.school}>
                    <button
                        onClick={() =>
                            onRowSelectionChange?.(() => ({ [index]: true }))
                        }
                        type="button"
                    >
                        select-{row.school}
                    </button>
                    <span data-testid={`row-type-${row.school}`}>
                        {row.schoolType}
                    </span>
                </div>
            ))}
        </div>
    )
}));

vi.mock('@utils/contants', () => ({
    COUNTRIES_ARRAY_OPTIONS: [{ value: 'DE', label: 'Germany' }],
    SCHOOL_TAGS_DETAILED: [{ value: 'TU', label: 'Technical University' }]
}));

vi.mock('@/api', () => ({
    updateSchoolAttributes: mockUpdateSchoolAttributes
}));

vi.mock('@components/Input/searchableMuliselect', () => ({
    default: () => <div data-testid="searchable-multi-select" />
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: mockSetMessage,
        setSeverity: mockSetSeverity,
        setOpenSnackbar: vi.fn()
    })
}));

const mockData = [
    {
        school: 'TU Berlin',
        count: 10,
        country: 'DE',
        schoolType: 'University',
        isPrivateSchool: false,
        isPartnerSchool: true,
        tags: []
    },
    {
        school: 'LMU Munich',
        count: 8,
        country: 'DE',
        schoolType: 'University',
        isPrivateSchool: false,
        isPartnerSchool: false,
        tags: []
    }
];

describe('SchoolConfigContent', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUpdateSchoolAttributes.mockResolvedValue({
            data: { success: true }
        });
    });

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

    // The panel's heading is the only place the selected school is spelled out,
    // so assert against that rather than a bare text match (which would also
    // hit the mocked row buttons).
    const panelHeading = (school: RegExp) =>
        screen.queryByRole('heading', { name: school });

    it('shows no detail panel until a row is selected', () => {
        render(<SchoolConfigContent data={mockData} />);
        expect(panelHeading(/TU Berlin/)).not.toBeInTheDocument();
    });

    it('swaps the detail panel when a different row is selected', () => {
        render(<SchoolConfigContent data={mockData} />);

        fireEvent.click(screen.getByText('select-TU Berlin'));
        expect(panelHeading(/TU Berlin/)).toBeInTheDocument();

        // Regression: EditCard seeds its form state from props on mount only,
        // so without a per-school `key` it kept rendering the first selection.
        fireEvent.click(screen.getByText('select-LMU Munich'));
        expect(panelHeading(/LMU Munich/)).toBeInTheDocument();
        expect(panelHeading(/TU Berlin/)).not.toBeInTheDocument();
    });

    describe('saving', () => {
        const selectFirstSchool = () => {
            render(<SchoolConfigContent data={mockData} />);
            fireEvent.click(screen.getByText('select-TU Berlin'));
        };

        const updateButton = () =>
            screen.getByRole('button', { name: /Update/ });

        // MUI Selects are not native <select>s: open the listbox, then pick.
        const chooseSchoolType = (optionName: string) => {
            fireEvent.mouseDown(
                screen.getByRole('combobox', { name: 'School Type' })
            );
            fireEvent.click(screen.getByRole('option', { name: optionName }));
        };

        it('shows a spinner and disables Update while the save is pending', async () => {
            let resolveSave: (value: unknown) => void = () => {};
            mockUpdateSchoolAttributes.mockReturnValue(
                new Promise((resolve) => {
                    resolveSave = resolve;
                })
            );

            selectFirstSchool();
            fireEvent.click(updateButton());

            await waitFor(() => expect(updateButton()).toBeDisabled());
            expect(screen.getByRole('progressbar')).toBeInTheDocument();

            resolveSave({ data: { success: true } });

            await waitFor(() => expect(updateButton()).toBeEnabled());
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('sends the edited attributes and reports success', async () => {
            selectFirstSchool();
            chooseSchoolType('University of Applied Sciences');
            fireEvent.click(updateButton());

            await waitFor(() =>
                expect(mockUpdateSchoolAttributes).toHaveBeenCalledWith(
                    expect.objectContaining({
                        school: 'TU Berlin',
                        schoolType: 'University_of_Applied_Sciences'
                    })
                )
            );
            await waitFor(() =>
                expect(mockSetSeverity).toHaveBeenCalledWith('success')
            );
        });

        it('mirrors the saved value into the table row on success', async () => {
            selectFirstSchool();
            // Anchored: toHaveTextContent is a substring match, and plain
            // 'University' is a substring of 'University_of_Applied_Sciences'.
            expect(screen.getByTestId('row-type-TU Berlin')).toHaveTextContent(
                /^University$/
            );

            chooseSchoolType('University of Applied Sciences');
            fireEvent.click(updateButton());

            await waitFor(() =>
                expect(
                    screen.getByTestId('row-type-TU Berlin')
                ).toHaveTextContent('University_of_Applied_Sciences')
            );
        });

        it('leaves the table row untouched when the API reports failure', async () => {
            mockUpdateSchoolAttributes.mockResolvedValue({
                data: { success: false, message: 'nope' }
            });

            selectFirstSchool();
            chooseSchoolType('University of Applied Sciences');
            fireEvent.click(updateButton());

            await waitFor(() =>
                expect(mockSetSeverity).toHaveBeenCalledWith('error')
            );
            expect(mockSetMessage).toHaveBeenCalledWith('nope');
            // The row must not advertise a value the server rejected. Anchored
            // so an optimistic 'University_of_Applied_Sciences' cannot satisfy
            // this via substring matching.
            expect(screen.getByTestId('row-type-TU Berlin')).toHaveTextContent(
                /^University$/
            );
        });

        it('surfaces an error and re-enables Update when the request rejects', async () => {
            mockUpdateSchoolAttributes.mockRejectedValue(
                new Error('network down')
            );

            selectFirstSchool();
            fireEvent.click(updateButton());

            await waitFor(() =>
                expect(mockSetSeverity).toHaveBeenCalledWith('error')
            );
            expect(updateButton()).toBeEnabled();
        });
    });
});
