import { useEffect, useRef } from "react";

const VIEW_W = 400;
const VIEW_H = 200;
const DRAW_MS = 4500;
const HOLD_MS = 900;
const TAIL_FRACTION = 0.14;

type Point = { x: number; y: number };

/** Sample evenly spaced points along an SVG path string, in viewBox units. */
function samplePath(d: string): Point[] {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
  svg.appendChild(path);
  // Firefox only measures paths that are in the document.
  document.body.appendChild(svg);

  const total = path.getTotalLength();
  if (!total) {
    svg.remove();
    return [];
  }

  const count = Math.min(600, Math.max(120, Math.round(total)));
  const points: Point[] = [];
  for (let i = 0; i <= count; i++) {
    const { x, y } = path.getPointAtLength((i / count) * total);
    points.push({ x, y });
  }

  svg.remove();
  return points;
}

function traceSegment(ctx: CanvasRenderingContext2D, points: Point[], from: number, to: number) {
  ctx.beginPath();
  ctx.moveTo(points[from].x, points[from].y);
  for (let i = from + 1; i <= to; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
}

type RouteCanvasProps = {
  d: string;
  className?: string;
};

/**
 * Replays the route as a comet tracing the line: ghost route underneath, a
 * trail that accumulates, a glowing head. Loops until unmounted.
 */
export function RouteCanvas(props: RouteCanvasProps) {
  const { d, className } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points = samplePath(d);
    if (points.length < 2) return;

    const last = points.length - 1;
    const color = getComputedStyle(canvas).color;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    let start = 0;

    // Map viewBox units onto the canvas the way SVG's default "xMidYMid meet" would.
    function fitToCanvas() {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(width * dpr);
      const h = Math.round(height * dpr);
      // Assigning width/height reallocates the buffer, so only do it on a real resize.
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const scale = Math.min(width / VIEW_W, height / VIEW_H);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate((width - VIEW_W * scale) / 2, (height - VIEW_H * scale) / 2);
      ctx.scale(scale, scale);
      return scale;
    }

    function render(progress: number, scale: number) {
      // Keep stroke weights constant on screen regardless of the fit scale.
      const unit = 1 / scale;

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;

      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 1.5 * unit;
      traceSegment(ctx, points, 0, last);

      const head = Math.max(1, Math.round(progress * last));

      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.75 * unit;
      traceSegment(ctx, points, 0, head);

      // Comet tail: brighter and thicker as it approaches the head.
      const tailStart = Math.max(0, head - Math.round(last * TAIL_FRACTION));
      ctx.shadowColor = color;
      for (let i = tailStart; i < head; i++) {
        const t = (i - tailStart) / Math.max(1, head - tailStart);
        ctx.globalAlpha = 0.25 + 0.75 * t;
        ctx.lineWidth = (1.75 + 1.25 * t) * unit;
        ctx.shadowBlur = 6 * t;
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 8;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(points[head].x, points[head].y, 3 * unit, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    function drawStatic() {
      const scale = fitToCanvas();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1.75 / scale;
      traceSegment(ctx, points, 0, last);
    }

    function tick(now: number) {
      const scale = fitToCanvas();
      if (!start) start = now;

      const elapsed = (now - start) % (DRAW_MS + HOLD_MS);
      render(Math.min(1, elapsed / DRAW_MS), scale);
      frame = requestAnimationFrame(tick);
    }

    if (reduceMotion) {
      drawStatic();
      const observer = new ResizeObserver(drawStatic);
      observer.observe(canvas);
      return () => observer.disconnect();
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [d]);

  return <canvas ref={canvasRef} className={className} aria-label="route map" role="img" />;
}
