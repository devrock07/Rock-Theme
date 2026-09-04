'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { searchablePages } from '@/lib/docs';
import { cn } from '@/lib/utils';

const productLinks = [
    { href: '/#screens', label: 'Screens' },
    { href: '/#features', label: 'Features' },
    { href: '/#install', label: 'Install' },
] as const;

const githubUrl = 'https://github.com/devrock07/Rockdactyl';

export function SiteHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const [searchOpen, setSearchOpen] = React.useState(false);

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === 'k'
            ) {
                event.preventDefault();
                setSearchOpen((current) => !current);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const go = (href: string) => {
        setSearchOpen(false);
        router.push(href);
    };

    return (
        <>
            <a href="#main-content" className="skip-link">
                Skip to content
            </a>
            <header className="site-header">
                <div className="header-inner">
                    <Link
                        href="/"
                        className="brand-link"
                        aria-label="Rockdactyl home"
                    >
                        <BrandMark />
                        <span>Rockdactyl</span>
                        <small>2.1.1</small>
                    </Link>

                    <nav className="header-nav" aria-label="Product navigation">
                        {productLinks.map((item) => (
                            <Link key={item.href} href={item.href}>
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            href="/docs"
                            aria-current={
                                pathname.startsWith('/docs')
                                    ? 'page'
                                    : undefined
                            }
                        >
                            Docs
                        </Link>
                    </nav>

                    <div className="header-actions">
                        <button
                            type="button"
                            className="header-search"
                            onClick={() => setSearchOpen(true)}
                        >
                            <span>Search docs</span>
                            <kbd>Ctrl K</kbd>
                        </button>
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="header-github"
                        >
                            GitHub <span aria-hidden="true">↗</span>
                            <span className="sr-only">
                                {' '}
                                (opens in a new tab)
                            </span>
                        </a>

                        <div className="mobile-nav">
                            <Sheet>
                                <SheetTrigger
                                    render={
                                        <button
                                            type="button"
                                            className="menu-button"
                                            aria-label="Open navigation"
                                        />
                                    }
                                >
                                    <span
                                        className="menu-glyph"
                                        aria-hidden="true"
                                    >
                                        <span />
                                        <span />
                                    </span>
                                </SheetTrigger>
                                <SheetContent
                                    side="right"
                                    className="w-[min(92vw,360px)] border-white/10 bg-[#0b0909] p-0"
                                >
                                    <SheetHeader className="border-b border-white/8 px-5 py-5 text-left">
                                        <SheetTitle className="flex items-center gap-3">
                                            <BrandMark />
                                            Rockdactyl
                                        </SheetTitle>
                                    </SheetHeader>
                                    <nav
                                        className="mobile-menu"
                                        aria-label="Mobile navigation"
                                    >
                                        <SheetClose
                                            render={
                                                <button
                                                    type="button"
                                                    aria-label="Search documentation"
                                                    onClick={() =>
                                                        setSearchOpen(true)
                                                    }
                                                />
                                            }
                                        >
                                            <span>00</span>
                                            Search documentation
                                        </SheetClose>
                                        {productLinks.map((item, index) => (
                                            <SheetClose
                                                key={item.href}
                                                nativeButton={false}
                                                render={
                                                    <Link href={item.href} />
                                                }
                                            >
                                                <span>
                                                    {String(index + 1).padStart(
                                                        2,
                                                        '0',
                                                    )}
                                                </span>
                                                {item.label}
                                            </SheetClose>
                                        ))}
                                        <SheetClose
                                            nativeButton={false}
                                            render={<Link href="/docs" />}
                                        >
                                            <span>04</span>
                                            Documentation
                                        </SheetClose>
                                        <SheetClose
                                            nativeButton={false}
                                            render={
                                                <a
                                                    href={githubUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    aria-label="Open Rockdactyl on GitHub"
                                                />
                                            }
                                        >
                                            <span>05</span>
                                            GitHub ↗
                                        </SheetClose>
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>

            <CommandDialog
                open={searchOpen}
                onOpenChange={setSearchOpen}
                title="Search Rockdactyl documentation"
                description="Find installation, configuration, operations, and project pages."
                className="top-[18%] w-[calc(100%-2rem)] max-w-xl border border-white/10 bg-[#100c0e]/98 shadow-2xl"
            >
                <Command className="bg-transparent">
                    <CommandInput placeholder="Search documentation…" />
                    <CommandList className="max-h-[min(380px,55vh)] p-1">
                        <CommandEmpty>No page found.</CommandEmpty>
                        <CommandGroup heading="Documentation">
                            {searchablePages.map((item) => (
                                <CommandItem
                                    key={item.href}
                                    value={`${item.title} ${item.description} ${item.group}`}
                                    onSelect={() => go(item.href)}
                                    className="py-3"
                                >
                                    <span className="grid min-w-0 gap-0.5">
                                        <span className="font-medium">
                                            {item.title}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {item.description}
                                        </span>
                                    </span>
                                    <span className="ml-auto hidden text-[10px] uppercase tracking-[0.13em] text-muted-foreground sm:block">
                                        {item.group}
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    );
}

export function BrandMark({ className }: { className?: string }) {
    return (
        <span aria-hidden="true" className={cn('brand-mark', className)}>
            R
        </span>
    );
}
