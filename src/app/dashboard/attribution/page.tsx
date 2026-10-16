import { redirect } from "next/navigation";
import { PageHeader, PageContent, SectionTitle } from "@/components/layout/page-header";
import { AttributionGlossary } from "@/components/cards/attribution-glossary";
import { dataService } from "@/lib/data/data-service";
import { filtersFromSearchParams } from "@/lib/page-filters";
import type { SearchParamRecord } from "@/lib/filters";
import { BUSINESS_UNIT_LABELS } from "@/lib/constants";
import { formatNumberFull } from "@/lib/utils/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "Rateio de mídia — Copart BI" };

/** Tela de mockup — oculta até existir jornada real. Trocar para true para reabrir. */
const ATTRIBUTION_PAGE_ENABLED = false;

export default async function AttributionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  if (!ATTRIBUTION_PAGE_ENABLED) redirect("/dashboard");
  const filters = await filtersFromSearchParams(searchParams);
  const [stageRows, modelRows] = await Promise.all([
    dataService.getFunnelStageAttribution(filters),
    dataService.getAttributionComparison(filters),
  ]);

  const stageKeys = Array.from(new Set(stageRows.flatMap((row) => Object.keys(row.stages))));

  return (
    <>
      <PageHeader
        title="Rateio de mídia"
        subtitle="Mockup — o funil é fatiado pelo spend da campanha. Sem API de touchpoints, sem first/last/linear."
        badge="Mockup"
        badgeColor="#c77a00"
        actions={<AttributionGlossary />}
      />
      <PageContent>
        <SectionTitle>
          Funil rateado por gasto da campanha
          <span className="ml-2 align-middle text-[10px] font-black uppercase tracking-widest text-[#c77a00]">Mockup</span>
        </SectionTitle>
        <div className="rounded-2xl border border-[#dfe6ee] overflow-x-auto mb-8">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f2f6fb] hover:bg-[#f2f6fb]">
                <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase">Campanha</TableHead>
                <TableHead className="text-[#0b1f3a] font-bold text-xs uppercase">Unidade</TableHead>
                {stageKeys.map((key) => (
                  <TableHead key={key} className="text-[#0b1f3a] font-bold text-xs uppercase text-right whitespace-nowrap">
                    {key}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {stageRows.map((row, i) => (
                <TableRow key={`${row.campaign_name}-${row.channel}-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]"}>
                  <TableCell className="font-mono text-xs font-semibold">{row.campaign_name}</TableCell>
                  <TableCell className="text-sm">{BUSINESS_UNIT_LABELS[row.unit]}</TableCell>
                  {stageKeys.map((key) => (
                    <TableCell key={key} className="text-right font-bold">
                      {row.stages[key] != null ? formatNumberFull(row.stages[key]) : "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <SectionTitle>Resultado nativo da campanha</SectionTitle>
        <p className="text-xs text-[#6c7685] -mt-2 mb-4">
          Um número por linha: cadastro do pixel, conversão Google ou conversa WhatsApp. First/last/linear não são medidos nesta carga — por isso não aparecem.
        </p>
        <div className="rounded-2xl border border-[#dfe6ee] overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f2f6fb] hover:bg-[#f2f6fb]">
                {["Campanha", "Resultado nativo"].map((h) => (
                  <TableHead key={h} className="text-[#0b1f3a] font-bold text-xs uppercase">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelRows.map((row, i) => (
                <TableRow key={`${row.campaign_name}-${row.unit}-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]"}>
                  <TableCell className="font-mono text-xs font-semibold">{row.campaign_name}</TableCell>
                  <TableCell>{formatNumberFull(row.first_touch)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </PageContent>
    </>
  );
}
