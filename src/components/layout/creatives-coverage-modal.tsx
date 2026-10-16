"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ITEMS = [
  {
    title: "Meta Ads",
    body: "Nome, conjunto, gasto, impressões, alcance, cadastro, landing e conversas. Sem URL da peça e sem Feed, Stories ou Reels. Esta carga é só Leilão (Binder AD1–AD5 e Goiânia). Select WhatsApp não veio no arquivo de ads.",
  },
  {
    title: "Google Ads",
    body: "Títulos, descrições, URL final, qualidade e taxa de interação. Alguns anúncios de Display/demanda têm ID de imagem no CSV — sem o arquivo e sem URL para preview. Captura via API (D28) continua pendente.",
  },
  {
    title: "Totais da conta",
    body: "Linhas Google sem campanha ou tipo de anúncio foram descartadas. São totais da conta, não peças.",
  },
];

export function CreativesCoverageModal() {
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
        className="relative w-full max-w-lg bg-white border border-[#dfe6ee] rounded-3xl shadow-2xl my-auto p-6 sm:p-8 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#dfe6ee] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00b8cf] to-[#0b1f3a] flex items-center justify-center text-white shadow-md shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0b1f3a]">O que esta carga mostra</h2>
              <p className="text-xs text-[#6c7685]">Exportações de anúncio — ago/2026 · não é inventário de peças</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full text-[#6c7685] hover:bg-[#f4f7fb] hover:text-[#0b1f3a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ul className="space-y-3">
          {ITEMS.map((item) => (
            <li key={item.title} className="p-4 rounded-2xl border border-[#dfe6ee] bg-[#f8fafc]">
              <p className="text-xs font-black text-[#0b1f3a] mb-1">{item.title}</p>
              <p className="text-[12px] text-[#344255] leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="flex justify-end pt-1">
          <Button
            onClick={() => setIsOpen(false)}
            className="bg-[#0b1f3a] text-white hover:bg-[#153a73] rounded-xl text-xs px-6 py-2"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1f3a]/5 hover:bg-[#0b1f3a]/10 border border-[#dfe6ee] text-[#0b1f3a] text-xs font-bold transition-all"
        title="O que esta carga de criativos cobre"
      >
        <Info className="w-3.5 h-3.5 text-[#00b8cf]" />
        <span>O que esta carga mostra</span>
      </button>
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
