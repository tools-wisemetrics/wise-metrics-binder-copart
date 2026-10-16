"use client";

import { Button } from "@/components/ui/button";

export function PrintReportButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="bg-[#0b1f3a] text-white hover:bg-[#153a73] rounded-xl"
    >
      Gerar PDF / imprimir
    </Button>
  );
}
