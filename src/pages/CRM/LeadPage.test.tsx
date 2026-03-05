import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LeadPage from './LeadPage';

// Hoist stable objects so they are available inside vi.mock factories
const mockLead = vi.hoisted(() => ({
    fullName: 'Test Lead',
    status: 'open',
    deals: [] as unknown[],
    meetings: [] as unknown[],
    gender: 'female'
}));

const mockForm = vi.hoisted(() => ({
    reset: vi.fn(),
    setFieldValue: vi.fn(),
    handleSubmit: vi.fn()
}));

vi.mock('@hooks/useLead', () => ({
    useLead: vi.fn(() => ({
        lead: mockLead,
        isLoading: false,
        data: null
    }))
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
    const actual =
        (await importOriginal()) as typeof import('@tanstack/react-query');
    return {
        ...actual,
        useMutation: vi.fn(() => ({
            mutate: vi.fn(),
            mutateAsync: vi.fn(),
            isPending: false
        })),
        useQuery: vi.fn(() => ({ data: null, isLoading: false })),
        useQueryClient: vi.fn(() => ({
            invalidateQueries: vi.fn(),
            setQueryData: vi.fn()
        }))
    };
});

vi.mock('@tanstack/react-form', () => ({
    useForm: vi.fn(() => mockForm)
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: vi.fn(() => ({ user: { role: 'Admin', _id: '1' } }))
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@pages/CRM/components/LeadProfileHeader', () => ({
    default: ({ lead }: { lead: Record<string, unknown> }) => (
        <div data-testid="lead-profile-header">
            {String(lead.fullName || '')}
        </div>
    )
}));

vi.mock('@pages/CRM/components/MeetingsList', () => ({
    default: () => <div data-testid="meetings-list" />
}));

vi.mock('@pages/CRM/components/SimilarStudents', () => ({
    default: () => <div data-testid="similar-students" />
}));

vi.mock('@pages/CRM/components/CreateUserFromLeadModal', () => ({
    default: () => null
}));

vi.mock('@pages/CRM/components/DealModal', () => ({
    default: () => null
}));

vi.mock('@pages/CRM/components/StatusMenu', () => ({
    default: () => null
}));

vi.mock('@pages/CRM/components/EditableCard', () => ({
    default: () => null
}));

vi.mock('@pages/CRM/components/CardConfigurations', () => ({
    getLeadCardConfigurations: vi.fn(() => []),
    getStudentCardConfigurations: vi.fn(() => [])
}));

vi.mock('@/api/query', () => ({
    getStudentQuery: vi.fn(() => ({
        queryKey: ['student', null],
        queryFn: async () => null,
        enabled: false
    })),
    getCRMLeadQuery: vi.fn(() => ({
        queryKey: ['crm/lead', ''],
        queryFn: async () => null
    }))
}));

vi.mock('@/api', () => ({
    request: { get: vi.fn(), put: vi.fn() },
    updateCRMDeal: vi.fn()
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../Utils/util_functions', () => ({
    flattenObject: vi.fn((obj) => obj)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/dashboard' }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@pages/CRM/components/statusUtils', () => ({
    getDealId: vi.fn((deal) => deal?.id || ''),
    isTerminalStatus: vi.fn(() => false)
}));

const renderLeadPage = () =>
    render(
        <MemoryRouter initialEntries={['/crm/leads/lead-1']}>
            <Routes>
                <Route path="/crm/leads/:leadId" element={<LeadPage />} />
            </Routes>
        </MemoryRouter>
    );

describe('LeadPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderLeadPage();
        expect(screen.getByTestId('lead-profile-header')).toBeInTheDocument();
    });

    it('renders the lead fullName via LeadProfileHeader', () => {
        renderLeadPage();
        // Lead fullName appears in both breadcrumb and header — getAllByText finds all
        const elements = screen.getAllByText('Test Lead');
        expect(elements.length).toBeGreaterThan(0);
    });

    it('renders MeetingsList component', () => {
        renderLeadPage();
        expect(screen.getByTestId('meetings-list')).toBeInTheDocument();
    });

    it('renders SimilarStudents component', () => {
        renderLeadPage();
        expect(screen.getByTestId('similar-students')).toBeInTheDocument();
    });

    it('renders breadcrumbs with CRM link', () => {
        renderLeadPage();
        expect(screen.getByText('breadcrumbs.crm')).toBeInTheDocument();
    });
});
