import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({
        user: {
            role: 'Agent',
            _id: 'u1',
            firstname: 'Test',
            lastname: 'Agent'
        }
    })
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (k: string) => k })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => true)
}));

vi.mock('@store/constant', () => ({
    default: { DASHBOARD_LINK: '/dashboard' }
}));

vi.mock('../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('../Utils/TabTitle', () => ({
    TabTitle: vi.fn()
}));

vi.mock('../Utils/util_functions', () => ({
    AGENT_SUPPORT_DOCUMENTS_A: [],
    FILE_TYPE_E: { essay_required: 'Essay' }
}));

vi.mock('@components/BreadcrumbsNavigation/BreadcrumbsNavigation', () => ({
    BreadcrumbsNavigation: ({ items }: { items: { label: string }[] }) => (
        <nav data-testid="breadcrumbs">
            {items.map((item, i) => (
                <span key={i}>{item.label}</span>
            ))}
        </nav>
    )
}));

vi.mock('../CVMLRLCenter/CVMLRLOverviewPaginated', () => ({
    default: () => <div data-testid="cvmlrl-overview" />
}));

import AgentSupportDocuments from './index';

describe('AgentSupportDocuments', () => {
    it('renders the breadcrumbs', () => {
        render(
            <MemoryRouter>
                <AgentSupportDocuments />
            </MemoryRouter>
        );
        expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });

    it('renders the paginated overview', () => {
        render(
            <MemoryRouter>
                <AgentSupportDocuments />
            </MemoryRouter>
        );
        expect(screen.getByTestId('cvmlrl-overview')).toBeInTheDocument();
    });
});
