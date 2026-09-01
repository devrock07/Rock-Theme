import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircle2Icon,
    InfoIcon,
    TriangleAlertIcon,
} from 'lucide-react';

import { CopyCommand } from '@/components/copy-command';
import { DocsSidebar } from '@/components/docs-sidebar';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { docsNavigation, type DocPage as DocPageType } from '@/lib/docs';
import { cn } from '@/lib/utils';

const flatNavigation = docsNavigation.flatMap((group) => group.items);

export function DocumentationPage({ doc }: { doc: DocPageType }) {
    const currentHref = doc.slug === 'overview' ? '/docs' : `/docs/${doc.slug}`;
    const index = flatNavigation.findIndex((item) => item.href === currentHref);
    const previous = index > 0 ? flatNavigation[index - 1] : undefined;
    const next =
        index >= 0 && index < flatNavigation.length - 1
            ? flatNavigation[index + 1]
            : undefined;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <SiteHeader />
            <div
                className="site-grid pointer-events-none fixed inset-0 -z-10"
                aria-hidden="true"
            />
            <main
                id="main-content"
                className="mx-auto flex max-w-[1220px] gap-10 px-5 py-12 sm:px-6 lg:px-8 lg:py-16"
            >
                <DocsSidebar />

                <article className="min-w-0 flex-1 lg:max-w-[720px]">
                    <div className="mb-12 border-b border-white/[0.075] pb-10">
                        <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                            {doc.eyebrow}
                        </p>
                        <h1 className="text-balance text-[clamp(2.5rem,6vw,4.6rem)] font-semibold leading-[0.96] tracking-[-0.055em]">
                            {doc.title}
                        </h1>
                        <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                            {doc.description}
                        </p>
                    </div>

                    <div className="doc-content">
                        {doc.sections.map((section) => (
                            <section
                                key={section.id}
                                id={section.id}
                                className="scroll-mt-24 border-b border-white/[0.065] py-10 first:pt-0"
                            >
                                <h2 className="text-2xl font-semibold tracking-[-0.035em]">
                                    {section.title}
                                </h2>

                                {section.body?.map((paragraph) => (
                                    <p
                                        key={paragraph}
                                        className="mt-4 text-[15px] leading-7 text-muted-foreground"
                                    >
                                        {paragraph}
                                    </p>
                                ))}

                                {section.bullets && (
                                    <ul className="mt-5 space-y-3">
                                        {section.bullets.map((item) => (
                                            <li
                                                key={item}
                                                className="flex gap-3 text-[15px] leading-6 text-muted-foreground"
                                            >
                                                <span
                                                    className="mt-[9px] size-1.5 shrink-0 rounded-full bg-primary/80"
                                                    aria-hidden="true"
                                                />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {section.steps && (
                                    <ol className="mt-7 space-y-5">
                                        {section.steps.map(
                                            (step, stepIndex) => (
                                                <li
                                                    key={step.title}
                                                    className="grid grid-cols-[32px_1fr] gap-4"
                                                >
                                                    <span className="grid size-8 place-items-center rounded-lg border border-primary/20 bg-primary/[0.075] font-mono text-xs font-semibold text-primary">
                                                        {String(
                                                            stepIndex + 1,
                                                        ).padStart(2, '0')}
                                                    </span>
                                                    <div className="pt-1">
                                                        <h3 className="font-semibold">
                                                            {step.title}
                                                        </h3>
                                                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                                                            {step.body}
                                                        </p>
                                                        {step.code && (
                                                            <CodeBlock
                                                                code={step.code}
                                                                className="mt-4"
                                                            />
                                                        )}
                                                    </div>
                                                </li>
                                            ),
                                        )}
                                    </ol>
                                )}

                                {section.code && (
                                    <div className="mt-7 space-y-4">
                                        {section.code.map((code) => (
                                            <CodeBlock
                                                key={`${code.label}-${code.value}`}
                                                code={code}
                                            />
                                        ))}
                                    </div>
                                )}

                                {section.callout && (
                                    <Callout callout={section.callout} />
                                )}
                            </section>
                        ))}
                    </div>

                    <nav
                        className="mt-10 grid gap-3 sm:grid-cols-2"
                        aria-label="Adjacent documentation pages"
                    >
                        {previous ? (
                            <Link
                                href={previous.href}
                                className="group rounded-2xl border border-white/[0.085] bg-white/[0.025] p-5 transition hover:border-primary/25 hover:bg-primary/[0.035]"
                            >
                                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <ArrowLeftIcon className="size-3.5" />{' '}
                                    Previous
                                </span>
                                <span className="mt-2 block font-semibold group-hover:text-primary">
                                    {previous.title}
                                </span>
                            </Link>
                        ) : (
                            <span />
                        )}
                        {next && (
                            <Link
                                href={next.href}
                                className="group rounded-2xl border border-white/[0.085] bg-white/[0.025] p-5 text-right transition hover:border-primary/25 hover:bg-primary/[0.035]"
                            >
                                <span className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                                    Next <ArrowRightIcon className="size-3.5" />
                                </span>
                                <span className="mt-2 block font-semibold group-hover:text-primary">
                                    {next.title}
                                </span>
                            </Link>
                        )}
                    </nav>
                </article>

                <aside
                    className="hidden w-[190px] shrink-0 xl:block"
                    aria-label="On this page"
                >
                    <div className="sticky top-24">
                        <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/75">
                            On this page
                        </h2>
                        <ul className="mt-3 space-y-2.5 border-l border-white/8 pl-4 text-xs text-muted-foreground">
                            {doc.sections.map((section) => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <a
                            href="https://github.com/devrock07/Rockdactyl/edit/main/website/lib/docs.ts"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-8 inline-block text-xs text-muted-foreground transition-colors hover:text-primary"
                        >
                            Edit docs source on GitHub ↗
                        </a>
                    </div>
                </aside>
            </main>
            <SiteFooter />
        </div>
    );
}

function CodeBlock({
    code,
    className,
}: {
    code: { label?: string; language?: string; value: string };
    className?: string;
}) {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl border border-white/[0.085] bg-[#080607]',
                className,
            )}
        >
            <div className="flex min-h-10 items-center border-b border-white/[0.065] px-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {code.label ?? code.language ?? 'Command'}
                </span>
                <span className="ml-auto">
                    <CopyCommand value={code.value} />
                </span>
            </div>
            <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-[#f4b6bf]">
                <code>{code.value}</code>
            </pre>
        </div>
    );
}

function Callout({
    callout,
}: {
    callout: {
        title: string;
        body: string;
        tone?: 'info' | 'warning' | 'success';
    };
}) {
    const tone = callout.tone ?? 'info';
    const Icon =
        tone === 'warning'
            ? TriangleAlertIcon
            : tone === 'success'
              ? CheckCircle2Icon
              : InfoIcon;

    return (
        <div
            className={cn(
                'mt-7 grid grid-cols-[20px_1fr] gap-3 rounded-2xl border p-4',
                tone === 'warning' &&
                    'border-amber-300/15 bg-amber-300/[0.045]',
                tone === 'success' &&
                    'border-emerald-300/15 bg-emerald-300/[0.045]',
                tone === 'info' && 'border-primary/15 bg-primary/[0.045]',
            )}
        >
            <Icon
                className={cn(
                    'mt-0.5 size-4',
                    tone === 'warning'
                        ? 'text-amber-300'
                        : tone === 'success'
                          ? 'text-emerald-300'
                          : 'text-primary',
                )}
                aria-hidden="true"
            />
            <div>
                <h3 className="text-sm font-semibold">{callout.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {callout.body}
                </p>
            </div>
        </div>
    );
}
