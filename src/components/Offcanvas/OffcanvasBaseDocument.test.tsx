import { render, screen } from '@testing-library/react';
import OffcanvasBaseDocument from './OffcanvasBaseDocument';

describe('OffcanvasBaseDocument', () => {
    test('renders when open', () => {
        const onChangeURL = vi.fn(() => {});
        const onHide = vi.fn(() => {});
        const updateDocLink = vi.fn(() => {});
        render(
            <OffcanvasBaseDocument
                docName="Test Doc"
                link="https://example.com"
                onChangeURL={onChangeURL}
                onHide={onHide}
                open={true}
                updateDocLink={updateDocLink}
            />
        );
        expect(screen.getByText(/Edit/i)).toBeInTheDocument();
        expect(screen.getByText(/Documentation Link for/)).toBeInTheDocument();
        expect(screen.getByText('Test Doc')).toBeInTheDocument();
    });

    test('does not render content when closed', () => {
        const onChangeURL = vi.fn(() => {});
        const onHide = vi.fn(() => {});
        const updateDocLink = vi.fn(() => {});
        render(
            <OffcanvasBaseDocument
                docName="Test Doc"
                link=""
                onChangeURL={onChangeURL}
                onHide={onHide}
                open={false}
                updateDocLink={updateDocLink}
            />
        );
        expect(screen.queryByText('Test Doc')).not.toBeInTheDocument();
    });
});
