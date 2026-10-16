import type { ChannelPerformance } from "@/lib/data/types";
import { totalChannelPerformance } from "@/lib/aggregations";
import { formatBRL, formatNumberFull, formatPercentage } from "@/lib/utils/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  rows: ChannelPerformance[];
  volumeLabel?: string;
  convertedLabel?: string;
}

export function ChannelPerformanceTable({
  rows,
  volumeLabel = "Resultado",
  convertedLabel = "Avanço",
}: Props) {
  const ordered = [...rows].sort((a, b) => b.entrantes - a.entrantes);
  const total = totalChannelPerformance(ordered);
  const mixedSources = new Set(ordered.map((row) => row.volumeSource).filter(Boolean)).size > 1;

  return (
    <div className="rounded-2xl border border-[#dfe6ee] overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#f2f6fb] hover:bg-[#f2f6fb]">
            {["Canal", volumeLabel, "% do total", convertedLabel, "Taxa", `Custo/${volumeLabel}`, "Gasto"].map((h) => (
              <TableHead key={h} className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide whitespace-nowrap">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordered.map((row, i) => (
            <TableRow key={`${row.channel}-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]"}>
              <TableCell className="font-bold text-[#0b1f3a]">{row.channel}</TableCell>
              <TableCell>
                <span className="font-semibold">{formatNumberFull(row.entrantes)}</span>
                {row.volumeSource ? (
                  <p className="text-[10px] text-[#6c7685] font-medium mt-0.5">{row.volumeSource}</p>
                ) : null}
              </TableCell>
              <TableCell className="font-semibold">
                {total.entrantes === 0 ? "—" : formatPercentage((row.entrantes / total.entrantes) * 100)}
              </TableCell>
              <TableCell className="font-semibold">
                {row.habilitados > 0 ? formatNumberFull(row.habilitados) : "—"}
                {row.convertedSource ? (
                  <p className="text-[10px] text-[#6c7685] font-medium mt-0.5">{row.convertedSource}</p>
                ) : null}
              </TableCell>
              <TableCell>
                {row.habilitados > 0 ? (
                  <span className={`font-black text-sm ${row.taxa_habilitacao >= 50 ? "text-[#007342]" : "text-[#b2162e]"}`}>
                    {formatPercentage(row.taxa_habilitacao)}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{row.custo_por_entrante > 0 ? formatBRL(row.custo_por_entrante) : "—"}</TableCell>
              <TableCell className="font-semibold">{row.gasto > 0 ? formatBRL(row.gasto) : "—"}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-[#f2f6fb] font-black">
            <TableCell className="font-black text-[#0b1f3a]">
              {mixedSources ? "Soma (fontes mistas)" : total.channel}
              {mixedSources ? (
                <p className="text-[10px] font-medium text-[#6c7685] normal-case tracking-normal">Não é Entrante Copart</p>
              ) : null}
            </TableCell>
            <TableCell className="font-black">{formatNumberFull(total.entrantes)}</TableCell>
            <TableCell className="font-black">100%</TableCell>
            <TableCell className="font-black">{total.habilitados > 0 ? formatNumberFull(total.habilitados) : "—"}</TableCell>
            <TableCell className="font-black text-[#00b8cf]">
              {total.habilitados > 0 ? formatPercentage(total.taxa_habilitacao) : "—"}
            </TableCell>
            <TableCell className="font-black">{total.custo_por_entrante > 0 ? formatBRL(total.custo_por_entrante) : "—"}</TableCell>
            <TableCell className="font-black">{total.gasto > 0 ? formatBRL(total.gasto) : "—"}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
