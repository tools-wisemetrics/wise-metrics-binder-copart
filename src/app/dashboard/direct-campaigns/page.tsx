import { PageHeader, PageContent, SectionTitle, CardWrapper } from "@/components/layout/page-header";
import { CampaignTable } from "@/components/tables/campaign-table";
import { GoogleQuarterly } from "@/components/cards/google-quarterly";
import { dataService } from "@/lib/data/data-service";
import { COLORS } from "@/lib/constants";
import { filtersFromSearchParams } from "@/lib/page-filters";
import type { SearchParamRecord } from "@/lib/filters";
import { formatBRL, formatNumberFull } from "@/lib/utils/formatters";

export const metadata = { title: "Campanhas Copart Select — Copart BI" };

export default async function SelectCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamRecord>;
}) {
  const filters = await filtersFromSearchParams(searchParams);
  const [venda, compra, googleQuarterly] = await Promise.all([
    dataService.getCampaignScorecards({ ...filters, campaignType: "select_venda" }),
    dataService.getCampaignScorecards({ ...filters, campaignType: "select_compra" }),
    dataService.getGoogleQuarterly(filters),
  ]);
  const selectCampaigns = [...venda, ...compra];
  const spend = selectCampaigns.reduce((s, r) => s + r.spend, 0);
  const conversas = selectCampaigns.reduce((s, r) => s + (r.conversas ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Campanhas Select"
        subtitle="Select/Venda e Select/Compra — investimento isolado do Leilão/Compra"
        badge="Operacional Select"
        badgeColor="#00a85a"
      />
      <PageContent>
        <GoogleQuarterly report={googleQuarterly} units={["select_venda", "select_compra", "select_mix"]} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest font-bold text-[#6c7685] mb-2">Conversas Select/Venda</p>
            <p className="text-2xl font-black" style={{ color: COLORS.green }}>{formatNumberFull(conversas)}</p>
          </div>
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest font-bold text-[#6c7685] mb-2">Campanhas Select</p>
            <p className="text-2xl font-black" style={{ color: COLORS.teal }}>{selectCampaigns.length}</p>
          </div>
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest font-bold text-[#6c7685] mb-2">Gasto mídia Select</p>
            <p className="text-2xl font-black" style={{ color: COLORS.navy }}>{formatBRL(spend)}</p>
          </div>
          <div className="bg-white border border-[#dfe6ee] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest font-bold text-[#6c7685] mb-2">Owner de mídia</p>
            <p className="text-2xl font-black" style={{ color: COLORS.blue }}>Felipe</p>
          </div>
        </div>
        <SectionTitle>Tabela de campanhas — Copart Select</SectionTitle>
        <div className="mb-8 overflow-x-auto">
          <CampaignTable data={selectCampaigns} showConversas />
        </div>
        <SectionTitle>Conversas no mês</SectionTitle>
        <CardWrapper>
          <p className="text-sm text-[#344255]">
            Meta Ads trouxe {formatNumberFull(conversas)} conversas no consolidado de agosto. Esta carga não tem série diária de conversas — o gráfico diário foi omitido para não inventar uma reta.
          </p>
        </CardWrapper>
      </PageContent>
    </>
  );
}
