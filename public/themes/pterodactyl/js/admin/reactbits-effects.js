/*
 * Interactions adapted from the SpotlightCard, MagicBento, Magnet, and ClickSpark patterns
 * in React Bits by David Haz. MIT + Commons Clause; see THIRD_PARTY_NOTICES.md.
 */
(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    var motionEnabled = !reducedMotion && !coarsePointer;
    var spotlightTargets = document.querySelectorAll(
        '.box, .admin-resource-link, .admin-status-strip, .nav-tabs-custom'
    );

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

    var canvas;
    var context;
    var sparks = [];
    var frame = 0;

    function resizeCanvas() {
        if (!canvas || !context) return;
        var ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * ratio;
        canvas.height = window.innerHeight * ratio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function draw(now) {
        frame = 0;
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        sparks = sparks.filter(function (spark) {
            var progress = (now - spark.start) / 420;
            if (progress >= 1) return false;
            var eased = progress * (2 - progress);
            var distance = eased * 22;
            var length = 7 * (1 - eased);
            var x = spark.x + distance * Math.cos(spark.angle);
            var y = spark.y + distance * Math.sin(spark.angle);
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + length * Math.cos(spark.angle), y + length * Math.sin(spark.angle));
            context.strokeStyle = 'rgba(240, 138, 144,' + (1 - progress) + ')';
            context.lineWidth = 1.5;
            context.stroke();
            return true;
        });
        if (sparks.length) frame = window.requestAnimationFrame(draw);
    }

    if (motionEnabled) {
        canvas = document.createElement('canvas');
        canvas.className = 'rb-click-spark';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);
        context = canvas.getContext('2d');
    }

    if (context) {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        document.addEventListener('click', function (event) {
            if (!event.target || !event.target.closest('a, button, .btn, input, select')) return;
            for (var index = 0; index < 8; index++) {
                sparks.push({
                    x: event.clientX,
                    y: event.clientY,
                    angle: (Math.PI * 2 * index) / 8,
                    start: performance.now(),
                });
            }
            if (!frame) frame = window.requestAnimationFrame(draw);
        });
    }

    window.addEventListener('pagehide', function () {
        if (frame) window.cancelAnimationFrame(frame);
        document.querySelectorAll('.rb-magic-particle').forEach(function (particle) {
            particle.remove();
        });
    });
})();
