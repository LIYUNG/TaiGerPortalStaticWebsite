import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DescriptionBlock from './DescriptionBlock';

vi.mock('i18next', () => ({ default: { t: (k: string) => k } }));

vi.mock('@components/AuthProvider', () => ({
    useAuth: () => ({ user: null })
}));

vi.mock('@store/constant', () => ({
    default: {
        CV_ML_RL_DOCS_LINK: '/docs',
        DOCUMENT_MODIFICATION_INPUT_LINK: (id: string) => `/editor/${id}`
    }
}));

vi.mock('@/api', () => ({ BASE_URL: 'http://localhost:3000' }));

vi.mock('../../../../config', () => ({
    appConfig: { companyName: 'TaiGer' }
}));

vi.mock('@taiger-common/core', () => ({
    is_TaiGer_role: vi.fn(() => false)
}));

const mlThread = { file_type: 'ML' } as any;

describe('DescriptionBlock', () => {
    const render_ = (props: Parameters<typeof DescriptionBlock>[0]) =>
        render(
            <MemoryRouter>
                <DescriptionBlock {...props} />
            </MemoryRouter>
        );

    it('renders View Documentation button when template_obj provided', () => {
        const template_obj = { prop: 'ML', alias: 'MotivationLetter' } as any;
        render_({ thread: mlThread, template_obj, documentsthreadId: 'tid1' });
        expect(screen.getByText('View Documentation')).toBeInTheDocument();
    });

    it('renders Portfolio fallback when no template_obj', () => {
        const thread = { file_type: 'Portfolio' } as any;
        render_({ thread, template_obj: null, documentsthreadId: 'tid1' });
        expect(
            screen.getByText(/Please upload the portfolio/)
        ).toBeInTheDocument();
    });

    it('renders Supplementary_Form fallback', () => {
        const thread = { file_type: 'Supplementary_Form' } as any;
        render_({ thread, template_obj: null, documentsthreadId: 'tid1' });
        expect(
            screen.getByText(/請填好這個 program 的 Supplementary Form/)
        ).toBeInTheDocument();
    });
});
