import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import EditAttributesSubpage from './EditAttributesSubpage';

vi.mock('@components/Modal/ConfirmationModal', () => ({
    ConfirmationModal: ({
        title,
        open
    }: {
        title: string;
        open: boolean;
    }) =>
        open ? (
            <div data-testid="confirmation-modal">{title}</div>
        ) : null
}));

vi.mock('@utils/contants', () => ({
    ATTRIBUTES: [
        { name: 'Demanding', value: 'demanding' },
        { name: 'Ambitious', value: 'ambitious' }
    ],
    convertDate: vi.fn((d: string) => d),
    isInTheFuture: vi.fn(() => true),
    COLORS: {}
}));

const mockStudent = {
    _id: 's1',
    firstname: 'Hannah',
    lastname: 'Liu',
    attributes: []
} as never;

describe('EditAttributesSubpage', () => {
    it('renders modal when show=true', () => {
        render(
            <MemoryRouter>
                <EditAttributesSubpage
                    onHide={vi.fn()}
                    show={true}
                    student={mockStudent}
                    submitUpdateAttributeslist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            screen.getByTestId('confirmation-modal')
        ).toBeInTheDocument();
    });

    it('does not render modal when show=false', () => {
        render(
            <MemoryRouter>
                <EditAttributesSubpage
                    onHide={vi.fn()}
                    show={false}
                    student={mockStudent}
                    submitUpdateAttributeslist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            screen.queryByTestId('confirmation-modal')
        ).not.toBeInTheDocument();
    });

    it('modal title contains student name', () => {
        render(
            <MemoryRouter>
                <EditAttributesSubpage
                    onHide={vi.fn()}
                    show={true}
                    student={mockStudent}
                    submitUpdateAttributeslist={vi.fn()}
                />
            </MemoryRouter>
        );
        expect(
            screen.getByText(/Attributes for Hannah - Liu/i)
        ).toBeInTheDocument();
    });
});
