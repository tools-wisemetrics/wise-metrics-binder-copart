"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, Tooltip, Treemap } from "recharts";
import type { TreemapNode } from "recharts";
import { formatNumberFull, formatPercentage } from "@/lib/utils/formatters";

export interface TreemapItem {
  name: string;
  value: number;
  color: string;
  share: number;
  [key: string]: string | number;
}

function isDark(hex: string) {
  const raw = hex.replace("#", "");
  if (raw.length < 6) return true;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 150;
}

function cellRenderer(
  selected: string[],
  onPick: (name: string, shiftKey: boolean) => void,
) {
  return function TreemapCell(node: TreemapNode) {
    const width = node.width ?? 0;
    const height = node.height ?? 0;
    if (width <= 0 || height <= 0) return <g />;

    const name = String(node.name ?? "");
    const color = typeof node.color === "string" ? node.color : "#6c7685";
    const active = selected.length === 0 || selected.includes(name);
    const fg = isDark(color) ? "#ffffff" : "#0b1f3a";
    const muted = isDark(color) ? "rgba(255,255,255,0.8)" : "#6c7685";
    const value = Number(node.value ?? 0);
    const share = typeof node.share === "number" ? node.share : 0;
    const showName = width > 72 && height > 28;
    const showValue = width > 88 && height > 48;

    return (
      <g
        style={{ cursor: "pointer" }}
        onClick={(event) => {
          event.stopPropagation();
          onPick(name, event.shiftKey);
        }}
      >
        <rect
          x={node.x}
          y={node.y}
          width={width}
          height={height}
          fill={color}
          opacity={active ? 1 : 0.28}
          stroke={selected.includes(name) ? "#00b8cf" : "#ffffff"}
          strokeWidth={selected.includes(name) ? 3 : 2}
          rx={10}
        />
        {showName && (
          <text
            x={node.x + 10}
            y={node.y + 20}
            fill={fg}
            fontSize={12}
            fontWeight={800}
            pointerEvents="none"
            opacity={active ? 1 : 0.7}
          >
            {name}
          </text>
        )}
        {showValue && (
          <text
            x={node.x + 10}
            y={node.y + 38}
            fill={muted}
            fontSize={11}
            fontWeight={600}
            pointerEvents="none"
            opacity={active ? 1 : 0.7}
          >
            {formatNumberFull(value)} · {formatPercentage(share)}
          </text>
        )}
      </g>
    );
  };
}

function TreemapTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: TreemapItem & { name?: string; value?: number } }>;
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl bg-[#0b1f3a] px-3 py-2 text-xs text-white shadow-lg">
      <p className="font-black">{row.name}</p>
      <p className="text-[#d9eaf5] mt-0.5">
        {formatNumberFull(row.value)} novos usuários · {formatPercentage(row.share)}
      </p>
      <p className="text-[#8aa4be] mt-1">Clique para filtrar · Shift+clique para somar</p>
    </div>
  );
}

export function TreemapChart({
  items,
  height = 360,
  selected = [],
  onPick,
}: {
  items: TreemapItem[];
  height?: number;
  selected?: string[];
  onPick?: (name: string, shiftKey: boolean) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height }} className="rounded-xl bg-[#f4f7fb]" />;

  return (
    <div style={{ height }} className="min-w-0 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={items}
          dataKey="value"
          nameKey="name"
          stroke="#ffffff"
          fill="#6c7685"
          aspectRatio={4 / 3}
          nodeGap={4}
          isAnimationActive={false}
          content={cellRenderer(selected, onPick ?? (() => undefined))}
        >
          <Tooltip content={<TreemapTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
