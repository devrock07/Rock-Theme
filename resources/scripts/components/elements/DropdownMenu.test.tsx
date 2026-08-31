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
    beforeEach(() => {
        Object.defineProperty(window, 'visualViewport', { configurable: true, value: undefined });
    });

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

    it('limits the menu to the current visual viewport', () => {
        Object.defineProperty(window, 'visualViewport', {
            configurable: true,
            value: {
                width: 320,
                height: 280,
                offsetLeft: 0,
                offsetTop: 0,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
            },
        });

        render(
            <DropdownMenu renderToggle={(onClick) => <button onClick={onClick}>Actions</button>}>
                <button>Download</button>
            </DropdownMenu>
        );
        fireEvent.click(screen.getByRole('button', { name: 'Actions' }));

        expect(screen.getByRole('button', { name: 'Download' }).parentElement).toHaveStyle({
            maxWidth: '304px',
            maxHeight: '264px',
            overflowY: 'auto',
        });
    });

    it('stays open while its own constrained menu scrolls', () => {
        render(
            <DropdownMenu renderToggle={(onClick) => <button onClick={onClick}>Actions</button>}>
                <button>Download</button>
            </DropdownMenu>
        );
        fireEvent.click(screen.getByRole('button', { name: 'Actions' }));

        const action = screen.getByRole('button', { name: 'Download' });
        fireEvent.scroll(action.parentElement!);
        expect(action).toBeInTheDocument();

        fireEvent.scroll(window);
        expect(screen.queryByRole('button', { name: 'Download' })).not.toBeInTheDocument();
    });
});
