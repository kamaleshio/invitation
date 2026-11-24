import React, { useEffect, useRef } from 'react';

interface Node {
  id: number;
  xRatio: number; // 0 to 1 relative to window width
  yRatio: number; // 0 to 1 relative to document or viewport height
  radius: number;
  glowRadius: number;
  color: string;
  phase: number;
  active: boolean;
  activationOrder: number; // sequential reveal
  horizontalBeam?: boolean; // draws horizontal cinematic beam like reference
}

interface Branch {
  from: number;
  to: number;
  progress: number; // 0 (hidden) to 1 (fully connected)
  targetProgress: number;
  speed: number;
  order: number; // sequence in the branching chain
}

interface ParticlePulse {
  branchIndex: number;
  t: number; // 0 to 1 along the line
  speed: number;
  size: number;
  color: string;
}

export const BranchingNodeNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId: number;
    let width = document.documentElement.clientWidth || window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const handleResize = () => {
      width = document.documentElement.clientWidth || window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Node network definition spanning top hero to bottom sections
    // Organic, interconnected constellation matching the cinematic reference
    const rawNodes: Node[] = [
      // Cluster 1: Top Hero / Envelope area (left side)
      { id: 0, xRatio: 0.12, yRatio: 0.14, radius: 4, glowRadius: 18, color: '#FFFFFF', phase: 0.2, active: false, activationOrder: 0, horizontalBeam: true },
      { id: 1, xRatio: 0.24, yRatio: 0.22, radius: 3.5, glowRadius: 16, color: '#E9B95B', phase: 1.1, active: false, activationOrder: 1 },
      { id: 2, xRatio: 0.18, yRatio: 0.32, radius: 3, glowRadius: 14, color: '#FFFFFF', phase: 2.3, active: false, activationOrder: 2 },
      { id: 3, xRatio: 0.08, yRatio: 0.26, radius: 4, glowRadius: 18, color: '#E9B95B', phase: 3.4, active: false, activationOrder: 3 },
      { id: 4, xRatio: 0.28, yRatio: 0.38, radius: 3.5, glowRadius: 15, color: '#FFFFFF', phase: 0.8, active: false, activationOrder: 4, horizontalBeam: true },

      // Cluster 2: Mid-Top / Countdown area (right side)
      { id: 5, xRatio: 0.88, yRatio: 0.16, radius: 4.5, glowRadius: 20, color: '#FFFFFF', phase: 1.5, active: false, activationOrder: 1, horizontalBeam: true },
      { id: 6, xRatio: 0.76, yRatio: 0.25, radius: 3.5, glowRadius: 16, color: '#E9B95B', phase: 2.7, active: false, activationOrder: 2 },
      { id: 7, xRatio: 0.85, yRatio: 0.35, radius: 4, glowRadius: 18, color: '#FFFFFF', phase: 0.4, active: false, activationOrder: 3 },
      { id: 8, xRatio: 0.72, yRatio: 0.44, radius: 3, glowRadius: 14, color: '#E9B95B', phase: 1.9, active: false, activationOrder: 5 },
      { id: 9, xRatio: 0.92, yRatio: 0.48, radius: 3.5, glowRadius: 16, color: '#FFFFFF', phase: 3.1, active: false, activationOrder: 6, horizontalBeam: true },

      // Cluster 3: Mid Section / About & Gallery (connecting bridge across sides)
      { id: 10, xRatio: 0.35, yRatio: 0.52, radius: 3.5, glowRadius: 16, color: '#FFFFFF', phase: 2.1, active: false, activationOrder: 7 },
      { id: 11, xRatio: 0.15, yRatio: 0.60, radius: 4, glowRadius: 18, color: '#E9B95B', phase: 0.9, active: false, activationOrder: 8 },
      { id: 12, xRatio: 0.26, yRatio: 0.70, radius: 3, glowRadius: 15, color: '#FFFFFF', phase: 1.7, active: false, activationOrder: 9, horizontalBeam: true },
      { id: 13, xRatio: 0.42, yRatio: 0.65, radius: 3.5, glowRadius: 16, color: '#E9B95B', phase: 3.0, active: false, activationOrder: 10 },

      // Cluster 4: Lower Section / Registration, Seating & Wall (right side)
      { id: 14, xRatio: 0.65, yRatio: 0.58, radius: 3.5, glowRadius: 16, color: '#FFFFFF', phase: 1.2, active: false, activationOrder: 8 },
      { id: 15, xRatio: 0.82, yRatio: 0.68, radius: 4, glowRadius: 18, color: '#E9B95B', phase: 2.4, active: false, activationOrder: 9 },
      { id: 16, xRatio: 0.70, yRatio: 0.78, radius: 3.5, glowRadius: 16, color: '#FFFFFF', phase: 0.6, active: false, activationOrder: 11, horizontalBeam: true },
      { id: 17, xRatio: 0.88, yRatio: 0.85, radius: 4.5, glowRadius: 20, color: '#E9B95B', phase: 1.8, active: false, activationOrder: 12 },

      // Cluster 5: Footer & Base
      { id: 18, xRatio: 0.20, yRatio: 0.88, radius: 4, glowRadius: 18, color: '#FFFFFF', phase: 2.9, active: false, activationOrder: 13 },
      { id: 19, xRatio: 0.48, yRatio: 0.92, radius: 4.5, glowRadius: 22, color: '#E9B95B', phase: 0.3, active: false, activationOrder: 14, horizontalBeam: true },
      { id: 20, xRatio: 0.78, yRatio: 0.94, radius: 3.5, glowRadius: 16, color: '#FFFFFF', phase: 1.4, active: false, activationOrder: 15 },
    ];

    // Branches connecting nodes sequentially in branching hierarchy
    const rawBranches: Branch[] = [
      // Cluster 1 tree
      { from: 0, to: 1, progress: 0, targetProgress: 0, speed: 0.015, order: 0 },
      { from: 1, to: 2, progress: 0, targetProgress: 0, speed: 0.014, order: 1 },
      { from: 2, to: 3, progress: 0, targetProgress: 0, speed: 0.012, order: 2 },
      { from: 1, to: 4, progress: 0, targetProgress: 0, speed: 0.013, order: 2 },
      { from: 3, to: 0, progress: 0, targetProgress: 0, speed: 0.010, order: 3 }, // constellation loop

      // Cluster 2 tree
      { from: 5, to: 6, progress: 0, targetProgress: 0, speed: 0.016, order: 1 },
      { from: 6, to: 7, progress: 0, targetProgress: 0, speed: 0.014, order: 2 },
      { from: 7, to: 8, progress: 0, targetProgress: 0, speed: 0.013, order: 3 },
      { from: 7, to: 9, progress: 0, targetProgress: 0, speed: 0.015, order: 4 },
      { from: 8, to: 5, progress: 0, targetProgress: 0, speed: 0.010, order: 4 },

      // Cross-linking & downward growth (Cluster 1 -> Cluster 3)
      { from: 4, to: 10, progress: 0, targetProgress: 0, speed: 0.012, order: 5 },
      { from: 10, to: 11, progress: 0, targetProgress: 0, speed: 0.014, order: 6 },
      { from: 11, to: 12, progress: 0, targetProgress: 0, speed: 0.013, order: 7 },
      { from: 10, to: 13, progress: 0, targetProgress: 0, speed: 0.012, order: 8 },

      // Cross-linking & downward growth (Cluster 2 -> Cluster 4)
      { from: 8, to: 14, progress: 0, targetProgress: 0, speed: 0.013, order: 6 },
      { from: 14, to: 15, progress: 0, targetProgress: 0, speed: 0.014, order: 7 },
      { from: 15, to: 16, progress: 0, targetProgress: 0, speed: 0.012, order: 8 },
      { from: 16, to: 17, progress: 0, targetProgress: 0, speed: 0.015, order: 9 },

      // Bottom Bridge (Cluster 3 + 4 -> Cluster 5)
      { from: 12, to: 18, progress: 0, targetProgress: 0, speed: 0.011, order: 10 },
      { from: 16, to: 19, progress: 0, targetProgress: 0, speed: 0.012, order: 11 },
      { from: 18, to: 19, progress: 0, targetProgress: 0, speed: 0.013, order: 12 },
      { from: 19, to: 20, progress: 0, targetProgress: 0, speed: 0.014, order: 13 },
      { from: 17, to: 20, progress: 0, targetProgress: 0, speed: 0.011, order: 14 },
    ];

    // Traveling particles / photons along active branches
    const pulses: ParticlePulse[] = [
      { branchIndex: 0, t: 0.1, speed: 0.008, size: 2.5, color: '#FFFFFF' },
      { branchIndex: 1, t: 0.4, speed: 0.009, size: 2.2, color: '#E9B95B' },
      { branchIndex: 5, t: 0.2, speed: 0.007, size: 2.5, color: '#FFFFFF' },
      { branchIndex: 6, t: 0.7, speed: 0.009, size: 2.3, color: '#E9B95B' },
      { branchIndex: 10, t: 0.3, speed: 0.008, size: 2.2, color: '#FFFFFF' },
      { branchIndex: 14, t: 0.5, speed: 0.008, size: 2.5, color: '#E9B95B' },
      { branchIndex: 18, t: 0.2, speed: 0.007, size: 2.4, color: '#FFFFFF' },
    ];

    let startTime = performance.now();
    let scrollY = window.scrollY;

    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    let isPaused = false;
    const handleVisibility = () => {
      if (document.hidden) {
        isPaused = true;
      } else {
        isPaused = false;
        startTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = (now: number) => {
      if (isPaused) return;
      const elapsed = (now - startTime) / 1000;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Scroll progress across full document
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        height * 2
      );
      const maxScroll = Math.max(docHeight - height, 1);
      const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      // Natural continuous growth timer combined with scroll-driven expansion:
      // Even without scrolling, branches 0 to 4 start branching sequentially over the first 4 seconds.
      // Scrolling unlocks deeper levels of branches smoothly.
      const timeDrivenMaxOrder = Math.min(Math.floor(elapsed * 1.5), 6);
      const scrollDrivenMaxOrder = Math.floor(scrollProgress * 15);
      const activeMaxOrder = Math.max(timeDrivenMaxOrder, scrollDrivenMaxOrder);

      // Update branches progress
      rawBranches.forEach((branch) => {
        if (prefersReducedMotion) {
          branch.progress = 1;
          return;
        }

        const isUnlocked = branch.order <= activeMaxOrder;
        branch.targetProgress = isUnlocked ? 1 : 0;

        // Smooth growth interpolation
        if (branch.progress < branch.targetProgress) {
          branch.progress = Math.min(branch.targetProgress, branch.progress + branch.speed);
        } else if (branch.progress > branch.targetProgress) {
          branch.progress = Math.max(branch.targetProgress, branch.progress - branch.speed * 1.5);
        }
      });

      // Compute screen positions with subtle vertical parallax relative to viewport
      const getNodePos = (node: Node) => {
        const x = node.xRatio * width;
        // Map document yRatio with subtle parallax displacement
        const docY = node.yRatio * docHeight;
        const screenY = docY - scrollY * 0.85; // Subtle parallax depth
        return { x, y: screenY };
      };

      // 1. DRAW HORIZONTAL CINEMATIC BEAMS (matching reference image)
      rawNodes.forEach((node) => {
        if (!node.horizontalBeam) return;
        const { x, y } = getNodePos(node);

        // Check if node is in or near visible viewport
        if (y < -50 || y > height + 50) return;

        // Only draw if associated node has ignited
        const nodeActive = rawBranches.some(
          (b) => (b.from === node.id || b.to === node.id) && b.progress > 0.4
        );
        if (!nodeActive) return;

        ctx.save();
        const beamGrad = ctx.createLinearGradient(0, y, width, y);
        beamGrad.addColorStop(0, 'rgba(233, 185, 91, 0)');
        beamGrad.addColorStop(Math.max(0, node.xRatio - 0.25), 'rgba(233, 185, 91, 0.04)');
        beamGrad.addColorStop(node.xRatio, 'rgba(255, 255, 255, 0.35)');
        beamGrad.addColorStop(Math.min(1, node.xRatio + 0.25), 'rgba(233, 185, 91, 0.04)');
        beamGrad.addColorStop(1, 'rgba(233, 185, 91, 0)');

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.restore();
      });

      // 2. DRAW CONNECTING BRANCHES (Illuminated lines extending sequentially)
      rawBranches.forEach((branch) => {
        if (branch.progress <= 0.005) return;

        const nodeA = rawNodes[branch.from];
        const nodeB = rawNodes[branch.to];

        const posA = getNodePos(nodeA);
        const posB = getNodePos(nodeB);

        // Culling: if both are far outside viewport, skip
        if ((posA.y < -100 && posB.y < -100) || (posA.y > height + 100 && posB.y > height + 100)) {
          return;
        }

        // Current tip of extending line
        const currX = posA.x + (posB.x - posA.x) * branch.progress;
        const currY = posA.y + (posB.y - posA.y) * branch.progress;

        // Gradient line from NodeA to current tip
        const lineGrad = ctx.createLinearGradient(posA.x, posA.y, currX, currY);
        lineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        lineGrad.addColorStop(0.5, 'rgba(233, 185, 91, 0.55)');
        lineGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

        ctx.save();
        // Thin glowing stroke
        ctx.shadowColor = '#E9B95B';
        ctx.shadowBlur = 6;
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(posA.x, posA.y);
        ctx.lineTo(currX, currY);
        ctx.stroke();

        // Glowing growing tip point when in the middle of extending
        if (branch.progress > 0.02 && branch.progress < 0.98) {
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(currX, currY, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 3. DRAW TRAVELING PARTICLES / PHOTON COMETS ALONG ACTIVE BRANCHES
      pulses.forEach((pulse) => {
        const branch = rawBranches[pulse.branchIndex];
        if (!branch || branch.progress < 0.8) return;

        const nodeA = rawNodes[branch.from];
        const nodeB = rawNodes[branch.to];
        const posA = getNodePos(nodeA);
        const posB = getNodePos(nodeB);

        // Progress particle
        if (!prefersReducedMotion) {
          pulse.t += pulse.speed;
          if (pulse.t > 1) pulse.t = 0;
        }

        const px = posA.x + (posB.x - posA.x) * pulse.t;
        const py = posA.y + (posB.y - posA.y) * pulse.t;

        if (py < -50 || py > height + 50) return;

        // Draw traveling photon spark with short fading tail
        ctx.save();
        ctx.shadowColor = '#E9B95B';
        ctx.shadowBlur = 12;

        // Tail
        const tailLength = 0.08;
        const tailStartT = Math.max(0, pulse.t - tailLength);
        const tailX = posA.x + (posB.x - posA.x) * tailStartT;
        const tailY = posA.y + (posB.y - posA.y) * tailStartT;

        const tailGrad = ctx.createLinearGradient(tailX, tailY, px, py);
        tailGrad.addColorStop(0, 'rgba(233, 185, 91, 0)');
        tailGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');

        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Head spark
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(px, py, pulse.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 4. DRAW GLOWING NODES (Endpoints with halo and breathing pulse)
      rawNodes.forEach((node) => {
        const { x, y } = getNodePos(node);
        if (y < -50 || y > height + 50) return;

        // Check if any connected branch is active or starting to grow
        const activeBranches = rawBranches.filter(
          (b) => (b.from === node.id || b.to === node.id) && b.progress > 0
        );
        if (activeBranches.length === 0) return;

        const maxBranchProgress = Math.max(...activeBranches.map((b) => b.progress));
        if (maxBranchProgress <= 0.05) return;

        // Node breathing oscillation
        const breath = prefersReducedMotion ? 1 : 1 + 0.18 * Math.sin(elapsed * 2.2 + node.phase);
        const nodeAlpha = Math.min(1, maxBranchProgress * 1.5);

        ctx.save();
        // 1. Soft atmospheric outer halo
        const haloGrad = ctx.createRadialGradient(x, y, 0, x, y, node.glowRadius * breath);
        haloGrad.addColorStop(0, `rgba(233, 185, 91, ${0.45 * nodeAlpha})`);
        haloGrad.addColorStop(0.4, `rgba(246, 201, 168, ${0.20 * nodeAlpha})`);
        haloGrad.addColorStop(1, 'rgba(233, 185, 91, 0)');

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(x, y, node.glowRadius * breath, 0, Math.PI * 2);
        ctx.fill();

        // 2. Bright glowing core
        ctx.shadowColor = '#E9B95B';
        ctx.shadowBlur = 10 * breath;
        ctx.fillStyle = node.color;
        ctx.globalAlpha = nodeAlpha;
        ctx.beginPath();
        ctx.arc(x, y, node.radius * breath, 0, Math.PI * 2);
        ctx.fill();

        // 3. Ultra-bright white center pinpoint
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, (node.radius * 0.5) * breath, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-0 select-none max-w-full overflow-hidden"
      style={{ opacity: 0.92 }}
    />
  );
};
