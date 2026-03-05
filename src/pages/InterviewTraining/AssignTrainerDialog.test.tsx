import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AssignTrainerDialog } from './AssignTrainerDialog';

describe('AssignTrainerDialog', () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        modifyTrainer: vi.fn(),
        trainers: [
            { _id: 't1', firstname: 'Alice', lastname: 'Smith' } as any,
            { _id: 't2', firstname: 'Bob', lastname: 'Jones' } as any
        ],
        updateTrainer: vi.fn(),
        trainerId: new Set<string>(['t1'])
    };

    it('renders dialog title and trainer names', () => {
        render(
            <MemoryRouter>
                <AssignTrainerDialog {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByText('Assign Trainer')).toBeTruthy();
        expect(screen.getByText('Alice Smith')).toBeTruthy();
        expect(screen.getByText('Bob Jones')).toBeTruthy();
    });

    it('renders Assign and Close buttons', () => {
        render(
            <MemoryRouter>
                <AssignTrainerDialog {...defaultProps} />
            </MemoryRouter>
        );
        expect(screen.getByText('Assign')).toBeTruthy();
        expect(screen.getByText('Close')).toBeTruthy();
    });

    it('renders checked checkbox for trainer in trainerId set', () => {
        render(
            <MemoryRouter>
                <AssignTrainerDialog {...defaultProps} />
            </MemoryRouter>
        );
        const checkboxes = screen.getAllByRole('checkbox');
        // first trainer (t1) is in the set, so it should be checked
        expect((checkboxes[0] as HTMLInputElement).checked).toBe(true);
        // second trainer (t2) is not in the set
        expect((checkboxes[1] as HTMLInputElement).checked).toBe(false);
    });
});
