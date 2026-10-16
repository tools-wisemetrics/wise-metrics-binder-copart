import { Clock } from "lucide-react";

export function ComingSoonPanel({
  title,
  description,
  specIds,
}: {
  title: string;
  description: string;
  specIds: string[];
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#00b8cf]/40 bg-white p-8 sm:p-12 max-w-3xl">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef9ff] text-[#007a8c] text-[10px] font-black uppercase tracking-widest mb-4">
        <Clock className="w-3.5 h-3.5" />
        Em breve — fora da versão intermediária
      </div>
      <h2 className="text-2xl font-black text-[#0b1f3a] mb-3">{title}</h2>
      <p className="text-sm text-[#344255] leading-relaxed mb-4">{description}</p>
      <p className="text-xs font-semibold text-[#6c7685]">
        Direcionamentos: {specIds.join(", ")}. Não apresentar esta tela como pronta na demo (Gate E).
      </p>
    </div>
  );
}
