/**
 * Deep Zoom Atlas Engine
 * Massive World + Semantic Zoom + Archival Aesthetic
 */

class GardenEngine {
    constructor() {
        this.canvas = document.getElementById('garden-world');
        this.ctx = this.canvas.getContext('2d');

        // Camera State
        this.camera = { x: 0, y: 0, zoom: 0.4 }; // Start zoomed out
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };

        // World Content
        this.nodes = [];
        this.connections = [];

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Input Handling
        this.canvas.addEventListener('mousedown', e => this.onMouseDown(e));
        window.addEventListener('mousemove', e => this.onMouseMove(e));
        window.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', e => this.onWheel(e));

        // Generate Atlas
        this.generateAtlas();

        // Start Loop
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // --- Input Handling ---

    onMouseDown(e) {
        this.isDragging = true;
        this.lastMouse = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
    }

    onMouseMove(e) {
        if (!this.isDragging) return;

        const dx = (e.clientX - this.lastMouse.x) / this.camera.zoom;
        const dy = (e.clientY - this.lastMouse.y) / this.camera.zoom;

        this.camera.x += dx;
        this.camera.y += dy;

        this.lastMouse = { x: e.clientX, y: e.clientY };
    }

    onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    onWheel(e) {
        e.preventDefault();
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;

        // Allow deep zoom
        const newZoom = Math.min(Math.max(this.camera.zoom + delta, 0.1), 3.0);

        this.camera.zoom = newZoom;
    }

    // --- Atlas Generation ---

    generateAtlas() {
        // Massive World Coordinates (Spread out to force navigation)
        this.nodes = [
            {
                id: 'hero', x: 0, y: 0,
                title: 'Michael S Albergo',
                subtitle: 'Physics & Machine Learning',
                type: 'hero',
                content: ['Junior Fellow at Harvard Society of Fellows', 'IAIFI Fellow at MIT', 'Incoming Assistant Professor at Harvard (2026)']
            },
            {
                id: 'papers', x: 1200, y: -800,
                title: 'Publications',
                subtitle: 'Selected Works',
                type: 'section',
                content: ['Any-order flexible length masked diffusion', 'Stochastic Interpolants', 'Multi-scale generative models']
            },
            {
                id: 'research', x: -1200, y: 600,
                title: 'Research Themes',
                subtitle: 'Core Concepts',
                type: 'section',
                content: ['Generative Models for Science', 'Statistical Mechanics', 'High-dimensional Probability']
            },
            {
                id: 'contact', x: 800, y: 1000,
                title: 'Contact',
                subtitle: 'Coordinates',
                type: 'section',
                content: ['michaelsalbergo [at] gmail', 'malbergo [at] fas.harvard.edu']
            }
        ];

        // Define Connections (Threads)
        this.connections = [
            { from: 'hero', to: 'papers' },
            { from: 'hero', to: 'research' },
            { from: 'hero', to: 'contact' },
            { from: 'papers', to: 'research' }
        ];
    }

    // --- Rendering ---

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        // Apply Camera Transform (Center Origin)
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(this.camera.x, this.camera.y);

        // Draw Grid (Archival Map Lines)
        this.drawGrid();

        // Draw Connections
        this.drawConnections();

        // Draw Nodes (Semantic Zoom)
        this.nodes.forEach(node => this.drawNode(node));

        this.ctx.restore();

        // Update HUD
        this.updateHUD();

        requestAnimationFrame(() => this.animate());
    }

    drawGrid() {
        const size = 5000;
        const step = 500;

        this.ctx.strokeStyle = 'rgba(62, 60, 56, 0.05)';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        for (let x = -size; x <= size; x += step) {
            this.ctx.moveTo(x, -size);
            this.ctx.lineTo(x, size);
        }
        for (let y = -size; y <= size; y += step) {
            this.ctx.moveTo(-size, y);
            this.ctx.lineTo(size, y);
        }
        this.ctx.stroke();
    }

    drawConnections() {
        this.ctx.strokeStyle = 'rgba(26, 26, 26, 0.2)'; // Faint ink
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]); // Dashed lines like map routes

        this.connections.forEach(conn => {
            const fromNode = this.nodes.find(n => n.id === conn.from);
            const toNode = this.nodes.find(n => n.id === conn.to);

            if (fromNode && toNode) {
                this.ctx.beginPath();
                this.ctx.moveTo(fromNode.x, fromNode.y);
                this.ctx.lineTo(toNode.x, toNode.y);
                this.ctx.stroke();
            }
        });

        this.ctx.setLineDash([]);
    }

    drawNode(node) {
        const zoom = this.camera.zoom;

        // LOD 0: Far Zoom (Abstract Shapes)
        if (zoom < 0.5) {
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
            this.ctx.fill();
            return;
        }

        // LOD 1: Mid Zoom (Titles & Structure)
        this.ctx.fillStyle = '#F5F0E6';
        this.ctx.shadowColor = 'rgba(0,0,0,0.1)';
        this.ctx.shadowBlur = 20;
        this.ctx.fillRect(node.x - 150, node.y - 100, 300, 200);
        this.ctx.shadowBlur = 0;

        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(node.x - 150, node.y - 100, 300, 200);

        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.textAlign = 'center';

        // Title
        this.ctx.font = 'bold 24px "IBM Plex Mono"';
        this.ctx.fillText(node.title, node.x, node.y - 40);

        // Subtitle
        this.ctx.font = 'italic 16px "IBM Plex Mono"';
        this.ctx.fillStyle = '#C17C74';
        this.ctx.fillText(node.subtitle, node.x, node.y - 10);

        // LOD 2: Deep Zoom (Content Details)
        if (zoom > 1.0) {
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.font = '14px "IBM Plex Mono"';
            this.ctx.textAlign = 'left';

            let yOffset = 30;
            node.content.forEach(line => {
                this.ctx.fillText('• ' + line, node.x - 130, node.y + yOffset);
                yOffset += 25;
            });
        } else {
            // Hint to zoom
            this.ctx.fillStyle = 'rgba(26, 26, 26, 0.4)';
            this.ctx.font = '12px "IBM Plex Mono"';
            this.ctx.fillText('[ Zoom to Reveal Data ]', node.x, node.y + 50);
        }
    }

    updateHUD() {
        const zoomLevel = Math.round(this.camera.zoom * 100) + '%';
        document.getElementById('zoom-level').innerText = `ZOOM: ${zoomLevel}`;

        // Find nearest node
        let nearest = null;
        let minDist = Infinity;

        this.nodes.forEach(node => {
            // Calculate screen distance
            const dx = (node.x + this.camera.x) * this.camera.zoom;
            const dy = (node.y + this.camera.y) * this.camera.zoom;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 300 * this.camera.zoom) {
                if (dist < minDist) {
                    minDist = dist;
                    nearest = node;
                }
            }
        });

        const label = document.getElementById('active-specimen');
        if (nearest) {
            label.innerText = nearest.title;
            label.style.opacity = 1;
        } else {
            label.innerText = "Void";
            label.style.opacity = 0.5;
        }
    }
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    new GardenEngine();
});
