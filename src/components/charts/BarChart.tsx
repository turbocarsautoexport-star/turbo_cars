"use client";

import { useMemo, useState } from "react";
import { SeriesPoint } from "@/lib/statsData";
import { niceTicks } from "@/lib/format";
import ChartTooltip from "./ChartTooltip";

interface BarChartProps {
  data: SeriesPoint[];
  color: string;
  valueFormatter: (n: number) => string;
  ariaLabel: string;
}

const W = 600;
const H = 220;
const PAD = { top: 16, right: 8, bottom: 26, left: 8 };
const MAX_BAR_WIDTH = 24;

export default function BarChart({ data, color, valueFormatter, ariaLabel }: BarChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const { bars, ticks, yMax } = useMemo(() => {
    const maxRaw = Math.max(...data.map((d) => d.value), 1);
    const t = niceTicks(maxRaw, 4);
    const max = t[t.length - 1] || maxRaw;
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    const bandW = plotW / data.length;
    const barW = Math.min(MAX_BAR_WIDTH, bandW * 0.55);
    const baseY = PAD.top + plotH;

    const b = data.map((d, i) => {
      const cx = PAD.left + bandW * i + bandW / 2;
      const barH = (d.value / max) * plotH;
      return {
        ...d,
        cx,
        bandW,
        x: cx - barW / 2,
        y: baseY - barH,
        w: barW,
        h: Math.max(barH, 1.5),
        baseY,
      };
    });

    return { bars: b, ticks: t, yMax: max };
  }, [data]);

  const maxLabels = 7;
  const labelStep = Math.max(1, Math.ceil(bars.length / maxLabels));
  const hovered = hoverIdx !== null ? bars[hoverIdx] : null;

  function barPath(x: number, y: number, w: number, h: number) {
    const r = Math.min(4, h, w / 2);
    const baseY = y + h;
    return `M${x},${y + r}
      Q${x},${y} ${x + r},${y}
      L${x + w - r},${y}
      Q${x + w},${y} ${x + w},${y + r}
      L${x + w},${baseY}
      L${x},${baseY}
      Z`;
  }

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
        <div className="relative">
          {hovered && (
            <ChartTooltip
              leftPercent={(hovered.cx / W) * 100}
              label={hovered.label}
              value={valueFormatter(hovered.value)}
              color={color}
            />
          )}

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ariaLabel}>
            {ticks.map((t) => {
              const y = PAD.top + (H - PAD.top - PAD.bottom) * (1 - t / (yMax || 1));
              return (
                <line key={t} x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#2c2724" strokeWidth={1} />
              );
            })}

            {bars.map((b, i) => (
              <g
                key={i}
                onPointerEnter={() => setHoverIdx(i)}
                onPointerLeave={() => setHoverIdx((cur) => (cur === i ? null : cur))}
                style={{ cursor: "pointer" }}
              >
                <rect x={b.cx - b.bandW / 2} y={PAD.top} width={b.bandW} height={b.baseY - PAD.top} fill="transparent" />
                <path
                  d={barPath(b.x, b.y, b.w, b.h)}
                  fill={color}
                  opacity={hoverIdx === null || hoverIdx === i ? 1 : 0.55}
                />
              </g>
            ))}

            {bars.map((b, i) =>
              i % labelStep === 0 || i === bars.length - 1 ? (
                <text key={i} x={b.cx} y={H - 6} textAnchor="middle" fontSize={10} fill="#a89d99">
                  {b.label}
                </text>
              ) : null
            )}
          </svg>
        </div>
      )}
    </div>
  );
}
