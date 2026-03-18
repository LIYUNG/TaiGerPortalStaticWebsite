import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CourseWidget from './CourseWidget';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Agent', _id: 'a1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/' }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/TabTitle', () => ({ TabTitle: vi.fn() }));
vi.mock('@components/Loading/Loading', () => ({
    default: () => <div>Loading</div>
}));
vi.mock('./CourseWidgetBody', () => ({
    default: () => <div data-testid="course-widget-body">CourseWidgetBody</div>
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useParams: () => ({ student_id: 's1' }) };
});

vi.mock('@tanstack/react-query', () => ({
    useQuery: () => ({
        data: { data: [] }
    })
}));

vi.mock('@/api/query', () => ({
    getProgramRequirementsQuery: () => ({ queryKey: ['program-req'] })
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('i18next', () => ({
    default: { t: (k: string) => k }
}));

vi.mock('react-datasheet-grid/dist/style.css', () => ({}));

describe('CourseWidget', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CourseWidget />
            </MemoryRouter>
        );
    });

    it('renders breadcrumb with company name', () => {
        expect(screen.getByText('TaiGer')).toBeInTheDocument();
    });

    it('renders Course Analyser breadcrumb label', () => {
        expect(screen.getByText(/course analyser/i)).toBeInTheDocument();
    });
});
