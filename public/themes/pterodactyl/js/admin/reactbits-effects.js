/*
 * Interactions adapted from the SpotlightCard, MagicBento, and Magnet patterns
 * in React Bits by David Haz. MIT + Commons Clause; see THIRD_PARTY_NOTICES.md.
 */
(function () {
    'use strict';

    function moveModalToBody(modal) {
        if (modal && modal.parentNode !== document.body) {
            document.body.appendChild(modal);
        }
    }

    function init() {
        document.querySelectorAll('.modal').forEach(moveModalToBody);

        // AdminLTE keeps page content in an overflow-constrained wrapper. Bootstrap
        // modals must be direct body children or their controls can sit behind the
        // backdrop and become impossible to click. Handle dynamically-added modals,
        // too, immediately before Bootstrap opens them.
        if (window.jQuery) {
            window.jQuery(document)
                .off('show.bs.modal.rockTheme', '.modal')
                .on('show.bs.modal.rockTheme', '.modal', function () {
                    moveModalToBody(this);
                });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    var motionEnabled = !reducedMotion && !coarsePointer;
    var cursorAura;
    var cursorFrame = 0;
    var latestCursorEvent;
    var spotlightTargets = document.querySelectorAll(
        '.box, .admin-resource-link, .admin-status-strip, .nav-tabs-custom'
    );

    if (motionEnabled) {
        cursorAura = document.createElement('div');
        cursorAura.className = 'rb-admin-cursor-aura';
        cursorAura.setAttribute('aria-hidden', 'true');
        document.body.appendChild(cursorAura);
        window.addEventListener(
            'pointermove',
            function (event) {
                latestCursorEvent = event;
                if (cursorFrame) return;
                cursorFrame = window.requestAnimationFrame(function () {
                    cursorAura.style.setProperty('--admin-cursor-x', latestCursorEvent.clientX + 'px');
                    cursorAura.style.setProperty('--admin-cursor-y', latestCursorEvent.clientY + 'px');
                    cursorFrame = 0;
                });
            },
            { passive: true }
        );
    }

    function clamp(value, minimum, maximum) {
        return Math.min(maximum, Math.max(minimum, value));
    }

    function spawnParticles(element, event) {
        var bounds = element.getBoundingClientRect();
        var originX = event.clientX - bounds.left;
        var originY = event.clientY - bounds.top;
        var count = element.classList.contains('admin-resource-link') ? 4 : 3;

        for (var index = 0; index < count; index++) {
            var particle = document.createElement('i');
            var jitterX = (Math.random() - 0.5) * 34;
            var jitterY = (Math.random() - 0.5) * 26;

            particle.className = 'rb-magic-particle';
            particle.setAttribute('aria-hidden', 'true');
            particle.style.left = clamp(originX + jitterX, 8, Math.max(8, bounds.width - 8)) + 'px';
            particle.style.top = clamp(originY + jitterY, 8, Math.max(8, bounds.height - 8)) + 'px';
            particle.style.setProperty('--rb-particle-x', (Math.random() - 0.5) * 34 + 'px');
            particle.style.setProperty('--rb-particle-y', -18 - Math.random() * 22 + 'px');
            particle.addEventListener('animationend', function () {
                this.remove();
            });
            element.appendChild(particle);
        }
    }

    spotlightTargets.forEach(function (element) {
        element.classList.add('rb-spotlight');
        element.classList.add('rb-depth-surface');

        if (!motionEnabled) return;

        var pointerFrame = 0;
        var latestPointerEvent;

        element.addEventListener('pointermove', function (event) {
            latestPointerEvent = event;
            if (pointerFrame) return;

            pointerFrame = window.requestAnimationFrame(function () {
                var bounds = element.getBoundingClientRect();
                var localX = latestPointerEvent.clientX - bounds.left;
                var localY = latestPointerEvent.clientY - bounds.top;

                element.style.setProperty('--rb-x', localX + 'px');
                element.style.setProperty('--rb-y', localY + 'px');

                if (element.classList.contains('admin-resource-link')) {
                    var magnetX = clamp((localX - bounds.width / 2) * 0.035, -3, 3);
                    var magnetY = clamp((localY - bounds.height / 2) * 0.035, -3, 3);
                    element.style.transform = 'translate3d(' + magnetX + 'px,' + magnetY + 'px,0)';
                }

                pointerFrame = 0;
            });
        });

        element.addEventListener('pointerenter', function (event) {
            if (element.classList.contains('box') || element.classList.contains('admin-resource-link')) {
                spawnParticles(element, event);
            }
        });

        element.addEventListener('pointerleave', function () {
            if (pointerFrame) {
                window.cancelAnimationFrame(pointerFrame);
                pointerFrame = 0;
            }
            element.style.setProperty('--rb-x', '50%');
            element.style.setProperty('--rb-y', '50%');
            if (element.classList.contains('admin-resource-link')) {
                element.style.transform = 'translate3d(0,0,0)';
            }
        });
    });

    if (motionEnabled) {
        var revealTargets = document.querySelectorAll(
            '.content-header > *, .content > .row, .admin-status-strip, .box, .admin-resource-link'
        );
        revealTargets.forEach(function (element, index) {
            element.classList.add('rb-reveal');
            element.style.setProperty('--rb-delay', Math.min(index * 38, 300) + 'ms');
        });
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                revealTargets.forEach(function (element) {
                    element.classList.add('rb-visible');
                });
            });
        });

        document.querySelectorAll('.btn').forEach(function (element) {
            var magnetFrame = 0;
            var latestMagnetEvent;

            element.addEventListener('pointermove', function (event) {
                latestMagnetEvent = event;
                if (magnetFrame) return;

                magnetFrame = window.requestAnimationFrame(function () {
                    var bounds = element.getBoundingClientRect();
                    var x = clamp((latestMagnetEvent.clientX - (bounds.left + bounds.width / 2)) * 0.04, -2.5, 2.5);
                    var y = clamp((latestMagnetEvent.clientY - (bounds.top + bounds.height / 2)) * 0.04, -2.5, 2.5);
                    element.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
                    magnetFrame = 0;
                });
            });

            element.addEventListener('pointerleave', function () {
                if (magnetFrame) {
                    window.cancelAnimationFrame(magnetFrame);
                    magnetFrame = 0;
                }
                element.style.transform = 'translate3d(0,0,0)';
            });
        });
    }

    window.addEventListener('pagehide', function () {
        if (cursorFrame) window.cancelAnimationFrame(cursorFrame);
        if (cursorAura) cursorAura.remove();
        document.querySelectorAll('.rb-magic-particle').forEach(function (particle) {
            particle.remove();
        });
    });
})();
