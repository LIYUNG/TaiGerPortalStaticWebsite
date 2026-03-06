import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ManualFilesList from './ManualFilesList';

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
    latestReplyInfo: vi.fn(() => 'agent1'),
    APPROVAL_COUNTRIES: []
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

vi.mock('./EditableFileThread', () => ({
    default: ({ thread }: { thread: { _id: string } }) => (
        <div data-testid={`editable-thread-${thread._id}`}>EditableFileThread</div>
    )
}));

const mockStudent = {
    _id: 'student1',
    generaldocs_threads: [
        {
            _id: 'thread1',
            isFinalVersion: false,
            doc_thread_id: { _id: 'dt1', file_type: 'CV', updatedAt: '2025-01-01' }
        }
    ]
} as any;

describe('ManualFilesList', () => {
    it('renders general threads when application is null', () => {
        render(
            <MemoryRouter>
                <ManualFilesList
                    application={null}
                    student={mockStudent}
                    handleAsFinalFile={vi.fn()}
                    isLocked={false}
                    onDeleteFileThread={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('editable-thread-thread1')).toBeInTheDocument();
    });

    it('renders program-specific threads when application is provided', () => {
        const mockApp = {
            _id: 'app1',
            decided: 'O',
            doc_modification_thread: [
                {
                    _id: 'thread2',
                    isFinalVersion: false,
                    doc_thread_id: { _id: 'dt2', file_type: 'ML', updatedAt: '2025-01-01' }
                }
            ],
            programId: { _id: 'prog1', is_rl_specific: false, country: 'germany' }
        } as any;

        render(
            <MemoryRouter>
                <ManualFilesList
                    application={mockApp}
                    student={mockStudent}
                    handleAsFinalFile={vi.fn()}
                    isLocked={false}
                    onDeleteFileThread={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(screen.getByTestId('editable-thread-thread2')).toBeInTheDocument();
    });

    it('renders nothing when application has no doc_modification_thread', () => {
        const mockApp = {
            _id: 'app1',
            decided: 'O',
            doc_modification_thread: null,
            programId: { _id: 'prog1' }
        } as any;

        const { container } = render(
            <MemoryRouter>
                <ManualFilesList
                    application={mockApp}
                    student={mockStudent}
                    handleAsFinalFile={vi.fn()}
                    isLocked={false}
                    onDeleteFileThread={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(container).toBeEmptyDOMElement();
    });
});
