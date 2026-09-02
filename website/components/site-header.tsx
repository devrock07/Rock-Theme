'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpRightIcon, MenuIcon, SearchIcon } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
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
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { searchablePages } from '@/lib/docs';

const primaryLinks = [
    { href: '/docs', label: 'Docs' },
    { href: '/docs/installation', label: 'Install' },
    { href: '/changelog', label: 'Changelog' },
] as const;

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
            <a
                href="#main-content"
                className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xl transition-transform focus:translate-y-0"
            >
                Skip to content
            </a>
            <header className="site-header sticky top-0 z-50 border-b border-white/[0.06]">
                <div className="mx-auto flex h-16 max-w-[1220px] items-center gap-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 md:hidden">
                        <Sheet>
                            <SheetTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        aria-label="Open navigation"
                                        className="border-white/10 bg-white/[0.035]"
                                    />
                                }
                            >
                                <MenuIcon />
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-[min(88vw,340px)] border-white/10 bg-[#0d0a0b]/98 p-0"
                            >
                                <SheetHeader className="border-b border-white/8 px-5 py-5 text-left">
                                    <SheetTitle className="flex items-center gap-3">
                                        <BrandMark />
                                        Rockdactyl
                                    </SheetTitle>
                                    <SheetDescription>
                                        Documentation and releases.
                                    </SheetDescription>
                                </SheetHeader>
                                <nav
                                    className="flex flex-col gap-1 p-3"
                                    aria-label="Mobile navigation"
                                >
                                    {primaryLinks.map((item) => (
                                        <SheetClose
                                            key={item.href}
                                            nativeButton={false}
                                            render={
                                                <Link
                                                    href={item.href}
                                                    className="rounded-xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                                                />
                                            }
                                        >
                                            {item.label}
                                        </SheetClose>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href="/"
                        className="mr-auto flex items-center gap-3"
                        aria-label="Rockdactyl home"
                    >
                        <BrandMark />
                        <span className="text-sm font-semibold tracking-[-0.035em]">
                            Rockdactyl
                        </span>
                    </Link>

                    <nav
                        className="hidden items-center gap-1 md:flex"
                        aria-label="Primary navigation"
                    >
                        {primaryLinks.map((item) => {
                            const active =
                                item.href === '/docs'
                                    ? pathname === '/docs'
                                    : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'rounded-lg px-3 py-2 text-sm transition-colors',
                                        active
                                            ? 'bg-white/[0.055] text-foreground'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <Button
                        type="button"
                        variant="outline"
                        className="h-9 w-9 border-white/10 bg-white/[0.035] px-0 sm:w-[210px] sm:justify-start sm:px-3"
                        onClick={() => setSearchOpen(true)}
                        aria-label="Search documentation"
                    >
                        <SearchIcon />
                        <span className="hidden text-muted-foreground sm:inline">
                            Search docs
                        </span>
                        <kbd className="ml-auto hidden rounded-md border border-white/8 bg-white/[0.045] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                            Ctrl K
                        </kbd>
                    </Button>

                    <a
                        href="https://github.com/devrock07/Rockdactyl"
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' }),
                            'hidden border-white/10 bg-white/[0.035] px-3.5 sm:inline-flex',
                        )}
                    >
                        GitHub
                        <ArrowUpRightIcon />
                    </a>
                </div>
            </header>

            <CommandDialog
                open={searchOpen}
                onOpenChange={setSearchOpen}
                title="Search Rockdactyl documentation"
                description="Find installation, configuration, operations, and project pages."
                className="top-[22%] max-w-xl border border-white/10 bg-[#100c0e]/98 shadow-2xl"
            >
                <Command className="bg-transparent">
                    <CommandInput placeholder="Search documentation…" />
                    <CommandList className="max-h-[380px] p-1">
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
                                    <span className="ml-auto text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
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
        <span
            className={cn(
                'font-pixel grid size-8 shrink-0 place-items-center rounded-[10px] border border-primary/35 bg-primary/10 text-[15px] font-bold text-primary shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_18%,transparent)]',
                className,
            )}
        >
            R
        </span>
    );
}
