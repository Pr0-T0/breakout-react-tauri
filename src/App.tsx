import { useEffect, useRef } from 'react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paddleXRef = useRef(200);

  const canvasWidth = 480;
  const canvasHeight = 320;

  const paddleWidth = 75;
  const paddleHeight = 10;
  const paddleY = canvasHeight - 20;
  const paddleSpeed = 5;

  const keys = useRef({ left: false, right: false });

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

    // Ball state
    let ballX = canvasWidth / 2;
    let ballY = canvasHeight / 2;
    let ballRadius = 8;
    let ballDX = 2;
    let ballDY = -2;

    // Brick setup
    const brickColumnCount = 7;
    const brickRowCount = 5;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;

    // Auto calculate brick width to fit canvas
    const brickWidth = (canvasWidth - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) / brickColumnCount;
    const brickHeight = 15;


    const bricks: { x: number; y: number; status: number }[][] = [];
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    const drawBricks = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const brick = bricks[c][r];
          if (brick.status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            brick.x = brickX;
            brick.y = brickY;
            ctx.fillStyle = 'skyblue';
            ctx.fillRect(brickX, brickY, brickWidth, brickHeight);
          }
        }
      }
    };

    const detectBrickCollision = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const brick = bricks[c][r];
          if (brick.status === 1) {
            if (
              ballX > brick.x &&
              ballX < brick.x + brickWidth &&
              ballY > brick.y &&
              ballY < brick.y + brickHeight
            ) {
              ballDY = -ballDY;
              brick.status = 0;
            }
          }
        }
      }
    };

    const draw = () => {
      // Move paddle
      if (keys.current.left) paddleXRef.current -= paddleSpeed;
      if (keys.current.right) paddleXRef.current += paddleSpeed;
      paddleXRef.current = Math.max(
        0,
        Math.min(canvasWidth - paddleWidth, paddleXRef.current)
      );

      // Move ball
      ballX += ballDX;
      ballY += ballDY;

      // Wall collisions
      if (ballX + ballRadius > canvasWidth || ballX - ballRadius < 0) {
        ballDX = -ballDX;
      }
      if (ballY - ballRadius < 0) {
        ballDY = -ballDY;
      }

      // Paddle collision
      if (
        ballY + ballRadius >= paddleY &&
        ballX >= paddleXRef.current &&
        ballX <= paddleXRef.current + paddleWidth
      ) {
        ballDY = -ballDY;
        ballY = paddleY - ballRadius;
      }

      // Brick collision
      detectBrickCollision();

      // Game over
      if (ballY + ballRadius > canvasHeight) {
        alert('Game Over');
        ballX = canvasWidth / 2;
        ballY = canvasHeight / 2;
        ballDX = 2;
        ballDY = -2;
        for (let c = 0; c < brickColumnCount; c++) {
          for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = 1;
          }
        }
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw
      drawBricks();

      ctx.fillStyle = '#fff';
      ctx.fillRect(
        paddleXRef.current,
        paddleY,
        paddleWidth,
        paddleHeight
      );

      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'lime';
      ctx.fill();
      ctx.closePath();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

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
