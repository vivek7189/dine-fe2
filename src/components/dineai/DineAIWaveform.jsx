'use client';

import { useEffect, useRef } from 'react';

/**
 * DineAI Waveform Visualization
 * Shows audio levels during listening or speaking
 */
const DineAIWaveform = ({
  isActive = false,
  mode = 'listening', // 'listening' or 'speaking'
  audioLevel = 0,
  barCount = 5,
  height = 60,
  color = '#6366f1'
}) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const barsRef = useRef([]);

  // Animation for bars
  useEffect(() => {
    if (!isActive) {
      // Reset bars to minimum height
      barsRef.current.forEach((bar, i) => {
        if (bar) {
          bar.style.height = '8px';
        }
      });
      return;
    }

    const animate = () => {
      barsRef.current.forEach((bar, i) => {
        if (bar) {
          // Create dynamic wave effect
          const time = Date.now() / 200;
          const phase = i * 0.8;
          const baseHeight = 8;
          const maxAdditional = height - baseHeight;

          // Different animation for listening vs speaking
          let newHeight;

          if (mode === 'listening') {
            // Listening: React to audio level with wave
            const wave = Math.sin(time + phase) * 0.5 + 0.5;
            const levelFactor = Math.min(audioLevel * 1.5, 1);
            newHeight = baseHeight + (wave * maxAdditional * levelFactor);
          } else {
            // Speaking: Smoother, more rhythmic
            const wave = Math.sin(time + phase) * 0.4 + Math.sin(time * 1.5 + phase) * 0.3 + 0.3;
            newHeight = baseHeight + (wave * maxAdditional);
          }

          bar.style.height = `${newHeight}px`;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, mode, audioLevel, height]);

  const getColor = () => {
    if (mode === 'listening') {
      return '#ef4444'; // Red for listening
    }
    return color; // Default (indigo) for speaking
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        height: `${height}px`,
        padding: '0 16px'
      }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (barsRef.current[i] = el)}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '4px',
            backgroundColor: getColor(),
            transition: isActive ? 'height 0.05s ease' : 'height 0.3s ease',
            opacity: isActive ? 1 : 0.3
          }}
        />
      ))}
    </div>
  );
};

/**
 * Circular waveform for compact display
 */
export const DineAICircularWave = ({
  isActive = false,
  size = 100,
  color = '#6366f1'
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 3;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      if (isActive) {
        const time = Date.now() / 500;

        // Draw multiple rings
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = radius + ring * 15;
          const opacity = 0.6 - ring * 0.2;

          ctx.beginPath();

          for (let i = 0; i <= 360; i += 5) {
            const angle = (i * Math.PI) / 180;
            const wave = Math.sin(time * 3 + i / 30 + ring) * 8;
            const x = centerX + (ringRadius + wave) * Math.cos(angle);
            const y = centerY + (ringRadius + wave) * Math.sin(angle);

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.closePath();
          ctx.strokeStyle = color;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      } else {
        // Static circle when not active
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, size, color]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        width: size,
        height: size
      }}
    />
  );
};

export default DineAIWaveform;
