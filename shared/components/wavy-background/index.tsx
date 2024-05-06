'use client';
import { cn } from '@/shared/utils/cn';
import hslToHex from '@/shared/utils/hsl-to-hex';
import React, { useEffect, useRef, useState } from 'react';
import { createNoise3D } from 'simplex-noise';

export interface IWavyBackgroundProps {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: 'slow' | 'fast';
  waveOpacity?: number;
  [key: string]: any;
}

const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = 'fast',
  waveOpacity = 0.5,
  ...props
}: IWavyBackgroundProps) => {
  const noise = createNoise3D();
  let w: number,
    h: number,
    nt: number,
    i: number,
    x: number,
    ctx: any,
    canvasContainer: HTMLDivElement,
    canvas: any;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const getSpeed = () => {
    switch (speed) {
      case 'slow':
        return 0.001;
      case 'fast':
        return 0.002;
      default:
        return 0.001;
    }
  };
  let waveColors: any;
  const init = () => {
    canvas = canvasRef.current;
    canvasContainer = containerRef.current as HTMLDivElement;
    ctx = canvas.getContext('2d');
    w = ctx.canvas.width = canvasContainer.offsetWidth;
    h = ctx.canvas.height = canvasContainer.offsetHeight;
    ctx.filter = `blur(${blur}px)`;
    nt = 0;
    window.onresize = function () {
      w = ctx.canvas.width = canvasContainer.offsetWidth;
      h = ctx.canvas.height = canvasContainer.offsetHeight;
      ctx.filter = `blur(${blur}px)`;
    };
    const primaryColor = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--primary');
    const primaryColorHex = hslToHex(primaryColor);

    waveColors = colors ?? [
      primaryColorHex,
      '#8126dc',
      primaryColorHex,
      '#8126dc',
    ];
    render();
  };

  const drawWave = (n: number) => {
    nt += getSpeed();
    for (i = 0; i < n; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth || 50;
      ctx.strokeStyle = waveColors[i % waveColors.length];
      for (x = 0; x < w; x += 5) {
        var y = noise(x / 800, 0.3 * i, nt) * 100;
        ctx.lineTo(x, y + h * 0.5); // adjust for height, currently at 50% of the container
      }
      ctx.stroke();
      ctx.closePath();
    }
  };

  let animationId: number;
  const render = () => {
    ctx.fillStyle = backgroundFill || 'black';
    ctx.globalAlpha = waveOpacity || 0.5;
    ctx.fillRect(0, 0, w, h);
    drawWave(5);
    animationId = requestAnimationFrame(render);
  };

  useEffect(() => {
    init();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    // I'm sorry but i have got to support it on safari.
    setIsSafari(
      typeof window !== 'undefined' &&
        navigator.userAgent.includes('Safari') &&
        !navigator.userAgent.includes('Chrome'),
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-background',
        containerClassName,
      )}
    >
      <canvas
        className="absolute inset-0 z-0 top-[80px] bg-background"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      />
      <div className={cn('relative z-10', className)} {...props}>
        {children}
      </div>
    </div>
  );
};

export default WavyBackground;
