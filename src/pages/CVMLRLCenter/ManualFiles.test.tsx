import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ManualFiles from './ManualFiles';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true),
    isProgramDecided: vi.fn(() => true)
}));

vi.mock('../Utils/util_functions', () => ({
    calculateApplicationLockStatus: vi.fn(() => ({ isLocked: false })),
    calculateProgramLockStatus: vi.fn(() => ({ isLocked: false })),
    is_program_closed: vi.fn(() => false),
    is_program_ml_rl_essay_finished: vi.fn(() => true),
    file_category_const: {}
}));

vi.mock('../Utils/document-status', () => ({
    checkGeneralDocs: vi.fn(() => false),
    getGeneralDocumentStatus: vi.fn(() => ({
        missing: [],
        extra: [],
        rlApplications: []
    })),
    getProgramDocumentStatus: vi.fn(() => ({ missing: [], extra: [] }))
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_APPLICATIONS_ID_LINK: (id: string) =>
            `/students/${id}/applications`,
        DOCUMENT_MODIFICATION_LINK: (id: string) => `/docs/${id}`
    }
}));

vi.mock('./ManualFilesList', () => ({
    default: () => <div data-testid="manual-files-list">ManualFilesList</div>
}));

vi.mock('./ToggleableUploadFileForm', () => ({
    default: () => (
        <div data-testid="toggleable-upload">ToggleableUploadFileForm</div>
    )
}));

const mockStudent = {
    _id: 'student1',
    generaldocs_threads: []
} as any;

const mockApplication = {
    _id: 'app1',
    decided: 'O',
    closed: '-',
    doc_modification_thread: [],
    programId: {
        _id: 'prog1',
        school: 'MIT',
        degree: 'MSc',
        program_name: 'CS',
        rl_required: 0
    }
} as any;

describe('ManualFiles', () => {
    const defaultProps = {
        application: mockApplication,
        filetype: 'ProgramSpecific' as const,
        student: mockStudent,
        handleAsFinalFile: vi.fn(),
        handleProgramStatus: vi.fn(),
        initGeneralFileThread: vi.fn(),
        initProgramSpecificFileThread: vi.fn(),
        onDeleteFileThread: vi.fn(),
        openRequirements_ModalWindow: vi.fn()
    };

    it('renders ManualFilesList', () => {
        render(
            <MemoryRouter>
                <ManualFiles {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('manual-files-list')).toBeInTheDocument();
    });

    it('renders ToggleableUploadFileForm for TaiGer role', () => {
        render(
            <MemoryRouter>
                <ManualFiles {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('toggleable-upload')).toBeInTheDocument();
    });

    it('renders General Documents title when filetype is General', () => {
        render(
            <MemoryRouter>
                <ManualFiles
                    {...defaultProps}
                    application={null}
                    filetype="General"
                />
            </MemoryRouter>
        );
        expect(screen.getByText(/General Documents/)).toBeInTheDocument();
    });
});
