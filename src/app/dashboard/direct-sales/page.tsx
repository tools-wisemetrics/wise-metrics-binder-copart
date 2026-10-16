import { PageHeader, PageContent, SectionTitle, CardWrapper } from "@/components/layout/page-header";
import { FunnelChart, EstimatedStagesNote } from "@/components/charts/funnel-chart";
import { SelectTwoPathFunnel } from "@/components/charts/select-two-path";
import { ChannelPerformanceTable } from "@/components/tables/channel-performance-table";
import { PaidMediaEvents } from "@/components/cards/paid-media-events";
import { GoogleQuarterly } from "@/components/cards/google-quarterly";
import { dataService } from "@/lib/data/data-service";
import { COLORS } from "@/lib/constants";
import { filtersFromSearchParams } from "@/lib/page-filters";
import type { SearchParamRecord } from "@/lib/filters";
import { formatNumberFull } from "@/lib/utils/formatters";
import { Car, ShoppingBag } from "lucide-react";
import { InfoTip } from "@/components/layout/info-tip";

export const metadata = { title: "Copart Select — BI Dashboard" };

export default async function CopartSelectPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const [funnelVender, funnelComprar, perfVender, perfComprar, paidEvents, googleQuarterly] = await Promise.all([
    dataService.getFunnelData("select_venda", filters),
    dataService.getFunnelData("select_compra", filters),
    dataService.getChannelPerformance("select_venda", { ...filters, campaignType: "select_venda" }),
    dataService.getChannelPerformance("select_compra", { ...filters, campaignType: "select_compra" }),
    dataService.getPaidMediaEvents(filters),
    dataService.getGoogleQuarterly(filters),
  ]);

  const captados = funnelVender.estimatedStages?.at(-1)?.value ?? 0;
  const vendidos = funnelComprar.stages.at(-1)?.value ?? 0;
  const showVenda = filters.campaignType !== "select_compra";
  const showCompra = filters.campaignType !== "select_venda";

  return (
    <>
      <PageHeader
        title="Copart Select"
        subtitle="Venda e Compra não se somam — investimentos e resultados independentes"
        badge="Executivo Select"
        badgeColor="#00a85a"
        actions={<InfoTip text="Contato qualificado = veículo no perfil Select (RD Station ou Blip). Critério provisório até alinhamento Copart." />}
      />
      <PageContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#6c7685]">Veículos Captados</span>
              <Car className="w-4 h-4 text-[#00a85a]" />
            </div>
            <p className="text-3xl font-black text-[#0b1f3a]">{formatNumberFull(captados)}</p>
            <p className="text-xs text-[#6c7685] mt-1">Funil Select/Venda — estimado</p>
          </div>
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#6c7685]">Veículos Vendidos</span>
              <ShoppingBag className="w-4 h-4 text-[#00b8cf]" />
            </div>
            <p className="text-3xl font-black text-[#0b1f3a]">{formatNumberFull(vendidos)}</p>
            <p className="text-xs text-[#6c7685] mt-1">Excel Copart Select</p>
          </div>
        </div>

        <PaidMediaEvents
          report={paidEvents}
          featured={["lead_vmc", "form_submit"]}
          channelEvents={["lead_vmc"]}
          showSiteWideUsers={false}
        />
        <GoogleQuarterly report={googleQuarterly} units={["select_venda", "select_compra", "select_mix"]} />

        {showVenda && (
          <div className="mb-8">
            <SectionTitle>Select/Venda</SectionTitle>
            <CardWrapper>
              {funnelVender.sitePath && funnelVender.whatsappPath && funnelVender.joinStages ? (
                <SelectTwoPathFunnel
                  sitePath={funnelVender.sitePath}
                  whatsappPath={funnelVender.whatsappPath}
                  joinStages={funnelVender.joinStages}
                  estimatedStages={funnelVender.estimatedStages}
                />
              ) : (
                <>
                  <FunnelChart stages={funnelVender.stages} primaryColor={COLORS.green} />
                  <EstimatedStagesNote stages={funnelVender.estimatedStages ?? []} />
                </>
              )}
            </CardWrapper>
          </div>
        )}

        {showCompra && (
          <div className="mb-8">
            <SectionTitle>Select/Compra</SectionTitle>
            <CardWrapper subtitle="Impressões de mídia não são estoque físico">
              <FunnelChart stages={funnelComprar.stages} primaryColor={COLORS.teal} />
            </CardWrapper>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {showVenda && (
            <div>
              <SectionTitle>Canais — Select/Venda</SectionTitle>
              <ChannelPerformanceTable rows={perfVender} volumeLabel="Resultado da conta" convertedLabel="Avanço da conta" />
            </div>
          )}
          {showCompra && (
            <div>
              <SectionTitle>Canais — Select/Compra</SectionTitle>
              <ChannelPerformanceTable rows={perfComprar} volumeLabel="Resultado da conta" convertedLabel="Avanço da conta" />
            </div>
          )}
        </div>
      </PageContent>
    </>
  );
}
