import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UniAssistList from './index';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: { role: 'Student', _id: { toString: () => 's1' } }
    })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Student: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: {
        DASHBOARD_LINK: '/',
        UNI_ASSIST_DOCS_LINK: '/docs/uni-assist'
    }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('@components/Loading/Loading', () => ({ default: () => <div>Loading</div> }));
vi.mock('./UniAssistListCard', () => ({
    default: () => <div data-testid="uni-assist-list-card">UniAssistListCard</div>
}));

vi.mock('@tanstack/react-query', () => ({
    useQuery: () => ({ data: { data: {} }, isLoading: false })
}));

vi.mock('@/api/query', () => ({
    getStudentUniAssistQuery: () => ({ queryKey: ['uniassist'] })
}));

vi.mock('../Utils/util_functions', () => ({
    check_student_needs_uni_assist: vi.fn(() => false)
}));

vi.mock('i18next', () => ({
    default: { t: (k: string) => k }
}));

describe('UniAssistList', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <UniAssistList />
            </MemoryRouter>
        );
    });

    it('renders breadcrumb with company name', () => {
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders Uni-Assist breadcrumb label', () => {
        expect(screen.getByText(/uni-assist tasks/i)).toBeInTheDocument();
    });

    it('renders not needed message when no uni-assist required', () => {
        expect(screen.getByText(/uni-assist is not needed/i)).toBeInTheDocument();
    });
});
