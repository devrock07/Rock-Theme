import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';
// @ts-expect-error untyped font file
import font from '@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2';

export default createGlobalStyle`
    :root {
        color-scheme: dark;
        --shell-bg: #080808;
        --shell-panel: #0e0e10;
        --shell-panel-strong: #121214;
        --shell-panel-soft: #171719;
        --shell-border: rgba(255, 255, 255, 0.09);
        --shell-border-strong: rgba(255, 255, 255, 0.19);
        --shell-text: #f4f3f7;
        --shell-muted: #85838d;
        --shell-accent: #c94f59;
        --shell-accent-rgb: 201, 79, 89;
        --shell-accent-bright: #f08a90;
        --shell-accent-soft: rgba(201, 79, 89, 0.12);
        --shell-success: #72d6a5;
        --shell-warning: #e9b96e;
        --shell-danger: #ed7682;
        --shell-radius: 12px;
        --shell-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
        --shell-grid: rgba(255, 255, 255, 0.052);
    }

    :root[data-rock-theme='crimson-glass'] {
        --shell-bg: #0b080a;
        --shell-panel: #151014;
        --shell-panel-strong: #1b1217;
        --shell-border: rgba(255, 225, 230, 0.11);
        --shell-shadow: 0 28px 80px rgba(44, 4, 13, 0.4);
    }

    :root[data-rock-theme='pure-black'] {
        --shell-bg: #030304;
        --shell-panel: #080809;
        --shell-panel-strong: #0b0b0c;
        --shell-panel-soft: #101011;
        --shell-border: rgba(255, 255, 255, 0.075);
    }

    :root[data-rock-theme='minimal-light'] {
        color-scheme: light;
        --shell-bg: #e9e6e7;
        --shell-panel: #f8f6f7;
        --shell-panel-strong: #ffffff;
        --shell-panel-soft: #dedadc;
        --shell-border: rgba(40, 22, 28, 0.12);
        --shell-border-strong: rgba(40, 22, 28, 0.22);
        --shell-text: #211b1d;
        --shell-muted: #746b6f;
        --shell-shadow: 0 22px 60px rgba(55, 35, 42, 0.12);
        --shell-grid: rgba(40, 22, 28, 0.075);
    }

    :root[data-rock-motion='reduced'] *,
    :root[data-rock-motion='reduced'] *::before,
    :root[data-rock-motion='reduced'] *::after {
        scroll-behavior: auto !important;
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
    }

    @font-face {
        font-family: 'IBM Plex Sans';
        font-style: normal;
        font-display: swap;
        font-weight: 100 700;
        src: url(${font}) format('woff2-variations');
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    html, body, #app {
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
        overflow-x: clip;
    }

    body {
        ${tw`font-sans text-neutral-200`};
        min-height: 100vh;
        letter-spacing: -0.01em;
        background:
            radial-gradient(circle at 1px 1px, var(--shell-grid) 1px, transparent 0),
            var(--shell-bg);
        background-size: 28px 28px, auto;
        background-attachment: fixed;
    }

    .nook-container {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 100%;
        min-height: 100vh;
    }

    .nook-container::before {
        position: fixed;
        inset: 0;
        z-index: -1;
        content: '';
        pointer-events: none;
        background:
            linear-gradient(115deg, transparent 0 38%, rgba(var(--shell-accent-rgb), 0.018) 50%, transparent 63%),
            radial-gradient(circle at 50% -18%, rgba(255, 255, 255, 0.035), transparent 34rem);
    }

    .rock-page {
        position: relative;
        min-height: calc(100vh - 10rem);
        animation: rock-page-in 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .rock-footer p {
        display: table;
        margin: 0 auto;
        padding: 0.45rem 0.8rem;
        border: 1px solid rgba(255, 255, 255, 0.055);
        border-radius: 999px;
        background: rgba(8, 8, 9, 0.4);
        backdrop-filter: blur(14px);
    }

    @keyframes rock-page-in {
        from {
            opacity: 0;
            transform: translateY(12px);
            filter: blur(3px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
        }
    }

    h1, h2, h3, h4, h5, h6 {
        ${tw`font-semibold tracking-normal font-header`};
        color: var(--shell-text);
    }

    p {
        ${tw`text-neutral-200 leading-snug font-sans`};
    }

    form {
        ${tw`m-0`};
    }

    textarea, select, input, button, button:focus, button:focus-visible {
        ${tw`outline-none`};
    }

    ::selection {
        color: white;
        background: rgba(185, 45, 55, 0.58);
    }

    ::placeholder {
        color: #66616a;
        opacity: 1;
    }

    :focus-visible {
        outline: 2px solid rgba(240, 138, 144, 0.72);
        outline-offset: 2px;
    }

    hr {
        border-color: rgba(255, 255, 255, 0.075);
    }

    [role='tooltip'] {
        color: #eadde0;
        border: 1px solid rgba(240, 138, 144, 0.18);
        background: rgba(24, 14, 18, 0.96);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.34);
        backdrop-filter: blur(14px);
    }

    :root[data-rock-theme='minimal-light'] .text-neutral-50,
    :root[data-rock-theme='minimal-light'] .text-neutral-100,
    :root[data-rock-theme='minimal-light'] .text-neutral-200,
    :root[data-rock-theme='minimal-light'] .text-neutral-300 {
        color: var(--shell-text) !important;
    }

    :root[data-rock-theme='minimal-light'] .text-neutral-400,
    :root[data-rock-theme='minimal-light'] .text-neutral-500,
    :root[data-rock-theme='minimal-light'] .text-neutral-600,
    :root[data-rock-theme='minimal-light'] .text-neutral-700 {
        color: var(--shell-muted) !important;
    }

    :root[data-rock-theme='minimal-light'] .bg-neutral-700,
    :root[data-rock-theme='minimal-light'] .bg-neutral-800,
    :root[data-rock-theme='minimal-light'] .bg-neutral-900 {
        background-color: var(--shell-panel) !important;
    }

    :root[data-rock-theme='minimal-light'] .border-neutral-500,
    :root[data-rock-theme='minimal-light'] .border-neutral-600,
    :root[data-rock-theme='minimal-light'] .border-neutral-700,
    :root[data-rock-theme='minimal-light'] .border-neutral-800,
    :root[data-rock-theme='minimal-light'] .border-neutral-900 {
        border-color: var(--shell-border) !important;
    }

    :root[data-rock-theme='minimal-light'] [role='tooltip'] {
        color: var(--shell-text);
        background: var(--shell-panel-strong);
    }

    a, button {
        -webkit-tap-highlight-color: transparent;
    }

    .spotlight-card {
        position: relative;
        overflow: hidden;
        --mouse-x: 50%;
        --mouse-y: 50%;
        --spotlight-color: rgba(201, 79, 89, 0.12);
    }

    .spotlight-card::before {
        position: absolute;
        inset: 0;
        z-index: 0;
        content: '';
        pointer-events: none;
        background: radial-gradient(440px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 62%);
        opacity: 0;
        transition: opacity 320ms ease;
    }

    .spotlight-card:hover::before,
    .spotlight-card:focus-within::before {
        opacity: 1;
    }

    .spotlight-card > * {
        position: relative;
        z-index: 1;
    }

    .activity-feed {
        overflow: hidden;
        border-radius: 11px;
    }

    .activity-feed .rb-fluid-content > div {
        border-color: rgba(255, 255, 255, 0.065);
        transition: background 160ms ease, border-color 160ms ease;
    }

    .activity-feed .rb-fluid-content > div:hover {
        border-color: rgba(240, 138, 144, 0.12);
        background: linear-gradient(90deg, rgba(201, 79, 89, 0.055), rgba(255, 255, 255, 0.015));
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance: textfield !important;
    }

    /* Scroll Bar Style */
    ::-webkit-scrollbar {
        background: none;
        width: 12px;
        height: 12px;
    }

    ::-webkit-scrollbar-thumb {
        border: solid 0 rgb(0 0 0 / 0%);
        border-right-width: 4px;
        border-left-width: 4px;
        -webkit-border-radius: 9px 4px;
        -webkit-box-shadow: inset 0 0 0 1px #4f252a, inset 0 0 0 4px #4f252a;
    }

    ::-webkit-scrollbar-track-piece {
        margin: 4px 0;
    }

    ::-webkit-scrollbar-thumb:horizontal {
        border-right-width: 0;
        border-left-width: 0;
        border-top-width: 4px;
        border-bottom-width: 4px;
        -webkit-border-radius: 4px 9px;
    }

    ::-webkit-scrollbar-corner {
        background: transparent;
    }

    @media (max-width: 640px) {
        .rock-page {
            min-height: calc(100vh - 8rem);
            padding-bottom: 4.5rem;
        }

        .rock-footer p {
            padding: 0.35rem 0.65rem;
            backdrop-filter: none;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .rock-page {
            animation: none;
        }
    }
`;
