import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('./Friend', () => ({
    default: ({ data }: any) => (
        <div data-testid="embedded-friend-item">{data.firstname as string}</div>
    )
}));

import Friends from './index';

const mockUser = { _id: { toString: () => 'u1' } };

describe('EmbeddedChatList Friends with empty students', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Friends students={[]} user={mockUser} />
            </MemoryRouter>
        );
    });

    it('shows no students found when empty', () => {
        expect(screen.getByText('No students found')).toBeDefined();
    });
});

describe('EmbeddedChatList Friends with students', () => {
    const mockStudents = [
        { _id: { toString: () => 's1' }, firstname: 'Alice', lastname: 'Smith' },
        { _id: { toString: () => 's2' }, firstname: 'Bob', lastname: 'Jones' }
    ];

    beforeEach(() => {
        render(
            <MemoryRouter>
                <Friends students={mockStudents} user={mockUser} />
            </MemoryRouter>
        );
    });

    it('renders friend items', () => {
        const items = screen.getAllByTestId('embedded-friend-item');
        expect(items.length).toBe(2);
    });

    it('renders first friend', () => {
        expect(screen.getByText('Alice')).toBeDefined();
    });
});
