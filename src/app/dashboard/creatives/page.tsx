import { PageHeader, PageContent, SectionTitle, CardWrapper } from "@/components/layout/page-header";
import { CreativesCoverageModal } from "@/components/layout/creatives-coverage-modal";
import { dataService } from "@/lib/data/data-service";
import { BUSINESS_UNIT_LABELS } from "@/lib/constants";
import { filtersFromSearchParams } from "@/lib/page-filters";
import { formatDateRangeLabel } from "@/lib/filters";
import type { SearchParamRecord } from "@/lib/filters";
import type { CreativePiece } from "@/lib/data/types";
import { formatBRL, formatNumberFull } from "@/lib/utils/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = { title: "Criativos — Copart BI" };

function dash(value: number, formatted?: string): string {
  if (!value) return "—";
  return formatted ?? formatNumberFull(value);
}

function deliveryLabel(value: string): string {
  if (value === "active") return "Ativo";
  return value || "—";
}

function MetaTable({ rows }: { rows: CreativePiece[] }) {
  return (
    <div className="rounded-2xl border border-[#dfe6ee] overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#f2f6fb] hover:bg-[#f2f6fb]">
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Anúncio</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Conjunto</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Unidade</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Entrega</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Gasto</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Impressões</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Alcance</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Cadastro</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Landing</TableHead>
            <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide text-right">Conversas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow
              key={row.id}
              className={cn("transition-colors hover:bg-[#f8fbff]", i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]")}
            >
              <TableCell className="font-semibold text-xs text-[#0b1f3a] max-w-[240px]" title={row.name}>
                <span className="line-clamp-2">{row.name}</span>
                <p className="text-[10px] text-[#6c7685] font-medium mt-0.5 truncate">{row.campaign}</p>
              </TableCell>
              <TableCell className="text-xs text-[#344255]">{row.adGroup || "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {BUSINESS_UNIT_LABELS[row.unit]}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-[#344255]">{deliveryLabel(row.delivery)}</TableCell>
              <TableCell className="text-right text-sm font-semibold text-[#0b1f3a]">{formatBRL(row.spend)}</TableCell>
              <TableCell className="text-right text-sm text-[#344255]">{dash(row.impressions)}</TableCell>
              <TableCell className="text-right text-sm text-[#344255]">{dash(row.reach)}</TableCell>
              <TableCell className="text-right text-sm font-bold text-[#0b1f3a]">{dash(row.resultsCadastro)}</TableCell>
              <TableCell className="text-right text-sm text-[#344255]">{dash(row.resultsLanding)}</TableCell>
              <TableCell className="text-right text-sm text-[#344255]">{dash(row.conversas)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function GoogleCard({ row }: { row: CreativePiece }) {
  const hints = (row.qualityHint ?? "").split(";").map((part) => part.trim()).filter(Boolean);
  return (
    <CardWrapper>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-[#0b1f3a]">{row.name}</p>
          <p className="text-[11px] text-[#6c7685] mt-0.5">
            {row.campaign} · {row.adGroup || "sem grupo"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px] font-bold">{row.format}</Badge>
          <Badge variant="outline" className="text-[10px] font-bold">{BUSINESS_UNIT_LABELS[row.unit]}</Badge>
          {row.quality && (
            <Badge variant="outline" className="text-[10px] font-bold text-[#007342] border-[#00a85a] bg-[#e8f8ef]">
              {row.quality}
            </Badge>
          )}
        </div>
      </div>
      {row.headlines.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {row.headlines.map((headline, index) => (
            <span key={`${row.id}-h-${index}`} className="text-[11px] font-semibold text-[#0b1f3a] bg-[#f4f7fb] border border-[#dfe6ee] rounded-lg px-2 py-1">
              {headline}
            </span>
          ))}
        </div>
      )}
      {row.descriptions.length > 0 && (
        <ul className="space-y-1 mb-3">
          {row.descriptions.map((description, index) => (
            <li key={`${row.id}-d-${index}`} className="text-xs text-[#344255] leading-relaxed">
              {description}
            </li>
          ))}
        </ul>
      )}
      {row.finalUrl && (
        <a
          href={row.finalUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-semibold text-[#00b8cf] break-all hover:underline"
        >
          {row.finalUrl}
        </a>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-3 border-t border-[#dfe6ee]">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Gasto</p>
          <p className="text-sm font-black text-[#0b1f3a]">{formatBRL(row.spend)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Impressões</p>
          <p className="text-sm font-black text-[#0b1f3a]">{dash(row.impressions)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Interações</p>
          <p className="text-sm font-black text-[#0b1f3a]">{dash(row.clicks)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Taxa de interação</p>
          <p className="text-sm font-black text-[#0b1f3a]">{row.ctr ? `${row.ctr.toFixed(1).replace(".", ",")}%` : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">Conversões (Google)</p>
          <p className="text-sm font-black text-[#0b1f3a]">{dash(row.conversions, row.conversions.toLocaleString("pt-BR", { maximumFractionDigits: 2 }))}</p>
        </div>
      </div>
      {hints.length > 0 && (
        <p className="text-[11px] text-[#8c5700] mt-3">Melhorias sugeridas: {hints.join(" · ")}</p>
      )}
      {row.hasImageIds && (
        <p className="text-[11px] text-[#6c7685] mt-2">O CSV traz ID de imagem, sem o arquivo da peça.</p>
      )}
    </CardWrapper>
  );
}

export default async function CreativesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const creatives = await dataService.getCreatives(filters);
  const period = formatDateRangeLabel(filters.dateRange.start, filters.dateRange.end);
  const meta = creatives.filter((row) => row.source === "meta");
  const google = creatives.filter((row) => row.source === "google");
  const googleSpenders = google.filter((row) => row.spend > 0);
  const googleIdle = google.filter((row) => row.spend <= 0);
  const spend = creatives.reduce((sum, row) => sum + row.spend, 0);
  const cadastro = meta.reduce((sum, row) => sum + row.resultsCadastro, 0);

  return (
    <>
      <PageHeader
        title="Criativos"
        subtitle={`Anúncios exportados — ${period}`}
        badge="Operacional"
        badgeColor="#00a85a"
        actions={<CreativesCoverageModal />}
      />
      <PageContent>
        <SectionTitle>Resumo do recorte</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Gasto nos anúncios", value: formatBRL(spend) },
            { label: "Peças Meta", value: formatNumberFull(meta.length) },
            { label: "Google com investimento", value: formatNumberFull(googleSpenders.length) },
            { label: "Cadastros (indicador Meta)", value: dash(cadastro) },
          ].map((kpi) => (
            <CardWrapper key={kpi.label}>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#6c7685]">{kpi.label}</p>
              <p className="text-2xl font-black text-[#0b1f3a] mt-1">{kpi.value}</p>
            </CardWrapper>
          ))}
        </div>

        {creatives.length === 0 && (
          <CardWrapper title="Nenhuma peça neste filtro">
            <p className="text-sm text-[#6c7685]">Ajuste unidade, funil ou canal. TikTok e canais sem CSV de anúncio ficam vazios de propósito.</p>
          </CardWrapper>
        )}

        {meta.length > 0 && (
          <>
            <SectionTitle>Meta Ads — performance por anúncio</SectionTitle>
            <p className="text-xs text-[#6c7685] -mt-2 mb-4">
              Linhas duplicadas no CSV (cadastro vs landing) foram unidas por nome + conjunto, usando o maior gasto/impressão.
            </p>
            <div className="mb-8">
              <MetaTable rows={meta} />
            </div>
          </>
        )}

        {googleSpenders.length > 0 && (
          <>
            <SectionTitle>Google Ads — peças com gasto</SectionTitle>
            <p className="text-xs text-[#6c7685] -mt-2 mb-4">
              Conversões são as do Google Ads, não cadastro Copart. Taxa de interação vem do CSV, não é CTR de clique clássico.
            </p>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {googleSpenders.map((row) => (
                <GoogleCard key={row.id} row={row} />
              ))}
            </div>
          </>
        )}

        {googleIdle.length > 0 && (
          <>
            <SectionTitle>Google Ads — sem gasto no período</SectionTitle>
            <CardWrapper>
              <div className="rounded-xl border border-[#dfe6ee] overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f2f6fb] hover:bg-[#f2f6fb]">
                      <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Anúncio</TableHead>
                      <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Campanha</TableHead>
                      <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Grupo</TableHead>
                      <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Formato</TableHead>
                      <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Qualidade</TableHead>
                      <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">Unidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {googleIdle.map((row, i) => (
                      <TableRow
                        key={row.id}
                        className={cn("hover:bg-[#f8fbff]", i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]")}
                      >
                        <TableCell className="text-xs font-semibold text-[#0b1f3a] max-w-[220px]">
                          <span className="line-clamp-2">{row.name}</span>
                        </TableCell>
                        <TableCell className="text-xs text-[#344255] max-w-[240px] truncate" title={row.campaign}>
                          {row.campaign}
                        </TableCell>
                        <TableCell className="text-xs text-[#344255]">{row.adGroup || "—"}</TableCell>
                        <TableCell className="text-xs text-[#344255]">{row.format}</TableCell>
                        <TableCell className="text-xs text-[#344255]">{row.quality || "—"}</TableCell>
                        <TableCell className="text-xs text-[#344255]">{BUSINESS_UNIT_LABELS[row.unit]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardWrapper>
          </>
        )}
      </PageContent>
    </>
  );
}
