import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import EditableFileThread from './EditableFileThread';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('../Utils/util_functions', () => ({
    calculateApplicationLockStatus: vi.fn(() => ({ isLocked: false })),
    latestReplyInfo: vi.fn(() => 'AgentUser'),
    APPROVAL_COUNTRIES: ['germany', 'austria', 'switzerland']
}));

vi.mock('@utils/contants', () => ({
    FILE_OK_SYMBOL: '✓',
    FILE_MISSING_SYMBOL: '✗',
    convertDate: vi.fn(() => '2025-01-01')
}));

vi.mock('@store/constant', () => ({
    default: {
        DOCUMENT_MODIFICATION_LINK: (id: string) => `/docs/${id}`
    }
}));

const mockStudent = {
    _id: 'student1'
} as any;

const mockThread = {
    _id: 'thread1',
    isFinalVersion: false,
    doc_thread_id: {
        _id: 'dt1',
        file_type: 'ML',
        updatedAt: '2025-01-01'
    }
};

const mockApplication = {
    _id: 'app1',
    decided: 'O',
    doc_modification_thread: [],
    programId: {
        _id: 'prog1',
        is_rl_specific: false,
        country: 'germany'
    }
} as any;

describe('EditableFileThread', () => {
    const defaultProps = {
        application: mockApplication,
        decided: 'O',
        handleAsFinalFile: vi.fn(),
        isProgramLocked: false,
        onDeleteFileThread: vi.fn(),
        student: mockStudent,
        thread: mockThread
    };

    it('renders the document file type name', () => {
        render(
            <MemoryRouter>
                <EditableFileThread {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByText(/ML/)).toBeInTheDocument();
    });

    it('renders a link to the document thread', () => {
        render(
            <MemoryRouter>
                <EditableFileThread {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('renders General prefix for null application', () => {
        render(
            <MemoryRouter>
                <EditableFileThread
                    {...defaultProps}
                    application={null}
                    isProgramLocked={false}
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/General.*ML/)).toBeInTheDocument();
    });
});
