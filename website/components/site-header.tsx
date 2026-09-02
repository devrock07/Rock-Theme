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
            <a
                href="#main-content"
                className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xl transition-transform focus:translate-y-0"
            >
                Skip to content
            </a>
            <header className="site-header sticky top-0 z-50 border-b border-white/[0.06]">
                <div className="mx-auto flex h-16 max-w-[1220px] items-center gap-3 px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="mr-auto flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        aria-label="Rockdactyl home"
                    >
                        <BrandMark />
                        <span className="text-sm font-semibold tracking-[-0.035em]">
                            Rockdactyl
                        </span>
                    </Link>

                    <nav
                        className="hidden items-center gap-0.5 rounded-xl border border-white/[0.065] bg-white/[0.025] p-1 md:flex"
                        aria-label="Product navigation"
                    >
                        {productLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-muted-foreground outline-none transition-colors hover:bg-white/[0.05] hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div
                        className="hidden h-5 w-px bg-white/[0.09] md:block"
                        aria-hidden="true"
                    />

                    <Link
                        href="/docs"
                        aria-current={
                            pathname.startsWith('/docs') ? 'page' : undefined
                        }
                        className={cn(
                            'hidden h-9 items-center rounded-lg px-2.5 text-[13px] font-medium outline-none transition-colors md:inline-flex',
                            pathname.startsWith('/docs')
                                ? 'bg-white/[0.055] text-foreground'
                                : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
                            'focus-visible:ring-2 focus-visible:ring-primary/50',
                        )}
                    >
                        Docs
                    </Link>

                    <Button
                        type="button"
                        variant="outline"
                        className="h-9 w-9 border-white/10 bg-white/[0.035] px-0 xl:w-[172px] xl:justify-start xl:px-3"
                        onClick={() => setSearchOpen(true)}
                        aria-label="Search documentation"
                    >
                        <SearchIcon aria-hidden="true" />
                        <span className="hidden text-muted-foreground xl:inline">
                            Search docs
                        </span>
                        <kbd className="ml-auto hidden rounded-md border border-white/8 bg-white/[0.045] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground 2xl:inline">
                            Ctrl K
                        </kbd>
                    </Button>

                    <a
                        href={githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' }),
                            'hidden h-9 border-white/10 bg-white/[0.035] px-3 md:inline-flex',
                        )}
                    >
                        GitHub
                        <ArrowUpRightIcon aria-hidden="true" />
                        <span className="sr-only"> (opens in a new tab)</span>
                    </a>

                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        size="icon-lg"
                                        aria-label="Open navigation"
                                        className="border-white/10 bg-white/[0.035]"
                                    />
                                }
                            >
                                <MenuIcon aria-hidden="true" />
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-[min(88vw,340px)] border-white/10 bg-[#0d0a0b]/98 p-0"
                            >
                                <SheetHeader className="border-b border-white/8 px-5 py-5 text-left">
                                    <SheetTitle className="flex items-center gap-3">
                                        <BrandMark />
                                        Rockdactyl
                                    </SheetTitle>
                                    <SheetDescription>
                                        Explore the product, install it, or open
                                        the project resources.
                                    </SheetDescription>
                                </SheetHeader>
                                <nav
                                    className="flex flex-col p-3"
                                    aria-label="Mobile navigation"
                                >
                                    <p className="px-4 pb-2 pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                                        Product
                                    </p>
                                    {productLinks.map((item) => (
                                        <SheetClose
                                            key={item.href}
                                            nativeButton={false}
                                            render={
                                                <Link
                                                    href={item.href}
                                                    className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground outline-none transition hover:bg-white/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50"
                                                />
                                            }
                                        >
                                            {item.label}
                                        </SheetClose>
                                    ))}

                                    <div className="my-3 h-px bg-white/[0.07]" />
                                    <p className="px-4 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                                        Resources
                                    </p>
                                    <SheetClose
                                        nativeButton={false}
                                        render={
                                            <Link
                                                href="/docs"
                                                aria-current={
                                                    pathname.startsWith('/docs')
                                                        ? 'page'
                                                        : undefined
                                                }
                                                className={cn(
                                                    'rounded-xl px-4 py-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-primary/50',
                                                    pathname.startsWith('/docs')
                                                        ? 'bg-white/[0.055] text-foreground'
                                                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                                                )}
                                            />
                                        }
                                    >
                                        Docs
                                    </SheetClose>
                                    <SheetClose
                                        nativeButton={false}
                                        render={
                                            <a
                                                href={githubUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label="Open Rockdactyl on GitHub (opens in a new tab)"
                                                className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground outline-none transition hover:bg-white/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/50"
                                            />
                                        }
                                    >
                                        GitHub
                                        <ArrowUpRightIcon
                                            className="ml-auto size-4"
                                            aria-hidden="true"
                                        />
                                        <span className="sr-only">
                                            {' '}
                                            (opens in a new tab)
                                        </span>
                                    </SheetClose>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
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
            aria-hidden="true"
            className={cn(
                'font-pixel grid size-8 shrink-0 place-items-center rounded-[10px] border border-primary/35 bg-primary/10 text-[15px] font-bold text-primary shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_18%,transparent)]',
                className,
            )}
        >
            R
        </span>
    );
}
