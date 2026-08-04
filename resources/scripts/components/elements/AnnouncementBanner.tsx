import React, { useState } from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBullhorn,
    faExclamationTriangle,
    faInfoCircle,
    faTimes,
    faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';

type AnnouncementType = 'notice' | 'warning' | 'critical';

const DISMISSED_ANNOUNCEMENT_KEY = 'rock:dismissed-announcement';

const BannerContainer = styled.div<{ $severity: AnnouncementType }>`
    width: 100%;
    padding: 0.65rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.85rem;
    position: relative;
    z-index: 40;
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.025);

    ${(props) =>
        props.$severity === 'critical'
            ? `
        background: linear-gradient(90deg, rgba(201, 79, 89, 0.25), rgba(160, 30, 45, 0.35));
        border-bottom: 1px solid rgba(201, 79, 89, 0.4);
        color: #fca5a5;
    `
            : props.$severity === 'warning'
            ? `
        background: linear-gradient(90deg, rgba(245, 158, 11, 0.18), rgba(180, 100, 10, 0.25));
        border-bottom: 1px solid rgba(245, 158, 11, 0.35);
        color: #fde047;
    `
            : `
        background: linear-gradient(90deg, rgba(var(--shell-accent-rgb), 0.2), rgba(var(--shell-accent-rgb), 0.1));
        border-bottom: 1px solid rgba(var(--shell-accent-rgb), 0.32);
        color: var(--shell-text);
    `}

    .banner-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }

    .banner-text {
        min-width: 0;
        font-weight: 500;
        line-height: 1.4;
        overflow-wrap: anywhere;
    }

    .banner-link {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        margin-left: 0.5rem;
        font-weight: 600;
        text-decoration: underline;

        &:hover {
            opacity: 0.85;
        }
    }

    .dismiss-btn {
        background: transparent;
        border: none;
        color: currentColor;
        cursor: pointer;
        opacity: 0.7;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.8rem;
        height: 1.8rem;
        flex: 0 0 auto;

        &:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.06);
            border-radius: 6px;
        }
    }

    @media (max-width: 560px) {
        align-items: flex-start;
        padding: 0.7rem 0.85rem;
        font-size: 0.78rem;

        .banner-content {
            align-items: flex-start;
            gap: 0.55rem;
        }

        .banner-link {
            display: flex;
            width: max-content;
            margin: 0.35rem 0 0;
        }
    }
`;

export const AnnouncementBanner: React.FC = () => {
    const branding = useStoreState((state: ApplicationStore) => state.settings.data?.branding);
    const fingerprint = branding
        ? [branding.announcementType, branding.announcementMessage, branding.announcementLink].join('|')
        : '';
    const [dismissedAnnouncement, setDismissedAnnouncement] = useState(
        () => sessionStorage.getItem(DISMISSED_ANNOUNCEMENT_KEY) || ''
    );

    if (
        !branding ||
        !branding.announcementEnabled ||
        !branding.announcementMessage ||
        dismissedAnnouncement === fingerprint
    ) {
        return null;
    }

    const severity: AnnouncementType = branding.announcementType || 'notice';
    const icon = severity === 'critical' ? faExclamationTriangle : severity === 'warning' ? faBullhorn : faInfoCircle;
    const externalLink = /^https?:\/\//i.test(branding.announcementLink);

    const handleDismiss = () => {
        sessionStorage.setItem(DISMISSED_ANNOUNCEMENT_KEY, fingerprint);
        setDismissedAnnouncement(fingerprint);
    };

    return (
        <BannerContainer $severity={severity}>
            <div className={'banner-content'}>
                <FontAwesomeIcon icon={icon} className={'text-base flex-shrink-0'} />
                <span className={'banner-text'}>
                    {branding.announcementMessage}
                    {branding.announcementLink && (
                        <a
                            href={branding.announcementLink}
                            target={externalLink ? '_blank' : undefined}
                            rel={externalLink ? 'noreferrer' : undefined}
                            className={'banner-link'}
                        >
                            Learn details <FontAwesomeIcon icon={faExternalLinkAlt} className={'text-xs'} />
                        </a>
                    )}
                </span>
            </div>
            <button
                type={'button'}
                onClick={handleDismiss}
                className={'dismiss-btn'}
                aria-label={'Dismiss announcement'}
            >
                <FontAwesomeIcon icon={faTimes} />
            </button>
        </BannerContainer>
    );
};

export default AnnouncementBanner;
