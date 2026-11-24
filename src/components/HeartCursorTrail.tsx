import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  char: string;
}

export const HeartCursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Only on pointer-fine (mouse/desktop)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = document.documentElement.clientWidth || window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = document.documentElement.clientWidth || window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const chars = ['★', '♥', '✨', '🎓'];

    const createHeart = (x: number, y: number) => {
      const colors = ['#E9B95B', '#E9B8B0', '#F6C9A8', '#D99F37', '#594337'];
      const char = chars[Math.floor(Math.random() * chars.length)];
      particles.push({
        x: x + (Math.random() * 12 - 6),
        y: y + (Math.random() * 12 - 6),
        size: Math.random() * 12 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5 - 1.2,
        opacity: 0.9,
        life: 1,
        char
      });
    };

    let lastTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime > 40) {
        createHeart(e.clientX, e.clientY);
        lastTime = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.025;
        p.opacity = p.life;

        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;
          ctx.font = `${p.size}px Outfit, sans-serif`;
          ctx.fillText(p.char, p.x, p.y);
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="cursor-canvas" />;
};
