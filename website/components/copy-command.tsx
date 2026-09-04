'use client';

import * as React from 'react';

export function CopyCommand({ value }: { value: string }) {
    const [copied, setCopied] = React.useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    return (
        <span className="relative inline-flex">
            <button
                type="button"
                onClick={copy}
                aria-label={copied ? 'Copied command' : 'Copy command'}
                className="inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                {copied ? 'Copied' : 'Copy'}
            </button>
            <span className="sr-only" aria-live="polite">
                {copied ? 'Command copied to clipboard.' : ''}
            </span>
        </span>
    );
}
