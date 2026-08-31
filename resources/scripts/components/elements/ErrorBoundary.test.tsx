import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ErrorBoundary from '@/components/elements/ErrorBoundary';

jest.mock('twin.macro', () => ({ __esModule: true, default: () => '' }));

const TestContent = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('render failed');
    }

    return <p>Healthy content</p>;
};

describe('ErrorBoundary', () => {
    it('recovers when its reset key changes', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        const view = render(
            <ErrorBoundary resetKey={'server-a:console'}>
                <TestContent shouldThrow />
            </ErrorBoundary>
        );

        expect(screen.getByText(/error was encountered by the application/i)).toBeInTheDocument();

        view.rerender(
            <ErrorBoundary resetKey={'server-a:files'}>
                <TestContent shouldThrow={false} />
            </ErrorBoundary>
        );

        await waitFor(() => expect(screen.getByText('Healthy content')).toBeInTheDocument());
        consoleError.mockRestore();
    });
});
