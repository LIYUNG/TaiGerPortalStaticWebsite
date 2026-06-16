import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/api', () => ({
    searchCommunicationThread: vi.fn()
}));

vi.mock('@utils/contants', () => ({
    stringAvatar: (name: string) => ({ children: name[0], sx: {} }),
    convertDate: (d: string) => d ?? ''
}));

import { searchCommunicationThread } from '@/api';
import ChatSearch from './ChatSearch';

const openDrawer = async () => {
    fireEvent.click(screen.getByLabelText('search conversation'));
    return screen.findByPlaceholderText('Search in conversation');
};

describe('ChatSearch', () => {
    test('renders a compact trigger that opens a search drawer', async () => {
        render(<ChatSearch onResultClick={vi.fn()} studentId="s1" />);
        expect(
            screen.getByLabelText('search conversation')
        ).toBeInTheDocument();
        const input = await openDrawer();
        expect(input).toBeInTheDocument();
    });

    test('searches the thread and renders matching messages', async () => {
        (searchCommunicationThread as jest.Mock).mockResolvedValue({
            data: {
                success: true,
                total: 1,
                data: [
                    {
                        _id: 'm1',
                        createdAt: '2024-01-01',
                        message: JSON.stringify({
                            blocks: [
                                {
                                    type: 'paragraph',
                                    data: { text: 'Please retake your IELTS' }
                                }
                            ]
                        }),
                        user_id: { firstname: 'Bob', lastname: 'Smith' }
                    }
                ]
            }
        });

        render(<ChatSearch onResultClick={vi.fn()} studentId="s1" />);
        const input = await openDrawer();
        fireEvent.change(input, { target: { value: 'ielts' } });

        await waitFor(() =>
            expect(screen.getByText('Bob Smith')).toBeInTheDocument()
        );
        expect(searchCommunicationThread).toHaveBeenCalledWith('s1', 'ielts');
    });

    test('clicking a result invokes onResultClick with the message id', async () => {
        (searchCommunicationThread as jest.Mock).mockResolvedValue({
            data: {
                success: true,
                total: 1,
                data: [
                    {
                        _id: 'm1',
                        createdAt: '2024-01-01',
                        message: JSON.stringify({
                            blocks: [
                                { type: 'paragraph', data: { text: 'hello' } }
                            ]
                        }),
                        user_id: { firstname: 'Bob', lastname: 'Smith' }
                    }
                ]
            }
        });
        const onResultClick = vi.fn();
        render(<ChatSearch onResultClick={onResultClick} studentId="s1" />);
        const input = await openDrawer();
        fireEvent.change(input, { target: { value: 'hello' } });
        await waitFor(() =>
            expect(screen.getByText('Bob Smith')).toBeInTheDocument()
        );
        fireEvent.click(screen.getByText('Bob Smith'));
        expect(onResultClick).toHaveBeenCalledWith('m1');
    });

    test('does not search for queries shorter than 2 characters', async () => {
        render(<ChatSearch onResultClick={vi.fn()} studentId="s1" />);
        const input = await openDrawer();
        fireEvent.change(input, { target: { value: 'i' } });
        await new Promise((resolve) => setTimeout(resolve, 350));
        expect(searchCommunicationThread).not.toHaveBeenCalled();
    });
});
