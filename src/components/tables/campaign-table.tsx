import { cn } from "@/lib/utils";
import type { CampaignScorecard } from "@/lib/data/types";
import { CHANNEL_LABELS } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  on_target: { label: "Na meta", icon: "ok", variant: "outline" as const, className: "text-[#007342] border-[#00a85a] bg-[#e8f8ef]" },
  below_target: { label: "Abaixo da meta", icon: "aviso", variant: "outline" as const, className: "text-[#8c5700] border-[#c77a00] bg-[#fff4df]" },
  critical: { label: "Crítico", icon: "crit", variant: "outline" as const, className: "text-[#b2162e] border-[#cf3044] bg-[#fdecee]" },
};

interface CampaignTableProps {
  data: CampaignScorecard[];
  showConversas?: boolean;
}

export function CampaignTable({ data, showConversas = false }: CampaignTableProps) {
  return (
    <div className="rounded-2xl border border-[#dfe6ee] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#f2f6fb] hover:bg-[#f2f6fb]">
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Campanha</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Canal</TableHead>
            {!showConversas && (
              <>
                <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Impressões</TableHead>
                <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">CTR</TableHead>
              </>
            )}
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Resultado da conta</TableHead>
            {showConversas ? (
              <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Conversas WhatsApp</TableHead>
            ) : (
              <>
                <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Hab. estimado</TableHead>
                <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Taxa est.</TableHead>
              </>
            )}
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Gasto (R$)</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Custo/resultado</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => {
            const status = STATUS_CONFIG[row.status];
            const isEven = i % 2 === 0;
            return (
              <TableRow
                key={`${row.channel}-${row.campaign_name}-${i}`}
                className={cn(
                  "transition-colors hover:bg-[#f8fbff]",
                  isEven ? "bg-white" : "bg-[#fafbfd]"
                )}
              >
                <TableCell className="font-mono text-xs font-semibold text-[#0b1f3a] max-w-[200px] truncate" title={row.campaign_name}>
                  {row.campaign_name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {CHANNEL_LABELS[row.channel] || row.channel}
                  </Badge>
                </TableCell>
                {!showConversas && (
                  <>
                    <TableCell className="text-right text-sm text-[#344255]">
                      {row.impressions ? row.impressions.toLocaleString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm text-[#344255]">
                      {row.ctr ? `${row.ctr.toFixed(1)}%` : "—"}
                    </TableCell>
                  </>
                )}
                <TableCell className="text-right font-bold text-sm text-[#0b1f3a]">
                  {(row.nativeResults ?? row.entrantes).toLocaleString("pt-BR")}
                  {row.resultLabel ? (
                    <p className="text-[10px] font-medium text-[#6c7685]">{row.resultLabel}</p>
                  ) : null}
                </TableCell>
                {showConversas ? (
                  <TableCell className="text-right font-bold text-sm text-[#0b1f3a]">
                    {row.conversas ? row.conversas.toLocaleString("pt-BR") : "—"}
                  </TableCell>
                ) : (
                  <>
                    <TableCell className="text-right font-bold text-sm text-[#0b1f3a]">
                      {row.habilitados ? row.habilitados.toLocaleString("pt-BR") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.taxa_habilitacao ? (
                        <span className={cn(
                          "font-black text-sm",
                          row.taxa_habilitacao >= 50 ? "text-[#007342]" : "text-[#b2162e]"
                        )}>
                          {row.taxa_habilitacao.toFixed(1)}%
                        </span>
                      ) : "—"}
                    </TableCell>
                  </>
                )}
                <TableCell className="text-right text-sm text-[#344255] font-semibold">
                  {row.spend > 0 ? `R$ ${row.spend.toLocaleString("pt-BR")}` : "—"}
                </TableCell>
                <TableCell className="text-right text-sm text-[#344255]">
                  {row.custo_por_entrante > 0 ? `R$ ${row.custo_por_entrante.toFixed(2).replace(".", ",")}` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-[10px] font-bold", status.className)}>
                    {status.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
