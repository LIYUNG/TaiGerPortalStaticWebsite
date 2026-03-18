import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_Agent: vi.fn(() => false),
    is_TaiGer_Editor: vi.fn(() => false),
    is_TaiGer_Student: vi.fn(() => true)
}));

vi.mock('@utils/contants', () => ({
    NoonNightLabel: vi.fn(() => 'AM'),
    convertDate: vi.fn(() => '2024-01-10'),
    showTimezoneOffset: vi.fn(() => '+0')
}));

vi.mock('../style/model.scss', () => ({}));

import Popping from './Popping';

const mockUser = {
    _id: 'u1',
    firstname: 'Alice',
    lastname: 'Smith',
    role: 'Student',
    agents: [
        { _id: { toString: () => 'a1' }, firstname: 'Agent', lastname: 'One' }
    ]
};

const mockEvent = {
    id: 'ev1',
    title: 'Meeting',
    start: new Date('2024-01-10T10:00:00'),
    end: new Date('2024-01-10T11:00:00'),
    description: 'Test',
    provider: {
        _id: { toString: () => 'p1' },
        firstname: 'Dr',
        lastname: 'Test'
    }
};

describe('Popping with no event id', () => {
    it('renders fallback text when event has no id', () => {
        render(
            <Popping
                BookButtonDisable={false}
                event={null}
                handleBook={vi.fn()}
                handleChange={vi.fn()}
                handleChangeReceiver={vi.fn()}
                handleClose={vi.fn()}
                newDescription=""
                newReceiver=""
                open={true}
                user={mockUser}
            />
        );
        expect(screen.getByText('there is no modal to preview')).toBeDefined();
    });
});

describe('Popping with event', () => {
    beforeEach(() => {
        render(
            <Popping
                BookButtonDisable={false}
                event={mockEvent}
                handleBook={vi.fn()}
                handleChange={vi.fn()}
                handleChangeReceiver={vi.fn()}
                handleClose={vi.fn()}
                newDescription="Some description"
                newReceiver=""
                open={true}
                user={mockUser}
            />
        );
    });

    it('renders dialog with event title', () => {
        expect(screen.getByText('Meeting')).toBeDefined();
    });

    it('renders Book and Close buttons', () => {
        expect(screen.getByText(/Book/)).toBeDefined();
        expect(screen.getByText(/Close/)).toBeDefined();
    });

    it('renders description input', () => {
        expect(screen.getByPlaceholderText(/Example/)).toBeDefined();
    });
});
