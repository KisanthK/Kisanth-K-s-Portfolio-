(function () {
    'use strict';

    // ── Page reveal ───────────────────────────────────────────────
    document.body.classList.add('loaded');

    // ── Lenis smooth scroll ───────────────────────────────────────
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // ── Register ScrollTrigger ────────────────────────────────────
    gsap.registerPlugin(ScrollTrigger);

    // ── Custom Cursor (desktop only) ──────────────────────────────
    const cursorOuter = document.querySelector('.cursor-outer');
    const cursorInner = document.querySelector('.cursor-inner');

    if (window.innerWidth > 768 && cursorOuter && cursorInner) {
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let ox = mx, oy = my;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX;
            my = e.clientY;
            gsap.to(cursorInner, { x: mx, y: my, duration: 0.07, ease: 'none', overwrite: 'auto' });
        });

        gsap.ticker.add(() => {
            ox += (mx - ox) * 0.1;
            oy += (my - oy) * 0.1;
            gsap.set(cursorOuter, { x: ox, y: oy });
        });

        document.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('mouseenter', () => cursorOuter.classList.add('hovered'));
            el.addEventListener('mouseleave', () => cursorOuter.classList.remove('hovered'));
        });

        document.addEventListener('mouseleave', () => {
            gsap.to([cursorOuter, cursorInner], { opacity: 0, duration: 0.3 });
        });
        document.addEventListener('mouseenter', () => {
            gsap.to([cursorOuter, cursorInner], { opacity: 1, duration: 0.3 });
        });
    }

    // ── Nav: hide on scroll down, reveal on scroll up ─────────────
    const nav = document.getElementById('nav');
    let lastY = 0;
    let navHidden = false;

    ScrollTrigger.create({
        start: 'top top',
        onUpdate: () => {
            const currentY = window.scrollY;
            const goingDown = currentY > lastY;

            if (goingDown && currentY > 120 && !navHidden) {
                gsap.to(nav, { y: '-110%', duration: 0.5, ease: 'power3.in' });
                navHidden = true;
            } else if (!goingDown && navHidden) {
                gsap.to(nav, { y: '0%', duration: 0.48, ease: 'power3.out' });
                navHidden = false;
            }
            lastY = currentY;
        },
    });

    // ── Hero entrance animation ───────────────────────────────────
    const heroTL = gsap.timeline({ delay: 0.15 });

    heroTL
        .from('.badge', { opacity: 0, y: 18, duration: 0.6, ease: 'power3.out' })
        .from('.h1-inner', {
            y: '108%',
            opacity: 0,
            duration: 0.9,
            stagger: 0.13,
            ease: 'power4.out',
        }, '-=0.3')
        .from('.hero-desc', { opacity: 0, y: 22, duration: 0.7, ease: 'power3.out' }, '-=0.55')
        .from('.hero-btns a', { opacity: 0, y: 14, duration: 0.55, stagger: 0.1, ease: 'power3.out' }, '-=0.4')
        .from('#heroCardWrapper', { opacity: 0, scale: 0.93, y: 28, duration: 1.0, ease: 'power3.out' }, '-=0.9');

    // ── Hero image parallax on mouse move ─────────────────────────
    const heroCard = document.getElementById('heroCardWrapper');
    if (heroCard && window.innerWidth > 900) {
        document.addEventListener('mousemove', (e) => {
            const xPct = (e.clientX / window.innerWidth  - 0.5);
            const yPct = (e.clientY / window.innerHeight - 0.5);
            gsap.to(heroCard, {
                x: xPct * 26,
                y: yPct * 16,
                rotateY: xPct * 7,
                rotateX: -yPct * 5,
                duration: 1.6,
                ease: 'power2.out',
                transformPerspective: 800,
            });
        });
    }

    // ── About heading: word-by-word reveal on scroll ──────────────
    function wrapWords(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const parts = node.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach(part => {
                if (/^\s*$/.test(part)) {
                    frag.appendChild(document.createTextNode(part));
                } else {
                    const outer = document.createElement('span');
                    outer.className = 'split-word';
                    const inner = document.createElement('span');
                    inner.className = 'split-word-inner';
                    inner.textContent = part;
                    outer.appendChild(inner);
                    frag.appendChild(outer);
                }
            });
            return frag;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const clone = node.cloneNode(false);
            node.childNodes.forEach(child => clone.appendChild(wrapWords(child)));
            return clone;
        }
        return node.cloneNode(true);
    }

    const aboutHeading = document.querySelector('.about-heading');
    if (aboutHeading) {
        const tmp = document.createElement('div');
        tmp.innerHTML = aboutHeading.innerHTML;
        const frag = document.createDocumentFragment();
        tmp.childNodes.forEach(c => frag.appendChild(wrapWords(c)));
        aboutHeading.innerHTML = '';
        aboutHeading.appendChild(frag);

        gsap.from('.about-heading .split-word-inner', {
            scrollTrigger: { trigger: aboutHeading, start: 'top 83%' },
            y: '108%',
            opacity: 0,
            duration: 0.75,
            stagger: 0.045,
            ease: 'power4.out',
        });
    }

    gsap.from('.about-text > p', {
        scrollTrigger: { trigger: '.about-text', start: 'top 82%' },
        opacity: 0, y: 28, duration: 0.8, ease: 'power3.out',
    });

    gsap.from('.skill-item', {
        scrollTrigger: { trigger: '.skills-grid', start: 'top 85%' },
        opacity: 0, y: 36, duration: 0.7, stagger: 0.14, ease: 'power3.out',
    });

    gsap.from('.opportunity-card', {
        scrollTrigger: { trigger: '.opportunity-card', start: 'top 88%' },
        opacity: 0, y: 28, duration: 0.8, ease: 'power3.out',
    });

    // ── Work section header ───────────────────────────────────────
    gsap.from('.section-header', {
        scrollTrigger: { trigger: '.section-header', start: 'top 88%' },
        opacity: 0, y: 24, duration: 0.8, ease: 'power3.out',
    });

    // ── Bento grid: staggered card reveal ────────────────────────
    gsap.from('.bento-item', {
        scrollTrigger: {
            trigger: '.bento-grid',
            start: 'top 80%',
        },
        opacity: 0,
        y: 55,
        scale: 0.96,
        duration: 0.85,
        stagger: { each: 0.1, from: 'start' },
        ease: 'power3.out',
    });

    // ── Footer reveal ─────────────────────────────────────────────
    gsap.from('.contact-footer h3', {
        scrollTrigger: { trigger: '.contact-footer', start: 'top 88%' },
        opacity: 0, y: 36, duration: 0.9, ease: 'power3.out',
    });
    gsap.from('.footer-btn', {
        scrollTrigger: { trigger: '.contact-footer', start: 'top 82%' },
        opacity: 0, y: 18, duration: 0.7, delay: 0.2, ease: 'power3.out',
    });

    // ── Mobile menu toggle ────────────────────────────────────────
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks   = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-xmark');
            });
        });
    }

})();
document.addEventListener('DOMContentLoaded', () => {
    const glow = document.querySelector('.cursor-glow');
    const heroImage = document.querySelector('.image-card');

    document.addEventListener('mousemove', (e) => {
        // ✅ Guard against null before calling .animate()
        if (glow) {
            glow.animate({
                left: `${e.clientX}px`,
                top: `${e.clientY}px`
            }, { duration: 500, fill: "forwards" });
        }

        if (heroImage) {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 45;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 45;
            heroImage.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.bento-item, .skill-item, .about-text h2').forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(40px)";
        el.style.transition = "all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)";
        observer.observe(el);
    });
});

const style = document.createElement('style');
style.textContent = `.is-visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);