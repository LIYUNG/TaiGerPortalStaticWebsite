import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import CommunicationSinglePage from './CommunicationSinglePage';

vi.mock('react-router-dom', async (orig) => ({
    ...(await orig<typeof import('react-router-dom')>()),
    useParams: () => ({ studentId: 'stu1' })
}));

vi.mock('@tanstack/react-query', async (orig) => ({
    ...(await orig<typeof import('@tanstack/react-query')>()),
    useQuery: vi.fn(() => ({ data: undefined, isLoading: true }))
}));

vi.mock('@components/Loading/Loading', () => ({
    default: () => <div data-testid="loading" />
}));

vi.mock('./CommunicationSinglePageBody', () => ({
    default: () => <div data-testid="comm-single-page-body" />
}));

vi.mock('@/api/query', () => ({
    getCommunicationQuery: vi.fn(() => ({
        queryKey: ['comm'],
        queryFn: vi.fn()
    }))
}));

describe('CommunicationSinglePage', () => {
    test('shows loading indicator when data is loading', () => {
        render(<CommunicationSinglePage />);
        expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('shows page body when data is loaded', async () => {
        const { useQuery } = await import('@tanstack/react-query');
        vi.mocked(useQuery).mockReturnValue({
            data: {
                data: [],
                student: { _id: 'stu1', firstname: 'John', lastname: 'Doe' }
            },
            isLoading: false
        } as ReturnType<typeof useQuery>);

        render(<CommunicationSinglePage />);
        expect(
            screen.getByTestId('communication_student_page')
        ).toBeInTheDocument();
    });
});
