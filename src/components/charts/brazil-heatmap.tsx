import type { RegionalRow } from "@/lib/data/types";
import { formatNumberFull } from "@/lib/utils/formatters";
import brazilMap from "@/components/charts/brazil-map-data.json";

const SMALL_LABELS = new Set(["DF", "SE", "AL", "PB", "RN", "ES", "RJ", "SC"]);

function fillFor(intensity: number, hasData: boolean) {
  if (!hasData) return "#d7e3ee";
  return `rgba(0, 184, 207, ${0.22 + intensity * 0.78})`;
}

export function BrazilHeatMap({ rows }: { rows: RegionalRow[] }) {
  const max = Math.max(...rows.map((r) => r.entrantes), 1);
  const byGeo = Object.fromEntries(rows.map((r) => [r.geo, r]));

  return (
    <div className="relative w-full bg-[#f4f7fb] rounded-2xl border border-[#dfe6ee] overflow-hidden px-3 pt-3 pb-8">
      <svg
        viewBox="0 0 1000 912"
        className="w-full h-auto"
        role="img"
        aria-label="Mapa de calor do Brasil por UF, segundo volume de entrantes"
      >
        <g stroke="#ffffff" strokeWidth="1.15" strokeLinejoin="round" strokeLinecap="round">
          {brazilMap.paths.map((path) => {
            const row = byGeo[path.id];
            const intensity = row ? row.entrantes / max : 0;
            const tooltip = row
              ? `${path.name}: ${formatNumberFull(row.entrantes)} entrantes`
              : `${path.name}: sem dado no recorte`;
            return (
              <path key={path.id} id={`BR${path.id}`} d={path.d} fill={fillFor(intensity, Boolean(row))}>
                <title>{tooltip}</title>
              </path>
            );
          })}
        </g>
        {brazilMap.labels.map((label) => {
          const fontSize = SMALL_LABELS.has(label.id) ? 13 : 18;
          return (
            <text
              key={label.id}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fontWeight={700}
              fill="#0b1f3a"
              stroke="#f4f7fb"
              strokeWidth={label.id === "DF" ? 3 : 4}
              paintOrder="stroke"
              style={{ pointerEvents: "none" }}
            >
              {label.id}
            </text>
          );
        })}
      </svg>
      <p className="absolute bottom-2 left-3 right-3 text-[10px] text-[#6c7685] font-semibold">
        Intensidade = KPI escolhido. UFs sem número no Excel Copart ficam claras. Mapa: Simplemaps.com.
      </p>
    </div>
  );
}
