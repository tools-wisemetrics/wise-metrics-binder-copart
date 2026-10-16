"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ATTRIBUTION_GLOSSARY } from "@/lib/constants";

export function AttributionGlossary() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-white border border-[#dfe6ee] rounded-3xl shadow-2xl my-auto p-6 sm:p-8 space-y-5 max-h-[85vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nomenclatura-title"
      >
        <div className="flex items-start justify-between border-b border-[#dfe6ee] pb-4 sticky top-0 bg-white z-10 -mt-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00b8cf] to-[#0b1f3a] flex items-center justify-center text-white shadow-md shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="nomenclatura-title" className="text-lg sm:text-xl font-black text-[#0b1f3a]">
                Nomenclatura
              </h2>
              <p className="text-xs text-[#6c7685]">Como ler as métricas desta tela de atribuição</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full text-[#6c7685] hover:bg-[#f4f7fb] hover:text-[#0b1f3a] transition-colors"
            aria-label="Fechar nomenclatura"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ATTRIBUTION_GLOSSARY.map((item) => (
            <div key={item.term} className="p-4 rounded-2xl border border-[#dfe6ee] bg-[#f8fafc] space-y-1.5">
              <p className="text-sm font-black text-[#0b1f3a]">{item.term}</p>
              <p className="text-xs text-[#344255] leading-relaxed">{item.definition}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#dfe6ee]">
          <span className="text-[11px] text-[#6c7685] font-medium flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#00b8cf]" />
            Contribuição por etapa nesta tela é rateio por spend
          </span>
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
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1f3a]/5 hover:bg-[#0b1f3a]/10 border border-[#dfe6ee] text-[#0b1f3a] text-xs font-bold transition-all group"
        title="Ver nomenclatura da atribuição"
      >
        <Info className="w-3.5 h-3.5 text-[#00b8cf] group-hover:scale-110 transition-transform" />
        <span>Nomenclatura</span>
      </button>
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
