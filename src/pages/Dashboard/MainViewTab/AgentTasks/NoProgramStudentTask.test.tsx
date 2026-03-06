import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import NoProgramStudentTask from './NoProgramStudentTask';

vi.mock('../../../Utils/util_functions', async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        hasApplications: vi.fn(() => false)
    };
});

vi.mock('@store/constant', () => ({
    default: {
        STUDENT_DATABASE_STUDENTID_LINK: vi.fn(() => '/student/s1'),
        APPLICATION_HASH: 'applications'
    }
}));

const makeStudent = (hasApps = false) => ({
    _id: { toString: () => 's1' },
    firstname: 'Dan',
    lastname: 'Kim',
    applications: hasApps ? [{}] : [],
    application_preference: {
        expected_application_date: '2025',
        expected_application_semester: 'WS'
    }
});

describe('NoProgramStudentTask', () => {
    it('renders link when student has no applications', () => {
        render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <NoProgramStudentTask
                            student={makeStudent(false) as never}
                        />
                    </tbody>
                </table>
            </MemoryRouter>
        );
        expect(screen.getByText('Dan Kim')).toBeInTheDocument();
    });

    it('renders nothing when student has applications', async () => {
        const { hasApplications } = await import(
            '../../../Utils/util_functions'
        );
        vi.mocked(hasApplications).mockReturnValue(true);

        render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <NoProgramStudentTask
                            student={makeStudent(true) as never}
                        />
                    </tbody>
                </table>
            </MemoryRouter>
        );
        expect(screen.queryByText('Dan Kim')).not.toBeInTheDocument();
    });
});
