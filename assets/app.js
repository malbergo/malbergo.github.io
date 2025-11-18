(() => {
    const sections = document.querySelectorAll('[data-animate]');
    if (!sections.length) {
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        },
        { threshold: 0.15 }
    );

    sections.forEach((section) => observer.observe(section));
})();
