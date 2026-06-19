import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ForwardDocumentsDialog from './ForwardDocumentsDialog';
import { forwardStudentDocuments } from '@/api';

vi.mock('@/api', () => ({
    forwardStudentDocuments: vi.fn()
}));

const teamMember = {
    _id: 'a1',
    firstname: 'Ag',
    lastname: 'Ent',
    email: 'agent@example.com',
    role: 'Agent'
};

vi.mock('@hooks/useTeamMembers', () => ({
    useTeamMembers: () => ({ teams: [teamMember], isLoading: false })
}));

vi.mock('@contexts/use-snack-bar', () => ({
    useSnackBar: () => ({
        setMessage: vi.fn(),
        setSeverity: vi.fn(),
        setOpenSnackbar: vi.fn()
    })
}));

// General docs: a forwardable CV + an Others, plus an ML that is NOT in the
// scoped general set (so it must be excluded when scoped to an application).
const makeStudent = () => ({
    _id: 's1',
    firstname: 'Stu',
    lastname: 'Dent',
    profile: [{ name: 'ForwardTestDocX', path: 'students/s1/x.pdf' }],
    generaldocs_threads: [
        { doc_thread_id: { _id: 'gen-cv', file_type: 'CV' } },
        { doc_thread_id: { _id: 'gen-others', file_type: 'Others' } },
        { doc_thread_id: { _id: 'gen-ml-only', file_type: 'ML' } }
    ],
    applications: []
});

const makeApplication = () => ({
    _id: 'app1',
    programId: { school: 'TUM', program_name: 'CSE', degree: 'M.Sc.' },
    doc_modification_thread: [
        { doc_thread_id: { _id: 'app-ml', file_type: 'ML' } }
    ]
});

beforeEach(() => {
    vi.clearAllMocks();
    // postData returns the response body directly: { success, data }.
    (forwardStudentDocuments as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: { status: 'sent', attachmentCount: 3, skipped: [] }
    });
});

describe('ForwardDocumentsDialog', () => {
    it('global mode: disables Send until a recipient and a document are selected', () => {
        render(
            <ForwardDocumentsDialog
                onClose={vi.fn()}
                open
                student={makeStudent()}
            />
        );
        expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    });

    it('scoped mode: defaults to all of the application + listed general docs and prefills subject', () => {
        render(
            <ForwardDocumentsDialog
                application={makeApplication()}
                onClose={vi.fn()}
                open
                student={makeStudent()}
            />
        );

        // CV + Others (general, in the scoped set) and the application's ML are
        // checked by default; the general-only ML is NOT listed.
        expect(screen.getByLabelText('CV — General Documents')).toBeChecked();
        expect(
            screen.getByLabelText('Others — General Documents')
        ).toBeChecked();
        expect(screen.getByLabelText('ML — TUM CSE')).toBeChecked();
        expect(
            screen.queryByLabelText('ML — General Documents')
        ).not.toBeInTheDocument();
        // Existing base documents are shown and checked by default.
        expect(screen.getByLabelText('ForwardTestDocX')).toBeChecked();
        // Subject is prefilled with the student + program.
        expect(screen.getByLabelText('Subject')).toHaveValue(
            'Stu Dent - TUM CSE - Documents'
        );
    });

    it('scoped mode: submits resolved user ids (never raw emails) + default-selected docs', async () => {
        const user = userEvent.setup();
        render(
            <ForwardDocumentsDialog
                application={makeApplication()}
                onClose={vi.fn()}
                open
                student={makeStudent()}
            />
        );

        const toInput = screen.getAllByRole('combobox')[0];
        await user.click(toInput);
        await user.keyboard('{ArrowDown}{Enter}');

        const sendButton = screen.getByRole('button', { name: 'Send' });
        expect(sendButton).toBeEnabled();
        await user.click(sendButton);

        await waitFor(() =>
            expect(forwardStudentDocuments).toHaveBeenCalledTimes(1)
        );

        const [studentId, payload] = (
            forwardStudentDocuments as ReturnType<typeof vi.fn>
        ).mock.calls[0];
        expect(studentId).toBe('s1');
        expect(payload.recipientIds).toEqual(['a1']);
        // All existing base documents are attached by default.
        expect(payload.baseDocumentNames).toEqual(['ForwardTestDocX']);
        expect([...payload.threadIds].sort()).toEqual([
            'app-ml',
            'gen-cv',
            'gen-others'
        ]);
        // The client must send ids, not email addresses.
        expect(JSON.stringify(payload)).not.toContain('@');
    });

    it('warns about documents with no file and re-sends with confirmMissing on acknowledge', async () => {
        const user = userEvent.setup();
        const fwd = forwardStudentDocuments as ReturnType<typeof vi.fn>;
        // First call: backend reports missing docs (not sent). Second: sent.
        fwd.mockResolvedValueOnce({
            success: true,
            data: { status: 'missing_documents', missing: ['ML', 'CV'] }
        });
        fwd.mockResolvedValueOnce({
            success: true,
            data: { status: 'sent', attachmentCount: 1, skipped: ['ML', 'CV'] }
        });

        render(
            <ForwardDocumentsDialog
                application={makeApplication()}
                onClose={vi.fn()}
                open
                student={makeStudent()}
            />
        );

        const toInput = screen.getAllByRole('combobox')[0];
        await user.click(toInput);
        await user.keyboard('{ArrowDown}{Enter}');
        await user.click(screen.getByRole('button', { name: 'Send' }));

        // The acknowledgement dialog lists the missing documents.
        await waitFor(() =>
            expect(
                screen.getByText('Some documents have no file')
            ).toBeInTheDocument()
        );
        expect(screen.getByText('ML')).toBeInTheDocument();
        expect(screen.getByText('CV')).toBeInTheDocument();
        expect(fwd).toHaveBeenCalledTimes(1);
        expect(fwd.mock.calls[0][1].confirmMissing).toBe(false);

        // Acknowledge -> re-send with confirmMissing: true.
        await user.click(screen.getByRole('button', { name: 'Send anyway' }));
        await waitFor(() => expect(fwd).toHaveBeenCalledTimes(2));
        expect(fwd.mock.calls[1][1].confirmMissing).toBe(true);
    });
});
