/**
 * Sketch Frame Animation
 * Generates organic, hand-drawn SVG borders around elements.
 */

class SketchFrame {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            color: options.color || '#3E3C38',
            width: options.width || 2,
            duration: options.duration || 1.5,
            padding: options.padding || 10,
            wobble: options.wobble || 5,
            ...options
        };

        this.init();
    }

    init() {
        // Create SVG container
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.style.position = 'absolute';
        this.svg.style.top = `-${this.options.padding}px`;
        this.svg.style.left = `-${this.options.padding}px`;
        this.svg.style.width = `calc(100% + ${this.options.padding * 2}px)`;
        this.svg.style.height = `calc(100% + ${this.options.padding * 2}px)`;
        this.svg.style.pointerEvents = 'none';
        this.svg.style.zIndex = '-1';
        this.svg.style.overflow = 'visible';

        // Create Path
        this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.path.setAttribute("stroke", this.options.color);
        this.path.setAttribute("stroke-width", this.options.width);
        this.path.setAttribute("fill", "none");
        this.path.setAttribute("stroke-linecap", "round");
        this.path.setAttribute("stroke-linejoin", "round");

        this.svg.appendChild(this.path);
        this.element.style.position = 'relative'; // Ensure parent is relative
        this.element.appendChild(this.svg);

        // Initial draw
        this.updatePath();

        // Handle resize
        window.addEventListener('resize', () => this.updatePath());

        // Animate on intersection
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animate();
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        this.observer.observe(this.element);
    }

    updatePath() {
        const w = this.element.offsetWidth + (this.options.padding * 2);
        const h = this.element.offsetHeight + (this.options.padding * 2);

        // Generate wobbly rect path
        // Start top-left
        let d = `M ${this.r(0)} ${this.r(0)} `;

        // Top edge
        d += `Q ${w / 2} ${this.r(0)}, ${w} ${this.r(0)} `;

        // Right edge
        d += `Q ${w + this.r(0)} ${h / 2}, ${w} ${h} `;

        // Bottom edge
        d += `Q ${w / 2} ${h + this.r(0)}, ${0} ${h} `;

        // Left edge
        d += `Q ${this.r(0)} ${h / 2}, ${this.r(0)} ${this.r(0)} `;

        // Close slightly past start for "messy" look
        d += `L ${this.r(10)} ${this.r(0)}`;

        this.path.setAttribute("d", d);

        // Prepare animation
        const length = this.path.getTotalLength();
        this.path.style.strokeDasharray = length;
        this.path.style.strokeDashoffset = length;
    }

    r(val) {
        // Random wobble
        return (Math.random() - 0.5) * this.options.wobble + val;
    }

    animate() {
        this.path.style.transition = `stroke-dashoffset ${this.options.duration}s ease-in-out`;
        // Force reflow
        this.path.getBoundingClientRect();
        this.path.style.strokeDashoffset = '0';
    }
}

// Auto-init on elements with class 'sketch-frame'
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.sketch-frame').forEach(el => {
        new SketchFrame(el);
    });

    document.querySelectorAll('.sketch-frame-accent').forEach(el => {
        new SketchFrame(el, { color: '#C17C74', width: 2, wobble: 8 });
    });
});
