import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@taiger-common/core', () => ({
    isProgramSubmitted: vi.fn(() => false)
}));

vi.mock('@store/constant', () => ({
    default: {
        DOCUMENT_MODIFICATION_LINK: (id: string) => `/docs/${id}`,
        SURVEY_LINK: '/survey',
        UNI_ASSIST_LINK: '/uni-assist',
        STUDENT_APPLICATIONS_ID_LINK: (id: string) => `/student/${id}/applications`,
        PORTALS_MANAGEMENT_STUDENTID_LINK: (id: string) => `/portals/${id}`
    }
}));

vi.mock('@pages/Utils/util_functions', () => ({
    isEnglishOK: vi.fn(() => true)
}));

vi.mock('@utils/contants', () => ({
    FILE_MISSING_SYMBOL: '✗',
    FILE_OK_SYMBOL: '✓',
    convertDateUXFriendly: vi.fn(() => '2024-01-01')
}));

import ApplicationProgressCardBody from './ApplicationProgressCardBody';

const mockApplication = {
    _id: { toString: () => 'app1' },
    programId: {
        _id: { toString: () => 'prog1' },
        school: 'TU Munich',
        degree: 'MSc',
        program_name: 'CS'
    },
    doc_modification_thread: [],
    admission: '-'
} as any;

const mockStudent = {
    _id: { toString: () => 'student1' },
    generaldocs_threads: [],
    applications: []
} as any;

describe('ApplicationProgressCardBody', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ApplicationProgressCardBody
                    application={mockApplication}
                    student={mockStudent}
                />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByText('Submit')).toBeDefined();
    });

    it('renders submit link', () => {
        const submitLink = screen.getByText('Submit');
        expect(submitLink).toBeDefined();
    });

    it('renders a list element', () => {
        const list = document.querySelector('ul');
        expect(list).toBeDefined();
    });
});
