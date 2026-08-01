import React, { createRef } from 'react';
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
        background: ${(props) => (props.danger ? 'rgba(225, 66, 82, 0.18)' : 'rgba(201, 79, 89, 0.15)')};
    }
`;

const Menu = styled.div`
    ${tw`absolute p-2 rounded shadow-lg z-50`};
    border: 1px solid rgba(240, 138, 144, 0.28);
    background: radial-gradient(circle at 92% 6%, rgba(201, 79, 89, 0.18), transparent 42%),
        linear-gradient(145deg, rgba(31, 17, 22, 0.98), rgba(15, 11, 14, 0.99));
    color: #c9b7bc;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.48), 0 0 28px rgba(201, 79, 89, 0.1),
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

            const rootRect = root.getBoundingClientRect();
            const relativeX = this.state.posX - rootRect.left;
            const viewportPadding = 8;
            const minimumLeft = viewportPadding - rootRect.left;
            const maximumLeft = window.innerWidth - viewportPadding - rootRect.left - menu.clientWidth;
            const left = Math.min(maximumLeft, Math.max(minimumLeft, Math.round(relativeX - menu.clientWidth)));
            menu.style.left = `${left}px`;
            menu.style.top = `${Math.round(rootRect.height + 4)}px`;
        }

        if (!this.state.visible && prevState.visible) {
            this.removeListeners();
        }
    }

    removeListeners = () => {
        document.removeEventListener('click', this.windowListener);
        document.removeEventListener('contextmenu', this.contextMenuListener);
    };

    onClickHandler = (e: React.MouseEvent<any, MouseEvent>) => {
        e.preventDefault();
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
        return (
            <div
                ref={this.root}
                style={{ position: 'relative', display: 'inline-block', zIndex: this.state.visible ? 60 : 'auto' }}
            >
                {this.props.renderToggle(this.onClickHandler)}
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
                </Fade>
            </div>
        );
    }
}

export default DropdownMenu;
