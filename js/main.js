/* ===== AniGen Project Page — main.js ===== */

(function () {
    'use strict';

    // ===== DATA =====
    const comparisonScenes = {
        flower: ['GT', 'AniGen', 'Anymate', 'Puppeteer', 'RigAnything', 'UniRig'],
        fox: ['GT', 'AniGen', 'Anymate', 'Puppeteer', 'RigAnything'],
        leave: ['GT', 'AniGen', 'Anymate', 'RigAnything', 'UniRig'],
        mouse: ['GT', 'AniGen', 'Anymate', 'Puppeteer', 'RigAnything', 'UniRig']
    };

    // State
    let currentScene = 'flower';

    // ===== SCROLL ANIMATIONS =====
    function initScrollAnimations() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.dataset.delay || 0;
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, delay);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        document.querySelectorAll('[data-animate]').forEach((el) => {
            observer.observe(el);
        });
    }

    // ===== NAVBAR =====
    function initNavbar() {
        const navbar = document.getElementById('navbar');
        const hero = document.getElementById('hero');

        const observer = new IntersectionObserver(
            ([entry]) => {
                navbar.classList.toggle('visible', !entry.isIntersecting);
            },
            { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
        );

        observer.observe(hero);

        // Smooth scroll for nav links
        document.querySelectorAll('.nav-links a, .scroll-link').forEach((link) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }

    // ===== TEASER VIDEO + MUSIC TOGGLE =====
    function initTeaserVideo() {
        const video = document.getElementById('teaser-video');
        const btn = document.getElementById('music-toggle');
        if (!video) return;

        video.muted = false;
        if (btn) btn.classList.add('muted');
        let endFrameTime = 0;

        function updateMuteButton() {
            if (btn) btn.classList.toggle('muted', video.muted || video.paused);
        }

        function setToEndFrame() {
            if (!Number.isFinite(video.duration) || video.duration <= 0) return;
            endFrameTime = Math.max(video.duration - 0.05, 0);
            if (Math.abs(video.currentTime - endFrameTime) > 0.01) {
                video.currentTime = endFrameTime;
            }
        }

        function playFromStart() {
            video.currentTime = 0;
            video.muted = false;
            updateMuteButton();
            const p = video.play();
            if (p && typeof p.then === 'function') {
                p.catch(() => {
                    updateMuteButton();
                });
            }
        }

        video.addEventListener('loadedmetadata', () => {
            setToEndFrame();
        });

        video.addEventListener('click', () => {
            const isAtEndFrame = Math.abs(video.currentTime - endFrameTime) < 0.1;
            if (video.paused && isAtEndFrame) {
                playFromStart();
            } else if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', () => {
            updateMuteButton();
        });

        video.addEventListener('pause', () => {
            updateMuteButton();
        });

        video.addEventListener('ended', () => {
            setToEndFrame();
            video.pause();
            updateMuteButton();
        });

        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (video.paused) {
                    playFromStart();
                    return;
                }
                video.muted = !video.muted;
                updateMuteButton();
            });
        }
    }

    // ===== DEMO VIDEO =====
    function initDemoVideo() {
        const video = document.getElementById('demo-video');
        const overlay = document.getElementById('demo-play-overlay');
        if (!video || !overlay) return;

        overlay.addEventListener('click', () => {
            video.play();
            overlay.classList.add('hidden');
        });

        video.addEventListener('pause', () => {
            if (!video.ended) {
                overlay.classList.remove('hidden');
            }
        });

        video.addEventListener('play', () => {
            overlay.classList.add('hidden');
        });
    }

    // ===== COMPARISONS =====
    function initComparisons() {
        document.querySelectorAll('.scene-tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                const scene = tab.dataset.scene;
                if (scene === currentScene) return;

                document.querySelector('.scene-tab.active').classList.remove('active');
                tab.classList.add('active');
                currentScene = scene;
                buildComparisonGrid();
            });
        });

        buildComparisonGrid();
    }

    function buildComparisonGrid() {
        const grid = document.getElementById('comparison-grid');
        if (!grid) return;

        const methods = comparisonScenes[currentScene];

        // Row 1: regular videos, Row 2: skeleton videos
        var html = '';
        methods.forEach(function (method) {
            var src = 'assets/videos/comparison/' + currentScene + '/' + method + '.mp4';
            var isOurs = method === 'AniGen';
            var displayName = isOurs ? 'AniGen (Ours)' : method;
            var labelClass = isOurs ? 'method-label ours' : 'method-label';

            html += '<div class="comparison-cell">' +
                '<video autoplay loop muted playsinline preload="auto" data-method="' + method + '" data-row="1">' +
                '<source src="' + src + '" type="video/mp4">' +
                '</video>' +
                '<span class="' + labelClass + '">' + displayName + '</span>' +
                '</div>';
        });
        methods.forEach(function (method) {
            var src = 'assets/videos/comparison/' + currentScene + '/' + method + '_skeleton.mp4';
            var isOurs = method === 'AniGen';
            var displayName = isOurs ? 'AniGen (Ours)' : method;
            var labelClass = isOurs ? 'method-label ours' : 'method-label';

            html += '<div class="comparison-cell">' +
                '<video autoplay loop muted playsinline preload="auto" data-method="' + method + '" data-row="2">' +
                '<source src="' + src + '" type="video/mp4">' +
                '</video>' +
                '<span class="' + labelClass + '">' + displayName + ' + Skeleton</span>' +
                '</div>';
        });

        grid.innerHTML = html;

        // Set grid columns to match method count
        grid.style.gridTemplateColumns = 'repeat(' + methods.length + ', 1fr)';

        syncComparisonVideos();
    }

    function syncComparisonVideos() {
        const grid = document.getElementById('comparison-grid');
        if (!grid) return;

        const videos = Array.from(grid.querySelectorAll('video'));
        if (videos.length < 2) return;

        const leader = videos[0];

        leader.removeEventListener('timeupdate', leader._syncHandler);

        leader._syncHandler = () => {
            for (let i = 1; i < videos.length; i++) {
                if (Math.abs(videos[i].currentTime - leader.currentTime) > 0.15) {
                    videos[i].currentTime = leader.currentTime;
                }
            }
        };

        leader.addEventListener('timeupdate', leader._syncHandler);
    }

    // ===== BIBTEX COPY =====
    function initBibtexCopy() {
        const btn = document.getElementById('copy-bibtex');
        const code = document.getElementById('bibtex-content');
        if (!btn || !code) return;

        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(code.textContent).then(() => {
                btn.classList.add('copied');
                btn.innerHTML = '<i class="fas fa-check"></i>';

                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            });
        });
    }

    // ===== LIGHTBOX =====
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.getElementById('lightbox-close');

        document.querySelectorAll('.clickable-img').forEach((img) => {
            img.addEventListener('click', () => {
                lightboxImg.src = img.dataset.full || img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        closeBtn.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // ===== LAZY VIDEO LOADING =====
    var rowObserver;
    var rowPlaybackObserver;

    function loadRowVideos(row) {
        var videos = row.querySelectorAll('video[data-src]');
        videos.forEach(function (v) {
            var src = v.dataset.src;
            if (!src) return;
            var source = document.createElement('source');
            source.src = src;
            source.type = 'video/mp4';
            v.appendChild(source);
            v.preload = 'auto';
            v.load();
            v.play().catch(function () {});
            delete v.dataset.src;
        });
    }

    function observeRows(rows) {
        rows.forEach(function (row) {
            rowObserver.observe(row);
            rowPlaybackObserver.observe(row);
        });
    }

    function initLazyVideos() {
        rowObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    loadRowVideos(entry.target);
                    rowObserver.unobserve(entry.target);
                });
            },
            { rootMargin: '300px 0px' }
        );

        rowPlaybackObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    var videos = entry.target.querySelectorAll('video');
                    videos.forEach(function (v) {
                        if (entry.isIntersecting) {
                            v.play().catch(function () {});
                        } else {
                            v.pause();
                        }
                    });
                });
            },
            { rootMargin: '150px 0px', threshold: 0.1 }
        );

        // Only observe rows in the active group initially
        var activeGroup = document.querySelector('.results-group.active');
        if (activeGroup) {
            observeRows(activeGroup.querySelectorAll('.results-row'));
        }

        // Comparisons: load once the whole section is near the viewport.
        var sectionObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var videos = entry.target.querySelectorAll('video[preload="none"]');
                    videos.forEach(function (v) {
                        v.preload = 'auto';
                        v.play().catch(function () {});
                    });
                    sectionObserver.unobserve(entry.target);
                });
            },
            { rootMargin: '200px' }
        );

        document.querySelectorAll('#comparisons').forEach(function (s) { sectionObserver.observe(s); });
    }

    // ===== RESULTS GROUP NAV =====
    function initResultsGroupNav() {
        var tabs = document.querySelectorAll('.results-group-tab');
        if (!tabs.length) return;

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var groupId = tab.dataset.group;
                var currentTab = document.querySelector('.results-group-tab.active');
                if (currentTab === tab) return;

                // Switch active tab
                currentTab.classList.remove('active');
                tab.classList.add('active');

                // Pause videos in current group
                var currentGroup = document.querySelector('.results-group.active');
                currentGroup.querySelectorAll('video').forEach(function (v) { v.pause(); });
                // Unobserve old rows
                currentGroup.querySelectorAll('.results-row').forEach(function (row) {
                    rowObserver.unobserve(row);
                    rowPlaybackObserver.unobserve(row);
                });
                currentGroup.classList.remove('active');

                // Show new group
                var newGroup = document.querySelector('.results-group[data-group="' + groupId + '"]');
                newGroup.classList.add('active');

                // Observe rows in the new group (triggers lazy load for visible ones)
                observeRows(newGroup.querySelectorAll('.results-row'));

                // Trigger scroll animations for rows that haven't been animated yet
                newGroup.querySelectorAll('[data-animate]:not(.visible)').forEach(function (el) {
                    el.classList.add('visible');
                });
            });
        });
    }

    // ===== INIT =====
    document.addEventListener('DOMContentLoaded', function () {
        initScrollAnimations();
        initNavbar();
        initTeaserVideo();
        initDemoVideo();
        initComparisons();
        initBibtexCopy();
        initLightbox();
        initLazyVideos();
        initResultsGroupNav();
    });
})();
