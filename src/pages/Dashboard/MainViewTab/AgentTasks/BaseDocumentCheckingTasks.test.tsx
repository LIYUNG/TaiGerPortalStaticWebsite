import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import BaseDocumentCheckingTasks from './BaseDocumentCheckingTasks';

vi.mock('@utils/contants', () => ({
    convertDate: vi.fn((d: string) => d)
}));

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: vi.fn(() => '/student/s1'),
        PROFILE_HASH: 'profile'
    }
}));

const makeStudent = (profileStatus = 'uploaded') => ({
    _id: { toString: () => 's1' },
    firstname: 'Jane',
    lastname: 'Smith',
    profile: [
        {
            status: profileStatus,
            name: 'Transcript',
            updatedAt: '2024-01-01T00:00:00Z'
        }
    ]
});

describe('BaseDocumentCheckingTasks', () => {
    it('renders table row for uploaded profile doc', () => {
        render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <BaseDocumentCheckingTasks
                            student={makeStudent('uploaded') as never}
                        />
                    </tbody>
                </table>
            </MemoryRouter>
        );
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Transcript')).toBeInTheDocument();
    });

    it('does not render rows for non-uploaded docs', () => {
        render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <BaseDocumentCheckingTasks
                            student={makeStudent('missing') as never}
                        />
                    </tbody>
                </table>
            </MemoryRouter>
        );
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('renders nothing when profile is empty', () => {
        const student = {
            _id: { toString: () => 's1' },
            firstname: 'Jane',
            lastname: 'Smith',
            profile: []
        };
        const { container } = render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <BaseDocumentCheckingTasks student={student as never} />
                    </tbody>
                </table>
            </MemoryRouter>
        );
        expect(container.querySelectorAll('tr').length).toBe(0);
    });
});
