"use client";

import { useId, useMemo, useRef, useState } from "react";
import { SeriesPoint } from "@/lib/statsData";
import { niceTicks } from "@/lib/format";
import ChartTooltip from "./ChartTooltip";

interface LineAreaChartProps {
  data: SeriesPoint[];
  color: string;
  valueFormatter: (n: number) => string;
  ariaLabel: string;
}

const W = 600;
const H = 220;
const PAD = { top: 16, right: 8, bottom: 26, left: 8 };

export default function LineAreaChart({ data, color, valueFormatter, ariaLabel }: LineAreaChartProps) {
  const gradId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { points, ticks, yMax } = useMemo(() => {
    const maxRaw = Math.max(...data.map((d) => d.value), 1);
    const t = niceTicks(maxRaw, 4);
    const max = t[t.length - 1] || maxRaw;
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    const step = data.length > 1 ? plotW / (data.length - 1) : 0;

    const pts = data.map((d, i) => ({
      ...d,
      x: PAD.left + step * i,
      y: PAD.top + plotH - (d.value / max) * plotH,
    }));

    return { points: pts, ticks: t, yMax: max };
  }, [data]);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const baseY = PAD.top + (H - PAD.top - PAD.bottom);
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x.toFixed(1)},${baseY} L${points[0].x.toFixed(1)},${baseY} Z`
      : "";

  const maxLabels = 7;
  const labelStep = Math.max(1, Math.ceil(points.length / maxLabels));

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el || points.length === 0) return;
    const rect = el.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(fraction * (points.length - 1));
    setHoverIdx(idx);
  }

  const hovered = hoverIdx !== null ? points[hoverIdx] : points[points.length - 1];
  const [showTable, setShowTable] = useState(false);

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button
          onClick={() => setShowTable((v) => !v)}
          className="text-[11px] font-semibold uppercase tracking-wide text-turbo-muted hover:text-white"
        >
          {showTable ? "Grafik" : "Jadval"}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-56 overflow-y-auto rounded-lg border border-turbo-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-turbo-border text-[11px] uppercase tracking-wide text-turbo-muted">
                <th className="px-3 py-2 font-medium">Davr</th>
                <th className="px-3 py-2 font-medium">Qiymat</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className="border-b border-turbo-border/50 last:border-0">
                  <td className="px-3 py-1.5 text-turbo-muted">{d.label}</td>
                  <td className="px-3 py-1.5 font-semibold text-white">{valueFormatter(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIdx(null)}
        >
          {hovered && (
            <ChartTooltip
              leftPercent={(hovered.x / W) * 100}
              label={hovered.label}
              value={valueFormatter(hovered.value)}
              color={color}
            />
          )}

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ariaLabel}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            {ticks.map((t) => {
              const y = PAD.top + (H - PAD.top - PAD.bottom) * (1 - t / (yMax || 1));
              return (
                <g key={t}>
                  <line
                    x1={PAD.left}
                    x2={W - PAD.right}
                    y1={y}
                    y2={y}
                    stroke="#2c2724"
                    strokeWidth={1}
                  />
                </g>
              );
            })}

            {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
            {linePath && (
              <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            )}

            {hoverIdx !== null && points[hoverIdx] && (
              <line
                x1={points[hoverIdx].x}
                x2={points[hoverIdx].x}
                y1={PAD.top}
                y2={baseY}
                stroke="#4a423f"
                strokeWidth={1}
              />
            )}

            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r={5}
                fill={color}
                stroke="#1a1615"
                strokeWidth={3}
              />
            )}
            {hoverIdx !== null && points[hoverIdx] && (
              <circle cx={points[hoverIdx].x} cy={points[hoverIdx].y} r={5} fill={color} stroke="var(--turbo-surface)" strokeWidth={3} />
            )}

            {points.map((p, i) =>
              i % labelStep === 0 || i === points.length - 1 ? (
                <text
                  key={i}
                  x={p.x}
                  y={H - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#a89d99"
                >
                  {p.label}
                </text>
              ) : null
            )}
          </svg>
        </div>
      )}
    </div>
  );
}
