"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Database, ShieldCheck, CheckCircle2, Layers, Clock, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataSourceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = isOpen ? (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="relative w-full max-w-2xl bg-white border border-[#dfe6ee] rounded-3xl shadow-2xl my-auto p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#dfe6ee] pb-4 sticky top-0 bg-white z-10 -mt-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00b8cf] to-[#0b1f3a] flex items-center justify-center text-white shadow-md shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#0b1f3a]">Arquitetura e Fonte dos Dados</h2>
              <p className="text-xs text-[#6c7685]">Copart Brasil — extrações manuais Meta, Google Ads, GA4 e Copart</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full text-[#6c7685] hover:bg-[#f4f7fb] hover:text-[#0b1f3a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Architecture Overview */}
        <div className="bg-gradient-to-br from-[#0b1f3a] to-[#153a73] rounded-2xl p-5 text-white space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#00b8cf] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Extrações em raw/ — não é BigQuery live
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00a85a]/20 text-[#00a85a] border border-[#00a85a]/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Carga ago–set/2026
            </span>
          </div>
          <p className="text-xs text-[#d9eaf5] leading-relaxed">
            Números de mídia e site vêm dos CSVs de Meta Ads, Google Ads e GA4 (1–31/08/2026). Entrantes e habilitados oficiais vêm de copart_resultados-mensais (set/2025 fechado e set/2026 parcial até 13/09). Licitantes, arrematantes, captados e vendidos não vieram nesta carga e aparecem como estimado ou zero. BigQuery continua o destino da integração.
          </p>
        </div>

        {/* Sources List */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-[#0b1f3a] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00b8cf]" />
            Fontes Integradas e Nível de Confiabilidade
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Source 1: Google Ads & Meta Ads */}
            <div className="p-4 rounded-2xl border border-[#dfe6ee] bg-[#f8fafc] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0b1f3a]">Google Ads & Meta Ads</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f8ef] text-[#007342]">✅ Alta Confiabilidade</span>
              </div>
              <p className="text-[11px] text-[#6c7685]">CSV de campanhas e anúncios Meta (Boleto, ago/2026) e de grupos/anúncios Google Ads (ago/2026). Overlay trimestral (google-ads_campanhas-trimestral, 15/06–15/09 vs 14/03–14/06) escala pelo overlap — não soma com o gasto de agosto.</p>
              <div className="flex items-center justify-between text-[10px] text-[#4a6080] font-semibold pt-1 border-t border-[#dfe6ee]">
                <span>Ago: 01–31/08 · Trimestre: 15/06–15/09</span>
                <span>Métricas: gasto, cliques, conversões</span>
              </div>
            </div>

            {/* Source 2: GA4 */}
            <div className="p-4 rounded-2xl border border-[#dfe6ee] bg-[#f8fafc] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0b1f3a]">Google Analytics 4 (GA4)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff4df] text-[#8c5700]">⚠️ Média (Auditado)</span>
              </div>
              <p className="text-[11px] text-[#6c7685]">Resumo GA4 ago/2026 (site inteiro) + ga4_eventos-midia-paga de eventos principais de mídia paga (15/06–15/09 vs 14/03–14/06). O filtro escala a extração paga pelo overlap — não soma com o Resumo de agosto.</p>
              <div className="flex items-center justify-between text-[10px] text-[#4a6080] font-semibold pt-1 border-t border-[#dfe6ee]">
                <span>Resumo: 01–31/08 · Pago: 15/06–15/09</span>
                <span>Sobreposição: 31 dias em agosto</span>
              </div>
            </div>

            {/* Source 3: RD Station */}
            <div className="p-4 rounded-2xl border border-[#dfe6ee] bg-[#f8fafc] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0b1f3a]">RD Station</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f8ef] text-[#007342]">✅ Alta Confiabilidade</span>
              </div>
              <p className="text-[11px] text-[#6c7685]">Nesta carga só há eventos GA4 (formulário, landing, popup). Extração nativa RD Station ainda não chegou.</p>
              <div className="flex items-center justify-between text-[10px] text-[#4a6080] font-semibold pt-1 border-t border-[#dfe6ee]">
                <span>Proxy: eventos GA4</span>
                <span>Blip: conversas Meta Whats</span>
              </div>
            </div>

            {/* Source 4: Copart ERP / Internal */}
            <div className="p-4 rounded-2xl border border-[#dfe6ee] bg-[#f8fafc] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0b1f3a]">Copart ERP (Planilhas Vitória)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f8ef] text-[#007342]">✅ Validado Diariamente</span>
              </div>
              <p className="text-[11px] text-[#6c7685]">Planilha mensal: set/2025 fechado (18.983 / 11.000) e set/2026 parcial até 13/09 (7.337 / 4.536 vs metas 19.000 / 11.000). Sem licitantes nem arrematantes.</p>
              <div className="flex items-center justify-between text-[10px] text-[#4a6080] font-semibold pt-1 border-t border-[#dfe6ee]">
                <span>Arquivo: copart_resultados-mensais_2025-09_2026-09.csv</span>
                <span>Oficial para funil de negócio</span>
              </div>
            </div>
          </div>
        </div>

        {/* ETL Sync Pipeline Timeline */}
        <div className="p-4 rounded-2xl bg-[#f4f7fb] border border-[#dfe6ee] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0b1f3a]">
            <Clock className="w-4 h-4 text-[#00b8cf]" />
            Horário da Ingestão Diária (ETL Pipeline):
          </div>
          <p className="text-[11px] text-[#6c7685] leading-relaxed">
            Carga atual: CSVs copiados para raw/. Sem ETL BigQuery nesta versão. Recorte de mídia e GA4 = agosto/2026; Copart ERP = setembro/2026 parcial.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#dfe6ee]">
          <span className="text-[11px] text-[#6c7685] font-medium flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#00b8cf]" /> Spec dashboard v2 — reunião Copart
          </span>
          <Button onClick={() => setIsOpen(false)} className="bg-[#0b1f3a] text-white hover:bg-[#153a73] rounded-xl text-xs px-6 py-2">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1f3a]/5 hover:bg-[#0b1f3a]/10 border border-[#dfe6ee] text-[#0b1f3a] text-xs font-bold transition-all group"
        title="Clique para visualizar a especificação e origem das fontes de dados"
      >
        <Database className="w-3.5 h-3.5 text-[#00b8cf] group-hover:scale-110 transition-transform" />
        <span>Fonte dos Dados</span>
        <span className="w-2 h-2 rounded-full bg-[#00a85a] animate-pulse ml-0.5" />
      </button>

      {/* Render via Portal directly to document.body */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
