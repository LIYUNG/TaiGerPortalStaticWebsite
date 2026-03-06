import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditDownloadFiles from './EditDownloadFiles';

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => false)
}));

vi.mock('@taiger-common/model', () => ({
    DocumentStatusType: { Missing: 'missing' }
}));

vi.mock('@/api', () => ({
    BASE_URL: 'http://localhost:5000'
}));

vi.mock('@utils/contants', () => ({
    templatelist: [
        { prop: 'cv', name: 'CV Template' },
        { prop: 'ml', name: 'ML Template' }
    ]
}));

vi.mock('i18next', () => ({
    default: { t: (k: string) => k }
}));

const defaultProps = {
    user: { role: 'Agent', _id: 'a1' },
    templates: [],
    areLoaded: { cv: true, ml: true },
    submitFile: vi.fn(),
    onDeleteTemplateFile: vi.fn(),
    onFileChange: vi.fn()
};

describe('EditDownloadFiles', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <EditDownloadFiles {...defaultProps} />
            </MemoryRouter>
        );
    });

    it('renders template list table', () => {
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders CV Template row', () => {
        expect(screen.getByText('CV Template')).toBeInTheDocument();
    });

    it('renders ML Template row', () => {
        expect(screen.getByText('ML Template')).toBeInTheDocument();
    });

    it('shows Unavailable for non-admin when template not uploaded', () => {
        expect(screen.getAllByText('Unavailable').length).toBeGreaterThan(0);
    });
});
