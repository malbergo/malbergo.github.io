"""
Annealed Langevin Dynamics Sampling Animation
Demonstrates particles exploring a GMM energy landscape with annealing
"""

from manim import *
import numpy as np

class AnnealedLangevinDynamics(Scene):
    def construct(self):
        # Configuration
        n_particles = 30
        n_gaussians = 3
        temperature_schedule = np.linspace(2.0, 0.1, 180)  # Annealing schedule

        # Title
        title = Text("Annealed Langevin Dynamics", font_size=36).to_edge(UP)
        subtitle = Text("Particles sampling from a Gaussian Mixture", font_size=24, color=GRAY).next_to(title, DOWN)

        # Temperature indicator
        temp_text = always_redraw(lambda: Text(
            f"Temperature: {self.temp:.2f}",
            font_size=24,
            color=RED
        ).to_corner(UL).shift(DOWN * 0.5))

        self.temp = temperature_schedule[0]

        # GMM parameters (means will move to show annealing)
        initial_means = [
            np.array([-2.5, 1.5, 0]),
            np.array([2.0, -1.0, 0]),
            np.array([0.5, 2.0, 0])
        ]

        final_means = [
            np.array([-2.0, 0.5, 0]),
            np.array([1.5, -0.8, 0]),
            np.array([0.3, 1.5, 0])
        ]

        # Create Gaussian blobs (visual representation)
        gaussians = VGroup()
        for i, (init_mean, final_mean) in enumerate(zip(initial_means, final_means)):
            colors = [BLUE, GREEN, PURPLE]
            gaussian = Circle(
                radius=1.2,
                color=colors[i],
                fill_opacity=0.2,
                stroke_width=2
            ).move_to(init_mean)
            gaussians.add(gaussian)

        # Create particles
        particles = VGroup()
        particle_positions = []
        particle_velocities = []

        for _ in range(n_particles):
            # Initialize particles randomly
            pos = np.array([
                np.random.uniform(-3, 3),
                np.random.uniform(-2, 2),
                0
            ])
            particle = Dot(point=pos, radius=0.08, color=RED)
            particles.add(particle)
            particle_positions.append(pos.copy())
            particle_velocities.append(np.random.randn(3) * 0.1)

        # Add elements
        self.add(title, subtitle, temp_text, gaussians, particles)
        self.wait(1)

        # Energy function (negative log probability)
        def energy(pos, means, temp):
            # GMM energy landscape
            energies = []
            for mean in means:
                dist_sq = np.sum((pos - mean[:2])**2)
                energies.append(np.exp(-dist_sq / (2 * 0.5**2)))
            return -temp * np.log(sum(energies) + 1e-10)

        def energy_gradient(pos, means, temp):
            # Gradient of energy
            grad = np.zeros(2)
            total_prob = 0

            for mean in means:
                diff = pos - mean[:2]
                dist_sq = np.sum(diff**2)
                weight = np.exp(-dist_sq / (2 * 0.5**2))
                total_prob += weight
                grad -= weight * diff / 0.5**2

            if total_prob > 1e-10:
                grad = -temp * grad / total_prob

            return grad

        # Animation loop
        dt = 0.05
        damping = 0.9

        for frame in range(len(temperature_schedule)):
            self.temp = temperature_schedule[frame]

            # Current GMM means (interpolate)
            alpha = frame / len(temperature_schedule)
            current_means = [
                (1 - alpha) * init + alpha * final
                for init, final in zip(initial_means, final_means)
            ]

            # Update Gaussian positions
            new_gaussians = VGroup()
            for i, mean in enumerate(current_means):
                colors = [BLUE, GREEN, PURPLE]
                # Size decreases as temperature decreases
                radius = 1.2 * (1 + self.temp / 2)
                gaussian = Circle(
                    radius=radius,
                    color=colors[i],
                    fill_opacity=0.15 / (1 + self.temp),
                    stroke_width=2,
                    stroke_opacity=0.5
                ).move_to(mean)
                new_gaussians.add(gaussian)

            # Update particles via Langevin dynamics
            new_particles = VGroup()
            for i, (pos, vel) in enumerate(zip(particle_positions, particle_velocities)):
                # Langevin update: dX = -∇U dt + √(2T) dW
                grad = energy_gradient(pos[:2], current_means, self.temp)
                noise = np.random.randn(2) * np.sqrt(2 * self.temp * dt)

                # Update position
                pos[:2] -= grad * dt + noise

                # Boundary conditions (reflect at edges)
                if abs(pos[0]) > 3.5:
                    pos[0] = np.sign(pos[0]) * 3.5
                if abs(pos[1]) > 2.5:
                    pos[1] = np.sign(pos[1]) * 2.5

                # Create new dot
                # Color based on temperature (red = hot, blue = cold)
                color_val = interpolate_color(RED, BLUE, 1 - self.temp / 2)
                particle = Dot(point=pos, radius=0.08, color=color_val)
                new_particles.add(particle)

            # Smooth transition
            self.play(
                Transform(gaussians, new_gaussians),
                Transform(particles, new_particles),
                run_time=0.03,
                rate_func=linear
            )

        # Final hold
        final_text = Text("Converged!", font_size=32, color=GREEN).to_edge(DOWN)
        self.play(Write(final_text))
        self.wait(2)


if __name__ == "__main__":
    # Render with: manim -pql annealed_langevin.py AnnealedLangevinDynamics
    # Or high quality: manim -pqh annealed_langevin.py AnnealedLangevinDynamics
    pass
