import { PageHeader, PageContent, SectionTitle, CardWrapper } from "@/components/layout/page-header";
import { ChannelGoalCard } from "@/components/cards/channel-goal-card";
import { GoalCard } from "@/components/cards/goal-card";
import { dataService } from "@/lib/data/data-service";
import { filtersFromSearchParams } from "@/lib/page-filters";
import type { SearchParamRecord } from "@/lib/filters";
import { BUSINESS_UNIT_LABELS } from "@/lib/constants";
import { formatBRL, formatNumberFull, formatPercentage } from "@/lib/utils/formatters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { BusinessUnit, MediaEfficiencyRow } from "@/lib/data/types";
import { InfoTip } from "@/components/layout/info-tip";

export const metadata = { title: "Metas por Canal — Copart BI Dashboard" };

function EfficiencyBlock({ unit, rows }: { unit: BusinessUnit; rows: MediaEfficiencyRow[] }) {
  const sorted = [...rows].sort((a, b) => {
    if (a.cpa === 0) return 1;
    if (b.cpa === 0) return -1;
    return a.cpa - b.cpa;
  });
  return (
    <CardWrapper title={BUSINESS_UNIT_LABELS[unit]} subtitle="Spend e resultado nativo da mesma unidade">
      <div className="rounded-xl border border-[#dfe6ee] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f2f6fb] hover:bg-[#f2f6fb]">
              {["Canal", "Gasto", "Resultado nativo", "CPA", "% do spend da unidade"].map((head) => (
                <TableHead key={head} className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row, i) => (
              <TableRow key={`${row.unit}-${row.channel}`} className={i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]"}>
                <TableCell className="font-bold text-[#0b1f3a]">
                  {row.channelLabel}
                  <p className="text-[10px] text-[#6c7685] font-medium">{row.resultLabel}</p>
                </TableCell>
                <TableCell className="font-semibold">{formatBRL(row.spend)}</TableCell>
                <TableCell>{formatNumberFull(row.nativeResults)}</TableCell>
                <TableCell className="font-black">{row.cpa > 0 ? formatBRL(row.cpa) : "—"}</TableCell>
                <TableCell>{formatPercentage(row.volumeShare)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardWrapper>
  );
}

export default async function ChannelGoalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const [{ channels, overall }, volume, efficiency] = await Promise.all([
    dataService.getChannelGoals(filters),
    dataService.getVolumeRanking(filters),
    dataService.getMediaEfficiency(filters),
  ]);
  const withData = channels.filter((c) => c.hasData !== false).sort((a, b) => b.metrics.entrantes.current - a.metrics.entrantes.current);
  const withoutData = channels.filter((c) => c.hasData === false);
  const efficiencyByUnit = (["leilao_compra", "select_venda", "select_compra"] as const)
    .map((unit) => ({ unit, rows: efficiency.filter((row) => row.unit === unit) }))
    .filter((block) => block.rows.length > 0);

  return (
    <>
      <PageHeader
        title="Metas por Canal"
        subtitle="Ranking de volume (cadastro_site × first-touch) e CPA da mídia paga — RD Station e Blip separados"
        badge="Executivo"
        badgeColor="#153a73"
      />
      <PageContent>
        <SectionTitle>Progresso geral da unidade</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <GoalCard
            title={overall.entrantesTitle ?? "Entrantes Copart"}
            current={overall.entrantes.current}
            target={overall.entrantes.target}
            percentage={overall.entrantes.percentage}
            color="#153a73"
          />
          <GoalCard
            title={overall.habilitadosTitle ?? "Habilitados Copart"}
            current={overall.habilitados.current}
            target={overall.habilitados.target}
            percentage={overall.habilitados.percentage}
            color="#00b8cf"
          />
        </div>

        <SectionTitle>
          Ranking 1 — volume de cadastro alocado
          <InfoTip text="Rateio de cadastro_site pelo first-touch GA4. Não é meta oficial Copart por canal. Pixel Meta e conversões Google não entram nesta tabela." />
        </SectionTitle>
        <CardWrapper className="mb-8">
          <div className="rounded-xl border border-[#dfe6ee] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f2f6fb] hover:bg-[#f2f6fb]">
                  {["#", "Canal", "Cadastros alocados", "% do cadastro_site", "Contribuição à meta 20 mil"].map((head) => (
                    <TableHead key={head} className="text-[#0b1f3a] font-bold text-xs uppercase tracking-wide">
                      {head}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {volume.map((row, i) => (
                  <TableRow key={row.channelId} className={cn(i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]")}>
                    <TableCell className="font-black text-[#6c7685]">{i + 1}</TableCell>
                    <TableCell className="font-bold text-[#0b1f3a]">{row.channel}</TableCell>
                    <TableCell className="font-semibold">{formatNumberFull(row.entrantes)}</TableCell>
                    <TableCell>{formatPercentage(row.shareOfCadastro)}</TableCell>
                    <TableCell>{formatPercentage(row.contributionToGoal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardWrapper>

        <SectionTitle>Ranking 2 — eficiência da mídia paga</SectionTitle>
        <p className="text-xs text-[#6c7685] -mt-2 mb-4">
          CPA = gasto da unidade ÷ resultado nativo (cadastro pixel Meta ou conversões Google). Leilão e Select não compartilham doughnut nem total.
        </p>
        <div className="grid grid-cols-1 gap-4 mb-8">
          {efficiencyByUnit.map((block) => (
            <EfficiencyBlock key={block.unit} unit={block.unit} rows={block.rows} />
          ))}
        </div>

        <SectionTitle>
          Como cada canal contribui para a meta da unidade
          <InfoTip text="A Copart não tem meta oficial por canal. Cada card usa o resultado nativo da fonte (pixel, conversão Google, first-touch, WhatsApp, RD) como fatia da meta da unidade — não é alvo do canal." />
        </SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...withData, ...withoutData].map((goal) => (
            <ChannelGoalCard key={goal.channel} goal={goal} />
          ))}
        </div>
      </PageContent>
    </>
  );
}
