import React, { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import QuickServerDrawer from '@/components/dashboard/QuickServerDrawer';
import { Server } from '@/api/server/getServer';

jest.mock('@/api/http', () => ({
    __esModule: true,
    default: { post: jest.fn() },
}));

jest.mock('styled-components/macro', () => ({
    __esModule: true,
    default: new Proxy(
        {},
        {
            get:
                (_target, tag: string) =>
                () =>
                ({ children, ...props }: React.HTMLAttributes<HTMLElement>) =>
                    React.createElement(tag, props, children),
        }
    ),
}));

const makeServer = (powerPermissions: Server['powerPermissions']): Server =>
    ({
        id: 'abc123',
        identifier: 'serv_abc123',
        uuid: '00000000-0000-0000-0000-000000000000',
        name: 'Test Server',
        allocations: [],
        powerPermissions,
    } as unknown as Server);

const renderDrawer = (powerPermissions: Server['powerPermissions']) =>
    render(
        <MemoryRouter>
            <QuickServerDrawer
                server={makeServer(powerPermissions)}
                stats={null}
                group={''}
                onGroupChange={jest.fn()}
                onClose={jest.fn()}
            />
        </MemoryRouter>
    );

test('disables power actions the account cannot use', () => {
    renderDrawer({ start: true, restart: false, stop: false });

    expect(screen.getByRole('button', { name: 'Start' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Restart' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Stop' })).toBeDisabled();
});

test('enables all power actions for an authorized account', () => {
    renderDrawer({ start: true, restart: true, stop: true });

    expect(screen.getByRole('button', { name: 'Start' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Restart' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Stop' })).toBeEnabled();
});

test('keeps the server group field focused while entering a keyword', () => {
    const ControlledDrawer = () => {
        const [group, setGroup] = useState('');

        return (
            <MemoryRouter>
                <QuickServerDrawer
                    server={makeServer({ start: true, restart: true, stop: true })}
                    stats={null}
                    group={group}
                    onGroupChange={setGroup}
                    onClose={() => undefined}
                />
            </MemoryRouter>
        );
    };

    render(<ControlledDrawer />);
    const input = screen.getByRole('textbox', { name: 'Server group' });
    input.focus();

    for (const value of ['d', 'de', 'dev']) {
        fireEvent.change(input, { target: { value } });
        expect(input).toHaveFocus();
    }

    expect(input).toHaveValue('dev');
});
