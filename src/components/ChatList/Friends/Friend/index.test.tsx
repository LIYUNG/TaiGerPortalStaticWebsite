import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../AuthProvider', () => ({
    useAuth: () => ({ user: { _id: { toString: () => 'u1' }, role: 'Agent' } })
}));

vi.mock('@store/constant', () => ({
    default: {
        COMMUNICATIONS_TAIGER_MODE_LINK: (id: string) => `/comm/${id}`
    }
}));

vi.mock('@utils/contants', () => ({
    convertDateUXFriendly: vi.fn(() => 'Jan 10, 2024'),
    menuWidth: 300,
    stringAvatar: vi.fn((name: string) => ({ children: name[0] }))
}));

vi.mock('@pages/Utils/util_functions', () => ({
    truncateText: vi.fn((text: string) => text)
}));

import Friend from './index';

const mockData = {
    _id: { toString: () => 's1' },
    firstname: 'Alice',
    lastname: 'Smith',
    firstname_chinese: '',
    lastname_chinese: '',
    latestCommunication: {
        message: JSON.stringify({
            blocks: [{ type: 'paragraph', data: { text: 'Hello!' } }]
        }),
        user_id: { toString: () => 'u2' },
        student_id: { toString: () => 's1' },
        readBy: ['u1'],
        createdAt: '2024-01-10T10:00:00Z'
    }
};

describe('Friend', () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <Friend activeId="u1" data={mockData} />
            </MemoryRouter>
        );
    });

    it('renders without crashing', () => {
        expect(screen.getByTitle(/Alice Smith/)).toBeDefined();
    });

    it('renders friend name', () => {
        expect(screen.getByText('Alice Smith')).toBeDefined();
    });
});

describe('Friend without latestCommunication', () => {
    it('renders without communication data', () => {
        render(
            <MemoryRouter>
                <Friend
                    activeId="u1"
                    data={{
                        _id: { toString: () => 's2' },
                        firstname: 'Bob',
                        lastname: 'Jones'
                    }}
                />
            </MemoryRouter>
        );
        expect(screen.getByText('Bob Jones')).toBeDefined();
    });
});
