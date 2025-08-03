import { useEffect, useRef, useState } from 'react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paddleX, setPaddleX] = useState(200);

  const canvasWidth = 480;
  const canvasHeight = 320;

  const paddleWidth = 75;
  const paddleHeight = 10;
  const paddleY = canvasHeight - 20;
  const paddleSpeed = 5;

  // Keep track of pressed keys
  const keys = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keys.current.left = true;
      if (e.key === 'ArrowRight') keys.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keys.current.left = false;
      if (e.key === 'ArrowRight') keys.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      // Update paddle position
      setPaddleX((prev) => {
        let nextX = prev;
        if (keys.current.left) nextX -= paddleSpeed;
        if (keys.current.right) nextX += paddleSpeed;

        // Clamp within canvas
        return Math.max(0, Math.min(canvasWidth - paddleWidth, nextX));
      });

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw paddle
      ctx.fillStyle = '#fff';
      ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [paddleX]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-800">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-white"
      />
    </div>
  );
}

export default App;
