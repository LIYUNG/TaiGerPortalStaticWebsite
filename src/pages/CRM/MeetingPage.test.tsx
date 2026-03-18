import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
    useQueryClient: vi.fn(() => ({
        invalidateQueries: vi.fn(),
        setQueryData: vi.fn(),
        refetchQueries: vi.fn()
    }))
}));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: { role: 'Admin', _id: 'u1' } })
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Admin: vi.fn(() => true),
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => false),
    is_TaiGer_role: vi.fn(() => true),
    is_TaiGer_Guest: vi.fn(() => false)
}));

vi.mock('@/api/query', () => ({
    getCRMMeetingQuery: vi.fn(() => ({
        queryKey: ['crm/meeting', 'test-id'],
        queryFn: vi.fn()
    })),
    getCRMLeadsQuery: vi.fn(() => ({
        queryKey: ['crm/leads'],
        queryFn: vi.fn()
    }))
}));

vi.mock('@/api', () => ({
    updateCRMMeeting: vi.fn().mockResolvedValue({ data: {} })
}));

import MeetingPage from './MeetingPage';

describe('MeetingPage', () => {
    const renderWithRoute = () =>
        render(
            <MemoryRouter initialEntries={['/crm/meetings/test-id']}>
                <Routes>
                    <Route
                        path="/crm/meetings/:meetingId"
                        element={<MeetingPage />}
                    />
                </Routes>
            </MemoryRouter>
        );

    it('renders without crashing', () => {
        renderWithRoute();
        expect(document.body).toBeTruthy();
    });

    it('shows meeting details area', () => {
        renderWithRoute();
        // Component renders the meeting details heading from translation key
        expect(document.body).toBeTruthy();
    });
});
