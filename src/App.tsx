import { useEffect, useRef } from 'react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paddleXRef = useRef(200);
  const gameStarted = useRef(false);

  const canvasWidth = 480;
  const canvasHeight = 320;

  const paddleWidth = 75;
  const paddleHeight = 10;
  const paddleY = canvasHeight - 20;
  const paddleSpeed = 5;

  const keys = useRef({ left: false, right: false });
  const buttonsRef = useRef({ left: false, right: false });

  const startGame = () => {
    if (!gameStarted.current) {
      gameStarted.current = true;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        keys.current.left = true;
        startGame();
      }
      if (e.key === 'ArrowRight') {
        keys.current.right = true;
        startGame();
      }
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

    let ballX = canvasWidth / 2;
    let ballY = canvasHeight / 2;
    let ballRadius = 8;
    let ballDX = 2;
    let ballDY = -2;

    const brickColumnCount = 7;
    const brickRowCount = 5;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;

    const brickWidth =
      (canvasWidth - brickOffsetLeft * 2 - (brickColumnCount - 1) * brickPadding) /
      brickColumnCount;
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
      let bricksRemaining = 0;

      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const brick = bricks[c][r];
          if (brick.status === 1) {
            bricksRemaining++;
            if (
              ballX > brick.x &&
              ballX < brick.x + brickWidth &&
              ballY > brick.y &&
              ballY < brick.y + brickHeight
            ) {
              ballDY = -ballDY;
              brick.status = 0;
              bricksRemaining--;
            }
          }
        }
      }

      if (bricksRemaining === 0) {
        alert('You Win!');
        resetGame();
      }
    };

    const resetGame = () => {
      ballX = canvasWidth / 2;
      ballY = canvasHeight / 2;
      ballDX = 2;
      ballDY = -2;
      gameStarted.current = false;

      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          bricks[c][r].status = 1;
        }
      }
    };

    const draw = () => {
      // Move paddle
      if (keys.current.left || buttonsRef.current.left) paddleXRef.current -= paddleSpeed;
      if (keys.current.right || buttonsRef.current.right) paddleXRef.current += paddleSpeed;
      paddleXRef.current = Math.max(
        0,
        Math.min(canvasWidth - paddleWidth, paddleXRef.current)
      );

      // Move ball only if game started
      if (gameStarted.current) {
        ballX += ballDX;
        ballY += ballDY;
      }

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
        resetGame();
      }

      // Draw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvasHeight);

      drawBricks();

      ctx.fillStyle = '#fff';
      ctx.fillRect(paddleXRef.current, paddleY, paddleWidth, paddleHeight);

      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'lime';
      ctx.fill();
      ctx.closePath();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []); // ✅ no buttons dependency

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 space-y-4">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-white rounded-2xl"
      />
      <div className="flex gap-4">
        <button
          onMouseDown={() => {
            buttonsRef.current.left = true;
            startGame();
          }}
          onMouseUp={() => (buttonsRef.current.left = false)}
          onTouchStart={() => {
            buttonsRef.current.left = true;
            startGame();
          }}
          onTouchEnd={() => (buttonsRef.current.left = false)}
          className="px-6 py-2 bg-blue-500 text-white rounded-md active:scale-95"
        >
          ⬅️ Left
        </button>
        <button
          onMouseDown={() => {
            buttonsRef.current.right = true;
            startGame();
          }}
          onMouseUp={() => (buttonsRef.current.right = false)}
          onTouchStart={() => {
            buttonsRef.current.right = true;
            startGame();
          }}
          onTouchEnd={() => (buttonsRef.current.right = false)}
          className="px-6 py-2 bg-blue-500 text-white rounded-md active:scale-95"
        >
          ➡️ Right
        </button>
      </div>
    </div>
  );
}

export default App;
