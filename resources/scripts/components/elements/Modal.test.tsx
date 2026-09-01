import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Modal from '@/components/elements/Modal';

jest.mock('twin.macro', () => ({ __esModule: true, default: () => '' }));
jest.mock('styled-components/macro', () => ({
    __esModule: true,
    css: () => '',
    default: new Proxy(
        {},
        {
            get: (_target, tag: string) => () =>
                React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { alignTop?: boolean }>(
                    ({ children, alignTop: _alignTop, ...props }, ref) =>
                        React.createElement(tag, { ...props, ref }, children)
                ),
        }
    ),
}));
jest.mock('@/components/elements/Fade', () => ({
    __esModule: true,
    default: ({ in: visible, children }: { in: boolean; children: React.ReactNode }) => (visible ? children : null),
}));
jest.mock('@/components/elements/Spinner', () => () => null);

describe('Modal focus management', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="modal-portal"></div>';
    });

    it('restores the launcher after an auto-focused field closes', () => {
        const view = render(
            <>
                <button type={'button'}>Open editor</button>
                <Modal visible={false} onDismissed={() => undefined}>
                    <input autoFocus aria-label={'File name'} />
                </Modal>
            </>
        );
        const launcher = screen.getByRole('button', { name: 'Open editor' });
        launcher.focus();

        view.rerender(
            <>
                <button type={'button'}>Open editor</button>
                <Modal visible onDismissed={() => undefined}>
                    <input autoFocus aria-label={'File name'} />
                </Modal>
            </>
        );

        expect(screen.getByRole('textbox', { name: 'File name' })).toHaveFocus();
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(launcher).toHaveFocus();
    });

    it('brings escaped keyboard focus back into the dialog', () => {
        render(
            <>
                <button type={'button'}>Outside</button>
                <Modal visible onDismissed={() => undefined}>
                    <button type={'button'}>First action</button>
                    <button type={'button'}>Last action</button>
                </Modal>
            </>
        );

        screen.getByRole('button', { name: 'Outside' }).focus();
        fireEvent.keyDown(document, { key: 'Tab' });
        expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
    });
});
