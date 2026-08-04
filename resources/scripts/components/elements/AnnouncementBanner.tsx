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

const BannerContainer = styled.div<{ $severity: string }>`
    width: 100%;
    padding: 0.65rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    font-size: 0.85rem;
    position: relative;
    z-index: 40;
    transition: all 0.2s ease-in-out;

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
        background: linear-gradient(90deg, rgba(59, 130, 246, 0.18), rgba(30, 64, 175, 0.25));
        border-bottom: 1px solid rgba(59, 130, 246, 0.3);
        color: #93c5fd;
    `}

    .banner-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }

    .banner-text {
        font-weight: 500;
        line-height: 1.4;
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

        &:hover {
            opacity: 1;
        }
    }
`;

export const AnnouncementBanner: React.FC = () => {
    const branding = useStoreState((state: ApplicationStore) => state.settings.data?.branding);
    const [dismissed, setDismissed] = useState<boolean>(() => {
        return sessionStorage.getItem('rock:announcement-dismissed') === 'true';
    });

    if (!branding || !branding.announcementEnabled || !branding.announcementMessage || dismissed) {
        return null;
    }

    const severity = branding.announcementType || 'notice';
    const icon = severity === 'critical' ? faExclamationTriangle : severity === 'warning' ? faBullhorn : faInfoCircle;

    const handleDismiss = () => {
        sessionStorage.setItem('rock:announcement-dismissed', 'true');
        setDismissed(true);
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
                            target={'_blank'}
                            rel={'noreferrer'}
                            className={'banner-link'}
                        >
                            Learn details <FontAwesomeIcon icon={faExternalLinkAlt} className={'text-xs'} />
                        </a>
                    )}
                </span>
            </div>
            <button onClick={handleDismiss} className={'dismiss-btn'} title={'Dismiss Announcement'}>
                <FontAwesomeIcon icon={faTimes} />
            </button>
        </BannerContainer>
    );
};

export default AnnouncementBanner;
