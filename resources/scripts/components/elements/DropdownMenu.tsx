import React, { createRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';

interface Props {
    children: React.ReactNode;
    renderToggle: (onClick: (e: React.MouseEvent<any, MouseEvent>) => void) => React.ReactElement;
}

export const DropdownButtonRow = styled.button<{ danger?: boolean }>`
    ${tw`p-2 flex items-center rounded w-full text-left`};
    min-height: 2.75rem;
    color: var(--shell-text);
    border: 0;
    background: transparent;
    transition: 150ms all ease;

    &:hover,
    &:focus-visible {
        color: ${(props) => (props.danger ? 'var(--shell-danger)' : 'var(--shell-accent-bright)')};
        background: ${(props) => (props.danger ? 'rgba(225, 66, 82, 0.18)' : 'rgba(var(--shell-accent-rgb), 0.15)')};
    }
`;

const Menu = styled.div`
    ${tw`fixed p-2 rounded shadow-lg`};
    z-index: 10000;
    border: 1px solid rgba(var(--shell-accent-rgb), 0.28);
    background: radial-gradient(circle at 92% 6%, rgba(var(--shell-accent-rgb), 0.18), transparent 42%),
        linear-gradient(145deg, var(--shell-panel-strong), var(--shell-panel));
    color: var(--shell-text);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.48), 0 0 28px rgba(var(--shell-accent-rgb), 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(18px);
`;

interface State {
    posX: number;
    visible: boolean;
}

class DropdownMenu extends React.PureComponent<Props, State> {
    menu = createRef<HTMLDivElement>();
    root = createRef<HTMLDivElement>();
    menuId = `rock-dropdown-${Math.random().toString(36).slice(2)}`;
    openWithKeyboard = false;

    state: State = {
        posX: 0,
        visible: false,
    };

    componentWillUnmount() {
        this.removeListeners();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
        const menu = this.menu.current;
        const root = this.root.current;

        if (this.state.visible && !prevState.visible && menu && root) {
            document.addEventListener('click', this.windowListener);
            document.addEventListener('contextmenu', this.contextMenuListener);
            window.addEventListener('resize', this.closeMenu);
            window.addEventListener('scroll', this.scrollListener, true);
            window.visualViewport?.addEventListener('resize', this.closeMenu);
            window.visualViewport?.addEventListener('scroll', this.closeMenu);
            document.addEventListener('keydown', this.keydownListener);

            const rootRect = root.getBoundingClientRect();
            const viewportPadding = 8;
            const viewport = window.visualViewport;
            const viewportLeft = viewport?.offsetLeft ?? 0;
            const viewportTop = viewport?.offsetTop ?? 0;
            const viewportRight = viewportLeft + (viewport?.width ?? window.innerWidth);
            const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
            const minimumLeft = viewportLeft + viewportPadding;
            const minimumTop = viewportTop + viewportPadding;
            const maximumLeft = Math.max(minimumLeft, viewportRight - viewportPadding - menu.clientWidth);
            const anchorX = this.state.posX > 0 ? this.state.posX : rootRect.right;
            const left = Math.min(maximumLeft, Math.max(minimumLeft, Math.round(anchorX - menu.clientWidth)));
            const below = rootRect.bottom + 4;
            const above = rootRect.top - menu.clientHeight - 4;
            const top =
                below + menu.clientHeight <= viewportBottom - viewportPadding ? below : Math.max(minimumTop, above);

            menu.style.left = `${left}px`;
            menu.style.top = `${Math.round(top)}px`;

            if (this.openWithKeyboard) {
                menu.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
                this.openWithKeyboard = false;
            }
        }

        if (!this.state.visible && prevState.visible) {
            this.removeListeners();
        }
    }

    removeListeners = () => {
        document.removeEventListener('click', this.windowListener);
        document.removeEventListener('contextmenu', this.contextMenuListener);
        window.removeEventListener('resize', this.closeMenu);
        window.removeEventListener('scroll', this.scrollListener, true);
        window.visualViewport?.removeEventListener('resize', this.closeMenu);
        window.visualViewport?.removeEventListener('scroll', this.closeMenu);
        document.removeEventListener('keydown', this.keydownListener);
    };

    closeMenu = () => this.setState({ visible: false });

    focusToggle = () => this.root.current?.querySelector<HTMLElement>('button, [href], [tabindex]')?.focus();

    scrollListener = (event: Event) => {
        const menu = this.menu.current;
        const target = event.target;

        if (menu && target instanceof Node && (target === menu || menu.contains(target))) return;

        this.closeMenu();
    };

    onClickHandler = (e: React.MouseEvent<any, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        this.openWithKeyboard = e.detail === 0;
        this.triggerMenu(e.clientX);
    };

    keydownListener = (event: KeyboardEvent) => {
        if (!this.state.visible) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            this.closeMenu();
            this.focusToggle();
            return;
        }

        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

        const items = Array.from(
            this.menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') || []
        );
        if (!items.length) return;

        event.preventDefault();
        const current = items.indexOf(document.activeElement as HTMLElement);
        const index =
            event.key === 'Home'
                ? 0
                : event.key === 'End'
                ? items.length - 1
                : event.key === 'ArrowUp'
                ? (current <= 0 ? items.length : current) - 1
                : (current + 1) % items.length;
        items[index].focus();
    };

    contextMenuListener = () => this.setState({ visible: false });

    windowListener = (e: MouseEvent) => {
        const menu = this.menu.current;

        if (e.button === 2 || !this.state.visible || !menu) {
            return;
        }

        if (e.target === menu || menu.contains(e.target as Node)) {
            return;
        }

        if (e.target !== menu && !menu.contains(e.target as Node)) {
            this.setState({ visible: false });
        }
    };

    triggerMenu = (posX: number) =>
        this.setState((s) => ({
            posX: !s.visible ? posX : s.posX,
            visible: !s.visible,
        }));

    render() {
        const portalTarget = typeof document !== 'undefined' ? document.body : null;
        const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

        const toggle = React.cloneElement(this.props.renderToggle(this.onClickHandler), {
            'aria-haspopup': 'menu',
            'aria-expanded': this.state.visible,
            'aria-controls': this.state.visible ? this.menuId : undefined,
        });

        return (
            <div ref={this.root} style={{ position: 'relative', display: 'inline-block' }}>
                {toggle}
                {portalTarget &&
                    createPortal(
                        <Fade timeout={150} in={this.state.visible} unmountOnExit>
                            <Menu
                                ref={this.menu}
                                id={this.menuId}
                                role={'menu'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Restore focus before the selected action can mount a
                                    // dialog in the same React update. That dialog will then
                                    // remember the stable toggle instead of a menu item that
                                    // is about to be removed from the portal.
                                    this.focusToggle();
                                    this.setState({ visible: false });
                                }}
                                style={{
                                    width: '12rem',
                                    maxWidth: Math.max(0, viewportWidth - 16),
                                    maxHeight: Math.max(0, viewportHeight - 16),
                                    overflowY: 'auto',
                                    overscrollBehavior: 'contain',
                                }}
                            >
                                {this.props.children}
                            </Menu>
                        </Fade>,
                        portalTarget
                    )}
            </div>
        );
    }
}

export default DropdownMenu;
