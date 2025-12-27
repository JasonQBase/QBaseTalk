"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  angle: number;
  spin: number;
  size: number;
}

const COLORS = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#F3FF33",
  "#FF33F3",
  "#33FFF3",
];

export function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Initialize state with lazy initializer to avoid setState in useEffect
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window === "undefined") return { width: 0, height: 0 };
    return { width: window.innerWidth, height: window.innerHeight };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    let animationId: number;

    const createParticles = () => {
      for (let i = 0; i < 150; i++) {
        particles.push({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2, // Start from center
          vx: (Math.random() - 0.5) * 25, // Random X velocity
          vy: (Math.random() - 0.5) * 25 - 10, // Random Y velocity (upwards bias)
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          angle: Math.random() * 360,
          spin: (Math.random() - 0.5) * 0.2, // Random spin
          size: Math.random() * 8 + 4,
        });
      }
    };

    const update = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravity
        p.angle += p.spin;
        p.vx *= 0.99; // Drag
        p.vy *= 0.99;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        // Remove particles that go off screen
        if (p.y > window.innerHeight + 100) {
          particles.splice(i, 1);
        }
      });

      if (particles.length > 0) {
        animationId = requestAnimationFrame(update);
      }
    };

    createParticles();
    update();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      width={windowSize.width}
      height={windowSize.height}
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
