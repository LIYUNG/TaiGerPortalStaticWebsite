import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

type ModalFormValues = {
    firstname: string;
    lastname: string;
    firstname_chinese: string;
    lastname_chinese: string;
    email: string;
    applying_program_count: string;
    dealSalesUserId: string;
    dealSizeNtd: string;
    dealNote: string;
    dealClosedAt: string;
    dealStatus: string;
};

const defaultFormValues: ModalFormValues = {
    firstname: 'Alice',
    lastname: 'Smith',
    firstname_chinese: '',
    lastname_chinese: '',
    email: 'alice@example.com',
    applying_program_count: '1',
    dealSalesUserId: 'sales-1',
    dealSizeNtd: '52000',
    dealNote: 'test note',
    dealClosedAt: '2026-04-02T10:30',
    dealStatus: 'closed'
};

let mockFormValues: ModalFormValues = { ...defaultFormValues };
let capturedOnSubmit:
    | ((arg: { value: ModalFormValues }) => Promise<void>)
    | null = null;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@/api', () => ({
    addUser: vi.fn(() => Promise.resolve({ data: { success: true } })),
    createCRMDeal: vi.fn(() => Promise.resolve({ data: { success: true } })),
    updateCRMDeal: vi.fn(() => Promise.resolve({ data: { success: true } })),
    getCRMSalesReps: vi.fn(() => Promise.resolve({ data: { data: [] } }))
}));

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(() => ({ data: [], isLoading: false }))
}));

vi.mock('@tanstack/react-form', () => ({
    useForm: vi.fn(
        (config: {
            onSubmit: (arg: { value: ModalFormValues }) => Promise<void>;
        }) => {
            capturedOnSubmit = config.onSubmit;
            const Field = ({
                name,
                children
            }: {
                name: keyof ModalFormValues;
                children: (field: unknown) => React.ReactNode;
            }) =>
                children({
                    name,
                    state: {
                        value: mockFormValues[name],
                        meta: { errors: [] }
                    },
                    handleChange: vi.fn((next: string) => {
                        mockFormValues[name] = next;
                    }),
                    handleBlur: vi.fn()
                });

            const Subscribe = ({
                children
            }: {
                children: (...args: unknown[]) => React.ReactNode;
            }) =>
                children(
                    mockFormValues.firstname,
                    mockFormValues.lastname,
                    mockFormValues.email
                );

            return {
                Field,
                Subscribe,
                handleSubmit: vi.fn(() =>
                    config.onSubmit({ value: mockFormValues })
                ),
                reset: vi.fn((next?: Partial<ModalFormValues>) => {
                    if (next) {
                        mockFormValues = {
                            ...mockFormValues,
                            ...next
                        };
                    }
                }),
                setFieldValue: vi.fn(
                    (name: keyof ModalFormValues, value: string) => {
                        mockFormValues[name] = value;
                    }
                )
            };
        }
    )
}));

import { addUser, createCRMDeal, updateCRMDeal } from '@/api';
import CreateUserFromLeadModal from './CreateUserFromLeadModal';

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    lead: {
        id: 'lead-1',
        fullName: 'Alice Smith',
        email: 'alice@example.com',
        bachelorGPA: '3.5/4.0'
    },
    onSuccess: vi.fn()
};

const renderModal = (props: Partial<typeof defaultProps> = {}) =>
    render(<CreateUserFromLeadModal {...defaultProps} {...props} />);

describe('CreateUserFromLeadModal', () => {
    beforeEach(() => {
        mockFormValues = { ...defaultFormValues };
        capturedOnSubmit = null;
        vi.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderModal();
        expect(document.body).toBeTruthy();
    });

    it('renders dialog title', () => {
        renderModal();
        expect(
            screen.getByText('actions.createUserAccountFromLead')
        ).toBeTruthy();
    });

    it('renders cancel button', () => {
        renderModal();
        expect(screen.getByText('actions.cancel')).toBeTruthy();
    });

    it('renders submit button', () => {
        renderModal();
        expect(screen.getByText('actions.createUserAccount')).toBeTruthy();
    });

    it('renders deal inputs', () => {
        renderModal();
        expect(screen.getByText('deals.createDeal')).toBeTruthy();
        expect(
            screen.getByLabelText('deals.dealSizeNtd', { exact: false })
        ).toBeTruthy();
        expect(screen.getByText('deals.statusLabels.closed')).toBeTruthy();
        expect(
            screen.getByLabelText('deals.salesRep', { exact: false })
        ).toBeTruthy();
    });

    it('submits and creates a new deal when no existing open deal', async () => {
        renderModal();
        expect(capturedOnSubmit).toBeTruthy();

        await capturedOnSubmit!({
            value: {
                ...mockFormValues,
                dealSalesUserId: 'sales-1',
                dealSizeNtd: '52000',
                dealNote: 'test note'
            }
        });

        await waitFor(() => {
            expect(addUser).toHaveBeenCalledTimes(1);
            expect(createCRMDeal).toHaveBeenCalledTimes(1);
        });
        expect(updateCRMDeal).not.toHaveBeenCalled();
    });

    it('updates existing open deal when one exists', async () => {
        const propsWithOpenDeal = {
            ...defaultProps,
            lead: {
                ...defaultProps.lead,
                deals: [
                    {
                        id: 'deal-1',
                        status: 'initiated',
                        salesUserId: 'sales-1',
                        dealSizeNtd: 52000,
                        note: 'existing note'
                    }
                ]
            }
        };

        render(<CreateUserFromLeadModal {...propsWithOpenDeal} />);
        expect(capturedOnSubmit).toBeTruthy();

        await capturedOnSubmit!({
            value: {
                ...mockFormValues,
                dealSalesUserId: 'sales-1',
                dealSizeNtd: '52000',
                dealNote: 'updated note'
            }
        });

        await waitFor(() => {
            expect(addUser).toHaveBeenCalledTimes(1);
            expect(updateCRMDeal).toHaveBeenCalledTimes(1);
        });
        expect(createCRMDeal).not.toHaveBeenCalled();
    });

    it('closes modal via callbacks when deal update fails after user creation', async () => {
        vi.mocked(updateCRMDeal).mockRejectedValueOnce(
            new Error('deal failed')
        );
        const onSuccess = vi.fn();
        const onClose = vi.fn();

        const propsWithOpenDeal = {
            ...defaultProps,
            onSuccess,
            onClose,
            lead: {
                ...defaultProps.lead,
                deals: [
                    {
                        id: 'deal-1',
                        status: 'initiated',
                        salesUserId: 'sales-1',
                        dealSizeNtd: 52000,
                        note: 'existing note'
                    }
                ]
            }
        };

        render(<CreateUserFromLeadModal {...propsWithOpenDeal} />);
        expect(capturedOnSubmit).toBeTruthy();

        await capturedOnSubmit!({
            value: {
                ...mockFormValues,
                dealSalesUserId: 'sales-1',
                dealSizeNtd: '52000',
                dealNote: 'updated note'
            }
        });

        await waitFor(() => {
            expect(addUser).toHaveBeenCalledTimes(1);
            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalled();
        });
    });
});
