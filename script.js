document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selections ---
    const loadingScreen = document.getElementById('loading');
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const fab = document.getElementById('fab');
    const cursor = document.getElementById('cursor');
    const cursorFollower = document.getElementById('cursor-follower');
    // We select the form and success message, but we won't use them for submission logic
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');

    // --- Loading Screen ---
    window.addEventListener('load', () => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.style.display = 'none', 500);
    });

    // --- Custom Cursor ---
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(cursorFollower, { xPercent: -50, yPercent: -50 });

    window.addEventListener('mousemove', e => {
        gsap.to(cursor, 0.1, { x: e.clientX, y: e.clientY });
        gsap.to(cursorFollower, 0.3, { x: e.clientX, y: e.clientY });
    });

    document.querySelectorAll('a, button, .stat-card, .project-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, 0.3, { scale: 0 });
            gsap.to(cursorFollower, 0.3, { scale: 2.5, background: 'rgba(0, 212, 255, 0.3)', border: 'none' });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, 0.3, { scale: 1 });
            gsap.to(cursorFollower, 0.3, { scale: 1, background: 'transparent', border: '2px solid var(--accent-primary)' });
        });
    });

    // --- Header Scroll Effect ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Navigation ---
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // --- Hero Section Animations (GSAP) ---
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero-title', { opacity: 1, y: 0, duration: 1, delay: 0.5 })
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
      .to('.typing-text', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
      .to('.hero-buttons', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');

    // --- Typing Text Animation ---
    const typingText = document.getElementById('typing-text');
    const texts = ["Building intelligent systems.", "Crafting seamless web experiences.", "Innovating with code."];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentText = texts[textIndex];
        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            setTimeout(type, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, isDeleting ? 75 : 150);
        }
    }
    setTimeout(type, 1500);

    // --- Three.js Background ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const container = document.getElementById('threejs-container');
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const isMobile = window.innerWidth <= 768;
    const count = isMobile ? 2000 : 5000;
    const particlesGeometry = new THREE.BufferGeometry;
    const positions = new Float32Array(count * 3);
    for(let i = 0; i < count * 3; i++){
        positions[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        sizeAttenuation: true,
        color: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim())
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    camera.position.z = 5;

    const clock = new THREE.Clock();
    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        particles.rotation.y = elapsedTime * 0.05;
        particles.rotation.x = elapsedTime * 0.05;
        renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = { root: null, threshold: 0.3, rootMargin: '0px' };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                // Section reveal animation
                entry.target.classList.add('visible');

                // Active nav link
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
                });

                // Trigger animations for specific sections
                if (sectionId === 'about') animateStats();
                if (sectionId === 'skills') animateSkillBars();
                
                // FAB visibility
                if (sectionId !== 'home') {
                    fab.classList.add('visible');
                } else {
                    fab.classList.remove('visible');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // Stat counter animation
    function animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            if (stat.animated) return;
            stat.animated = true;
            const target = +stat.dataset.target;
            let current = { val: 0 };
            gsap.to(current, {
                val: target,
                duration: 2,
                ease: 'power2.out',
                onUpdate: () => {
                    stat.textContent = Math.floor(current.val);
                }
            });
        });
    }

    // Skill bar animation
    function animateSkillBars() {
        const skillProgresses = document.querySelectorAll('.skill-progress');
        skillProgresses.forEach(progress => {
            const width = progress.dataset.width;
            progress.style.width = `${width}%`;
        });
    }

    // --- FAB Scroll to Top ---
    fab.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Contact Form Submission (Simple approach for FormSubmit) ---
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            successMessage.classList.add('show');
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 3000); // Hide after 3 seconds
        });
    }
});