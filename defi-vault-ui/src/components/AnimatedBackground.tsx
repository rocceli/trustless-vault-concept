import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const bitcoins: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Create floating Bitcoin symbols
    for (let i = 0; i < 15; i++) {
      bitcoins.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 20 + 15,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    const drawBitcoin = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.12)';
      ctx.fillText('₿', 0, 0);
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bitcoins.forEach((bitcoin) => {
        bitcoin.x += bitcoin.vx;
        bitcoin.y += bitcoin.vy;
        bitcoin.rotation += bitcoin.rotationSpeed;

        // Wrap around edges
        if (bitcoin.x < -50) bitcoin.x = canvas.width + 50;
        if (bitcoin.x > canvas.width + 50) bitcoin.x = -50;
        if (bitcoin.y < -50) bitcoin.y = canvas.height + 50;
        if (bitcoin.y > canvas.height + 50) bitcoin.y = -50;

        drawBitcoin(bitcoin.x, bitcoin.y, bitcoin.size, bitcoin.rotation);
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}