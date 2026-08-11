import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import DropdownMenu from '@/components/elements/DropdownMenu';

jest.mock('twin.macro', () => ({ __esModule: true, default: () => '' }));
jest.mock('styled-components/macro', () => ({
    __esModule: true,
    default: new Proxy(
        {},
        {
            get: (_target, tag: string) => () =>
                React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ children, ...props }, ref) =>
                    React.createElement(tag, { ...props, ref }, children)
                ),
        }
    ),
}));
jest.mock('@/components/elements/Fade', () => ({
    __esModule: true,
    default: ({ in: visible, children }: { in: boolean; children: React.ReactNode }) => (visible ? children : null),
}));

describe('DropdownMenu', () => {
    it('renders the menu outside clipping containers and closes on an outside click', () => {
        const { container } = render(
            <div style={{ overflow: 'hidden' }}>
                <DropdownMenu renderToggle={(onClick) => <button onClick={onClick}>Actions</button>}>
                    <button>Download</button>
                </DropdownMenu>
            </div>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Actions' }));

        expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
        expect(container).not.toHaveTextContent('Download');

        fireEvent.click(document.body);
        expect(screen.queryByRole('button', { name: 'Download' })).not.toBeInTheDocument();
    });
});
