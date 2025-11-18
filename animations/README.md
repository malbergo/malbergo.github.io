# Research Theme Animations

This directory contains interactive visualizations for the research themes on malbergo.me.

## Animations

### 1. Annealed Langevin Dynamics (`annealed_langevin.html`)
**Demonstrates**: Sampling from a Gaussian mixture model using temperature annealing

**Key Features**:
- Particles explore energy landscape via Langevin dynamics
- Temperature decreases from 2.0 → 0.05 (annealing schedule)
- Visual feedback: particle color changes (red = hot, blue = cold)
- Shows three phases: exploration (high T) → annealing → convergence (low T)

**Algorithm**:
```
x_{t+dt} = x_t - ∇U(x_t) * dt + √(2T*dt) * noise
```

Where U(x) is the energy function of the GMM.

### 2. Measure Transport (`measure_transport.html`)
**Demonstrates**: Two approaches to transporting probability distributions

**Left side - Probability Flow ODE**:
- Continuous particle paths
- Deterministic flow field v(x,t)
- Smooth interpolation between source and target

**Right side - Continuous-Time Markov Chain (CTMC)**:
- Discrete state jumps
- Stochastic transitions between states
- Jump rates increase with time t

**Key Insight**: Both methods transport the same measure, but via different dynamics (continuous vs. discrete).

## Technology Stack

**Browser-based animations**:
- p5.js (Creative coding library)
- Pure JavaScript (no build step required)
- Embedded via iframes in research-themes.html

**Manim source files** (for high-quality rendering):
- `annealed_langevin.py` - Manim Community Edition script
- `measure_transport.py` - Manim Community Edition script

## Usage

### Viewing Animations Locally

Simply open the HTML files in a web browser:
```bash
open annealed_langevin.html
open measure_transport.html
```

Or start a local server:
```bash
python3 -m http.server 8000
# Visit: http://localhost:8000/animations/annealed_langevin.html
```

### Rendering High-Quality Videos with Manim

**Install Manim**:
```bash
pip install manim
```

**Render animations**:
```bash
# Low quality (fast preview)
manim -pql annealed_langevin.py AnnealedLangevinDynamics
manim -pql measure_transport.py MeasureTransport

# High quality (for publication)
manim -pqh annealed_langevin.py AnnealedLangevinDynamics
manim -pqh measure_transport.py MeasureTransport
```

Output videos will be in `media/videos/`.

## Customization

### Animation Parameters

**Annealed Langevin**:
- `n_particles`: Number of sampling particles (default: 50)
- `max_frames`: Animation length (default: 600 frames)
- `temperature_schedule`: Annealing curve (default: 2.0 → 0.05 linear)

**Measure Transport**:
- `flowParticles`: Number of continuous flow particles (default: 60)
- `ctmcParticles`: Particles per discrete state (default: 10 per state)
- `max_frames`: Animation length (default: 400 frames)

### Styling

Both animations use colors consistent with the brutalist website theme:
- Primary accent: `#da532c` (Utrecht red)
- Flow ODE: Blue (#4169E1)
- CTMC: Orange (#FF8C00)

## Performance

- **Desktop**: Smooth 60fps performance
- **Mobile**: Optimized with GPU acceleration (`will-change` hints in CSS)
- **Battery impact**: Minimal (animations pause when tab not visible)

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Future Enhancements

Potential additions:
- [ ] Pause/play controls
- [ ] Speed adjustment slider
- [ ] Parameter tweaking UI
- [ ] Export animation as GIF
- [ ] Additional research themes (flow matching, stochastic interpolants)

## References

**Annealed Langevin Dynamics**:
- Simulated annealing for sampling
- MCMC with temperature scheduling
- Applications in lattice field theory

**Measure Transport**:
- Stochastic interpolants framework
- Flow matching algorithms
- Discrete state space transport

## License

These animations are part of Michael S. Albergo's academic website and are provided for educational purposes.
