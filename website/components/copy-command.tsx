'use client';

import * as React from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function CopyCommand({ value }: { value: string }) {
    const [copied, setCopied] = React.useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    return (
        <span className="relative inline-flex">
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={copy}
                aria-label={copied ? 'Copied command' : 'Copy command'}
                className="text-muted-foreground hover:text-foreground"
            >
                {copied ? <CheckIcon /> : <CopyIcon />}
            </Button>
            <span className="sr-only" aria-live="polite">
                {copied ? 'Command copied to clipboard.' : ''}
            </span>
        </span>
    );
}
