import React, { createRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';

interface Props {
    children: React.ReactNode;
    renderToggle: (onClick: (e: React.MouseEvent<any, MouseEvent>) => void) => React.ReactChild;
}

export const DropdownButtonRow = styled.button<{ danger?: boolean }>`
    ${tw`p-2 flex items-center rounded w-full`};
    color: #c9b7bc;
    transition: 150ms all ease;

    &:hover {
        color: ${(props) => (props.danger ? '#ff8d98' : '#ffd6da')};
        background: ${(props) => (props.danger ? 'rgba(225, 66, 82, 0.18)' : 'rgba(var(--shell-accent-rgb), 0.15)')};
    }
`;

const Menu = styled.div`
    ${tw`fixed p-2 rounded shadow-lg`};
    z-index: 10000;
    border: 1px solid rgba(var(--shell-accent-rgb), 0.28);
    background: radial-gradient(circle at 92% 6%, rgba(var(--shell-accent-rgb), 0.18), transparent 42%),
        linear-gradient(145deg, rgba(31, 17, 22, 0.98), rgba(15, 11, 14, 0.99));
    color: #c9b7bc;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.48), 0 0 28px rgba(var(--shell-accent-rgb), 0.1),
        inset 0 1px 0 rgba(255, 214, 218, 0.06);
    backdrop-filter: blur(18px);
`;

interface State {
    posX: number;
    visible: boolean;
}

class DropdownMenu extends React.PureComponent<Props, State> {
    menu = createRef<HTMLDivElement>();
    root = createRef<HTMLDivElement>();

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
            window.addEventListener('scroll', this.closeMenu, true);

            const rootRect = root.getBoundingClientRect();
            const viewportPadding = 8;
            const maximumLeft = Math.max(viewportPadding, window.innerWidth - viewportPadding - menu.clientWidth);
            const left = Math.min(
                maximumLeft,
                Math.max(viewportPadding, Math.round(this.state.posX - menu.clientWidth))
            );
            const below = rootRect.bottom + 4;
            const above = rootRect.top - menu.clientHeight - 4;
            const top =
                below + menu.clientHeight <= window.innerHeight - viewportPadding
                    ? below
                    : Math.max(viewportPadding, above);

            menu.style.left = `${left}px`;
            menu.style.top = `${Math.round(top)}px`;
        }

        if (!this.state.visible && prevState.visible) {
            this.removeListeners();
        }
    }

    removeListeners = () => {
        document.removeEventListener('click', this.windowListener);
        document.removeEventListener('contextmenu', this.contextMenuListener);
        window.removeEventListener('resize', this.closeMenu);
        window.removeEventListener('scroll', this.closeMenu, true);
    };

    closeMenu = () => this.setState({ visible: false });

    onClickHandler = (e: React.MouseEvent<any, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        this.triggerMenu(e.clientX);
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

        return (
            <div ref={this.root} style={{ position: 'relative', display: 'inline-block' }}>
                {this.props.renderToggle(this.onClickHandler)}
                {portalTarget &&
                    createPortal(
                        <Fade timeout={150} in={this.state.visible} unmountOnExit>
                            <Menu
                                ref={this.menu}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.setState({ visible: false });
                                }}
                                style={{ width: '12rem' }}
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
