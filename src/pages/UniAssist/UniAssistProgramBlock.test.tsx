import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UniAssistProgramBlock } from './UniAssistProgramBlock';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Student', _id: { toString: () => 's1' } } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_AdminAgent: vi.fn(() => false)
}));

vi.mock('@taiger-common/model', () => ({
    DocumentStatusType: { Missing: 'missing', NotNeeded: 'notneeded' }
}));

vi.mock('@store/constant', () => ({
    default: {
        SINGLE_PROGRAM_LINK: () => '/program'
    }
}));

vi.mock('@/api', () => ({
    BASE_URL: 'http://localhost:5000',
    deleteVPDFileV2: vi.fn(),
    SetAsNotNeededV2: vi.fn(),
    SetUniAssistPaidV2: vi.fn(),
    uploadVPDforstudentV2: vi.fn(),
    queryClient: { invalidateQueries: vi.fn() }
}));

vi.mock('@tanstack/react-query', () => ({
    useMutation: () => ({ mutate: vi.fn(), isPending: false })
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

vi.mock('i18next', () => ({
    default: { t: (k: string) => k }
}));

const mockApplication = {
    _id: { toString: () => 'app1' },
    programId: {
        _id: { toString: () => 'prog1' },
        school: 'TU Munich',
        program_name: 'Computer Science',
        semester: 'WS',
        degree: 'M.Sc.',
        uni_assist: 'No'
    },
    uni_assist: null
};

const mockStudent = {
    _id: { toString: () => 's1' },
    firstname: 'Alice',
    lastname: 'Wang'
};

describe('UniAssistProgramBlock', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <UniAssistProgramBlock
                    application={mockApplication as any}
                    student={mockStudent as any}
                />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        // When uni_assist is 'No', nothing is rendered inside
        expect(document.body).toBeTruthy();
    });
});

describe('UniAssistProgramBlock - with VPD', () => {
    it('renders VPD upload button when uni_assist includes Yes-VPD', () => {
        const vpd_application = {
            ...mockApplication,
            programId: { ...mockApplication.programId, uni_assist: 'Yes-VPD' },
            uni_assist: { status: 'missing', isPaid: false, vpd_file_path: '', vpd_paid_confirmation_file_path: '' }
        };
        render(
            <MemoryRouter>
                <UniAssistProgramBlock
                    application={vpd_application as any}
                    student={mockStudent as any}
                />
            </MemoryRouter>
        );
        expect(screen.getAllByText(/vpd/i)[0]).toBeInTheDocument();
    });
});
