import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@utils/contants', () => ({
    menuWidth: 300
}));

vi.mock('./Friend', () => ({
    default: ({ data }: any) => (
        <div data-testid="friend-item">{data.firstname}</div>
    )
}));

import Friends from './index';

const mockUser = { _id: { toString: () => 'u1' } };

describe('Friends with empty students', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Friends students={[]} user={mockUser} />
            </MemoryRouter>
        );
    });

    it('renders no-students message when empty', () => {
        expect(screen.getByText('No students found')).toBeDefined();
    });
});

describe('Friends with students', () => {
    const mockStudents = [
        {
            _id: { toString: () => 's1' },
            firstname: 'Alice',
            lastname: 'Smith'
        },
        {
            _id: { toString: () => 's2' },
            firstname: 'Bob',
            lastname: 'Jones'
        }
    ] as any[];

    beforeEach(() => {
        render(
            <MemoryRouter>
                <Friends students={mockStudents} user={mockUser} />
            </MemoryRouter>
        );
    });

    it('renders friend items', () => {
        const items = screen.getAllByTestId('friend-item');
        expect(items.length).toBe(2);
    });

    it('renders first friend name', () => {
        expect(screen.getByText('Alice')).toBeDefined();
    });
});
