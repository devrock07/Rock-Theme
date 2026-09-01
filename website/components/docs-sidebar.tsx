'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { docsNavigation } from '@/lib/docs';
import { cn } from '@/lib/utils';

export function DocsSidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="hidden w-[228px] shrink-0 lg:block"
            aria-label="Documentation navigation"
        >
            <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-6">
                {docsNavigation.map((group) => (
                    <div key={group.label} className="mb-7">
                        <h2 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/75">
                            {group.label}
                        </h2>
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            aria-current={
                                                active ? 'page' : undefined
                                            }
                                            className={cn(
                                                'relative block rounded-lg px-2 py-2 text-sm transition-colors',
                                                active
                                                    ? 'bg-primary/[0.09] text-primary'
                                                    : 'text-muted-foreground hover:bg-white/[0.035] hover:text-foreground',
                                            )}
                                        >
                                            {active && (
                                                <span
                                                    className="absolute inset-y-2 -left-px w-px rounded-full bg-primary"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            {item.title}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
