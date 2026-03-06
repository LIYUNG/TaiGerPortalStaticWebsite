import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PortalCredentialPage from './index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Student',
            _id: { toString: () => 'student1' }
        }
    })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Student: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useParams: () => ({ student_id: undefined }) };
});

vi.mock('./PortalCredentialsCard', () => ({
    default: () => <div data-testid="portal-credentials-card">PortalCredentialsCard</div>
}));

describe('PortalCredentialPage', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <PortalCredentialPage showTitle={false} />
            </MemoryRouter>
        );
    });

    it('renders PortalCredentialsCard for student user', () => {
        expect(screen.getByTestId('portal-credentials-card')).toBeInTheDocument();
    });
});

describe('PortalCredentialPage - with student_id prop', () => {
    it('renders PortalCredentialsCard with explicit student_id prop', () => {
        render(
            <MemoryRouter>
                <PortalCredentialPage student_id="explicit123" showTitle={true} />
            </MemoryRouter>
        );
        expect(screen.getByTestId('portal-credentials-card')).toBeInTheDocument();
    });
});
