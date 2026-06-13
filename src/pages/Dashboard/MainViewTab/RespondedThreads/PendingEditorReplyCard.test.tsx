import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PendingEditorReplyCard from './PendingEditorReplyCard';

vi.mock('@store/constant', () => ({
    default: {
        DOCUMENT_MODIFICATION_LINK: (id: string) => `/doc/${id}`
    }
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@taiger-common/core', () => ({
    isProgramDecided: vi.fn(() => true)
}));

vi.mock('@utils/contants', () => ({
    convertDate: vi.fn(() => '2025-01-01')
}));

vi.mock('../../../Utils/util_functions', () => ({
    calculateApplicationLockStatus: vi.fn(() => ({ isLocked: false }))
}));

const studentId = 'student1';

const studentWithPending = {
    _id: studentId,
    applications: [
        {
            _id: 'app1',
            decided: 'O',
            programId: {
                _id: 'prog1',
                school: 'TU Munich',
                program_name: 'Computer Science'
            },
            doc_modification_thread: [
                {
                    isFinalVersion: false,
                    latest_message_left_by_id: studentId,
                    updatedAt: '2025-01-01',
                    doc_thread_id: { _id: 'thread1', file_type: 'CV' }
                }
            ]
        }
    ],
    generaldocs_threads: []
} as never;

const studentAllReplied = {
    _id: studentId,
    applications: [
        {
            _id: 'app1',
            decided: 'O',
            programId: { _id: 'prog1', school: 'TU', program_name: 'CS' },
            doc_modification_thread: [
                {
                    isFinalVersion: false,
                    // editor replied last -> not pending on the student's editor
                    latest_message_left_by_id: 'editor-x',
                    updatedAt: '2025-01-01',
                    doc_thread_id: { _id: 'thread1', file_type: 'CV' }
                }
            ]
        }
    ],
    generaldocs_threads: []
} as never;

const renderCard = (student: never) =>
    render(
        <MemoryRouter>
            <PendingEditorReplyCard student={student} />
        </MemoryRouter>
    );

describe('PendingEditorReplyCard', () => {
    it('always shows the section title', () => {
        renderCard(studentAllReplied);
        expect(
            screen.getByText('Waiting for Editor reply')
        ).toBeInTheDocument();
    });

    it('lists a pending document as a link with its date when waiting on the editor', () => {
        renderCard(studentWithPending);
        const link = screen.getByRole('link', { name: /CV/ });
        expect(link).toHaveAttribute('href', '/doc/thread1');
        expect(screen.getByText('2025-01-01')).toBeInTheDocument();
    });

    it('shows the reassuring empty state when nothing is pending', () => {
        renderCard(studentAllReplied);
        expect(
            screen.getByText('Your editor has your latest replies.')
        ).toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
});
