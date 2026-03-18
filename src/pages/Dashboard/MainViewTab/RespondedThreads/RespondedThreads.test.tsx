import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Table, TableBody } from '@mui/material';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RespondedThreads from './RespondedThreads';

vi.mock('@store/constant', () => ({
    default: {
        DOCUMENT_MODIFICATION_LINK: (id: string) =>
            `/document-modification/${id}`,
        STUDENT_DATABASE_STUDENTID_LINK: (id: string, hash: string) =>
            `/student/${id}${hash}`
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

const mockStudentWithThreads = {
    _id: studentId,
    firstname: 'John',
    lastname: 'Doe',
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
                    _id: 'dmt1',
                    isFinalVersion: false,
                    latest_message_left_by_id: studentId,
                    updatedAt: '2025-01-01',
                    doc_thread_id: {
                        _id: 'thread1',
                        file_type: 'CV'
                    }
                }
            ]
        }
    ],
    generaldocs_threads: [
        {
            isFinalVersion: false,
            latest_message_left_by_id: studentId,
            updatedAt: '2025-01-01',
            doc_thread_id: {
                _id: 'genthread1',
                file_type: 'CV'
            }
        }
    ]
};

const mockStudentNoApps = {
    _id: 'student2',
    firstname: 'Jane',
    lastname: 'Smith',
    applications: [],
    generaldocs_threads: []
};

describe('RespondedThreads', () => {
    it('renders general doc thread link when student responded', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <RespondedThreads student={mockStudentWithThreads} />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        // CV link for general doc thread
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
    });

    it('renders nothing for a student with no applications', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <RespondedThreads student={mockStudentNoApps} />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        // No links when no applications
        expect(screen.queryAllByRole('link').length).toBe(0);
    });

    it('renders application doc thread content for decided programs', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <RespondedThreads student={mockStudentWithThreads} />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        // Should have links for CV and application thread
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('renders date in the table cells', () => {
        render(
            <MemoryRouter>
                <Table>
                    <TableBody>
                        <RespondedThreads student={mockStudentWithThreads} />
                    </TableBody>
                </Table>
            </MemoryRouter>
        );
        expect(screen.getAllByText('2025-01-01').length).toBeGreaterThan(0);
    });
});
