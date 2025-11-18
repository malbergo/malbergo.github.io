"""
Dynamical Measure Transport Animation
Side-by-side comparison of Probability Flow ODE vs CTMC transport
"""

from manim import *
import numpy as np

class MeasureTransport(Scene):
    def construct(self):
        # Title
        title = Text("Dynamical Measure Transport", font_size=36).to_edge(UP)
        subtitle = Text("Flow ODE vs. Continuous-Time Markov Chain", font_size=24, color=GRAY).next_to(title, DOWN)

        self.add(title, subtitle)
        self.wait(0.5)

        # Create two side-by-side panels
        divider = Line(UP * 3, DOWN * 3, color=WHITE, stroke_width=2)

        left_label = Text("Probability Flow ODE", font_size=20, color=BLUE).move_to(LEFT * 3 + UP * 2.5)
        right_label = Text("CTMC (Jump Process)", font_size=20, color=ORANGE).move_to(RIGHT * 3 + UP * 2.5)

        self.add(divider, left_label, right_label)

        # Time indicator
        self.t_val = 0
        time_text = always_redraw(lambda: Text(
            f"t = {self.t_val:.2f}",
            font_size=24,
            color=YELLOW
        ).to_corner(UR))
        self.add(time_text)

        # Initial distribution (left side - simple blob)
        source_left = Ellipse(
            width=1.0, height=1.5,
            color=BLUE,
            fill_opacity=0.3,
            stroke_width=3
        ).move_to(LEFT * 3 + DOWN * 0.5)

        # Target distribution (left side - two modes)
        target_left_1 = Circle(
            radius=0.4,
            color=BLUE,
            fill_opacity=0.3,
            stroke_width=3
        ).move_to(LEFT * 3 + UP * 1.2 + LEFT * 0.6)

        target_left_2 = Circle(
            radius=0.4,
            color=BLUE,
            fill_opacity=0.3,
            stroke_width=3
        ).move_to(LEFT * 3 + UP * 1.2 + RIGHT * 0.6)

        # Initial distribution (right side - discrete points)
        n_points = 5
        source_points = []
        for i in range(n_points):
            angle = 2 * PI * i / n_points
            pos = RIGHT * 3 + DOWN * 0.5 + 0.5 * np.array([np.cos(angle), np.sin(angle), 0])
            point = Dot(pos, color=ORANGE, radius=0.15)
            source_points.append(point)

        # Target distribution (right side - discrete points in different config)
        target_points = []
        for i in range(n_points):
            if i < 3:
                pos = RIGHT * 3 + UP * 1.2 + LEFT * 0.6 + UP * 0.3 * (i - 1)
            else:
                pos = RIGHT * 3 + UP * 1.2 + RIGHT * 0.6 + UP * 0.3 * (i - 3)
            point = Dot(pos, color=ORANGE, radius=0.15)
            target_points.append(point)

        # Show initial states
        self.play(
            FadeIn(source_left),
            *[FadeIn(p) for p in source_points]
        )
        self.wait(0.5)

        # Show target states (ghosted)
        target_left = VGroup(target_left_1, target_left_2)
        self.play(
            FadeIn(target_left.set_opacity(0.3)),
            *[FadeIn(p.copy().set_opacity(0.3)) for p in target_points]
        )
        self.wait(0.5)

        # LEFT SIDE: Continuous flow of particles
        n_flow_particles = 40
        flow_particles = VGroup()

        for _ in range(n_flow_particles):
            # Sample from initial distribution
            r = np.random.randn() * 0.25
            theta = np.random.uniform(0, 2 * PI)
            pos = LEFT * 3 + DOWN * 0.5 + r * np.array([np.cos(theta), np.sin(theta) * 1.2, 0])

            particle = Dot(pos, color=BLUE, radius=0.05)
            flow_particles.add(particle)

        # RIGHT SIDE: Discrete particles that jump
        jump_particles = VGroup()
        jump_positions = []

        for i in range(n_points):
            angle = 2 * PI * i / n_points
            pos = RIGHT * 3 + DOWN * 0.5 + 0.5 * np.array([np.cos(angle), np.sin(angle), 0])

            # Multiple particles per state
            for _ in range(8):
                offset = np.random.randn(2) * 0.08
                particle_pos = pos + np.array([offset[0], offset[1], 0])
                particle = Dot(particle_pos, color=ORANGE, radius=0.05)
                jump_particles.add(particle)
                jump_positions.append(i)  # Which state this particle is in

        self.add(flow_particles, jump_particles)
        self.wait(0.5)

        # Animate transport
        n_steps = 120

        for step in range(n_steps):
            self.t_val = step / n_steps

            # LEFT: Smooth ODE flow
            new_flow_particles = VGroup()
            for particle in flow_particles:
                current_pos = particle.get_center()

                # Vector field pointing toward one of two targets
                # Determine which target is closer
                to_target1 = (LEFT * 3 + UP * 1.2 + LEFT * 0.6) - current_pos
                to_target2 = (LEFT * 3 + UP * 1.2 + RIGHT * 0.6) - current_pos

                # Split flow based on x-position
                if current_pos[0] < -3:
                    target = to_target1
                else:
                    target = to_target2

                # Velocity field
                velocity = target * 0.08 + np.random.randn(3) * 0.02
                new_pos = current_pos + velocity

                new_particle = Dot(new_pos, color=BLUE, radius=0.05)
                new_flow_particles.add(new_particle)

            # RIGHT: CTMC jumps
            new_jump_particles = VGroup()
            new_jump_positions = []

            for i, (particle, state) in enumerate(zip(jump_particles, jump_positions)):
                current_pos = particle.get_center()

                # Jump probability (increases with time)
                jump_prob = 0.05 * self.t_val

                if np.random.rand() < jump_prob:
                    # Jump to target state configuration
                    if state < 3:
                        new_state_center = RIGHT * 3 + UP * 1.2 + LEFT * 0.6 + UP * 0.3 * (state - 1)
                    else:
                        new_state_center = RIGHT * 3 + UP * 1.2 + RIGHT * 0.6 + UP * 0.3 * (state - 3)

                    offset = np.random.randn(2) * 0.08
                    new_pos = new_state_center + np.array([offset[0], offset[1], 0])
                else:
                    # Stay in current state with small diffusion
                    offset = np.random.randn(2) * 0.02
                    new_pos = current_pos + np.array([offset[0], offset[1], 0])

                new_particle = Dot(new_pos, color=ORANGE, radius=0.05)
                new_jump_particles.add(new_particle)
                new_jump_positions.append(state)

            jump_positions = new_jump_positions

            # Update
            self.play(
                Transform(flow_particles, new_flow_particles),
                Transform(jump_particles, new_jump_particles),
                run_time=0.05,
                rate_func=linear
            )

        # Final annotations
        flow_eq = MathTex(
            r"\frac{d\mathbf{x}}{dt} = v_t(\mathbf{x})",
            font_size=28
        ).move_to(LEFT * 3 + DOWN * 2)

        ctmc_eq = MathTex(
            r"q_{ij}(t) = \text{rate}(i \to j, t)",
            font_size=28
        ).move_to(RIGHT * 3 + DOWN * 2)

        self.play(Write(flow_eq), Write(ctmc_eq))
        self.wait(2)

        # Final text
        conclusion = Text(
            "Both paths transport probability from source to target",
            font_size=20,
            color=GRAY
        ).to_edge(DOWN)

        self.play(Write(conclusion))
        self.wait(3)


if __name__ == "__main__":
    # Render with: manim -pql measure_transport.py MeasureTransport
    # Or high quality: manim -pqh measure_transport.py MeasureTransport
    pass
