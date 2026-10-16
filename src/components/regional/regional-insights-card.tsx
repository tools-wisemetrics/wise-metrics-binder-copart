"use client";

import React from "react";
import { CardWrapper } from "@/components/layout/page-header";
import { Lightbulb, TrendingUp, AlertCircle, Award } from "lucide-react";

export function RegionalInsightsCard() {
  return (
    <CardWrapper title="Diagnóstico Estratégico & Oportunidades Regionais">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sudeste */}
        <div className="rounded-xl border border-[#dfe6ee] bg-[#f4f7fb] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#00b8cf]" />
            <span className="text-xs font-black uppercase text-[#0b1f3a]">
              Hub Sudeste (SP / RJ / MG)
            </span>
          </div>
          <p className="text-xs text-[#344255] font-medium leading-relaxed">
            São Paulo concentra <strong>37.7% dos entrantes nacionais</strong>. A região Sudeste é o principal motor de volume de habilitação e arremate, apresentando a melhor eficiência de CPA e CPH.
          </p>
        </div>

        {/* Centro-Oeste / Goiânia */}
        <div className="rounded-xl border border-[#dfe6ee] bg-[#f4f7fb] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00a85a]" />
            <span className="text-xs font-black uppercase text-[#0b1f3a]">
              Polo Goiânia / Centro-Oeste
            </span>
          </div>
          <p className="text-xs text-[#344255] font-medium leading-relaxed">
            Campanhas regionais dedicadas (<em>LEILÃO GOIÂNIA</em>) geraram tração direta em Goiás, garantindo taxa de habilitação superior a <strong>61.5%</strong>.
          </p>
        </div>

        {/* Sul */}
        <div className="rounded-xl border border-[#dfe6ee] bg-[#f4f7fb] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-xs font-black uppercase text-[#0b1f3a]">
              Oportunidade Per Capita (Sul)
            </span>
          </div>
          <p className="text-xs text-[#344255] font-medium leading-relaxed">
            Santa Catarina e Paraná apresentam elevado engajamento per capita por 100k habitantes. Recomenda-se escalar verba para capturar demanda regional reprimida.
          </p>
        </div>

        {/* Nordeste & Norte */}
        <div className="rounded-xl border border-[#dfe6ee] bg-[#f4f7fb] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#8c5be8]" />
            <span className="text-xs font-black uppercase text-[#0b1f3a]">
              Nordeste & Norte (Expansão)
            </span>
          </div>
          <p className="text-xs text-[#344255] font-medium leading-relaxed">
            Bahia e Pernambuco lideram a conversão do Nordeste. Ativar anúncios geolocalizados para os pátios regionais pode acelerar o funil local.
          </p>
        </div>
      </div>
    </CardWrapper>
  );
}
