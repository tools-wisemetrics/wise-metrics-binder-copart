import { PageHeader, PageContent, SectionTitle, CardWrapper } from "@/components/layout/page-header";
import { AlertCard } from "@/components/cards/alert-card";
import { dataService } from "@/lib/data/data-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AlertThresholdControls } from "@/components/alerts/threshold-controls";

export const metadata = { title: "Alertas e Anomalias — Copart BI" };

export default async function AlertsPage() {
  const [alerts, discrepancies, thresholds] = await Promise.all([
    dataService.getAlerts(),
    dataService.getDataDiscrepancies(),
    dataService.getAlertThresholds(),
  ]);

  return (
    <>
      <PageHeader
        title="Alertas e Anomalias"
        subtitle="Itens de mídia atribuídos a Felipe · limites configuráveis (D31)"
        badge="Operacional"
        badgeColor="#00a85a"
      />
      <PageContent>
        <SectionTitle>Limites de variação</SectionTitle>
        <AlertThresholdControls thresholds={thresholds} />

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="bg-[#fdecee] border border-[#cf3044]/30 rounded-full px-4 py-2">
            <span className="text-sm font-black text-[#b2162e]">{alerts.filter((a) => a.severity === "critical").length} Críticos</span>
          </div>
          <div className="bg-[#fff4df] border border-[#c77a00]/30 rounded-full px-4 py-2">
            <span className="text-sm font-black text-[#8c5700]">{alerts.filter((a) => a.severity === "warning").length} Avisos</span>
          </div>
        </div>

        <SectionTitle>Alertas ativos</SectionTitle>
        <div className="space-y-3 mb-8">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>

        <SectionTitle>Discrepâncias de fontes (SLA D23)</SectionTitle>
        <CardWrapper title="Validação cruzada">
          <div className="rounded-xl border border-[#dfe6ee] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f2f6fb] hover:bg-[#f2f6fb]">
                  {["Fonte A", "Fonte B", "Discrepância", "SLA máximo", "Status"].map((h) => (
                    <TableHead key={h} className="text-[#0b1f3a] font-bold text-xs uppercase">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {discrepancies.map((row, i) => (
                  <TableRow key={`${row.source_a}-${row.source_b}`} className={i % 2 === 0 ? "bg-white" : "bg-[#fafbfd]"}>
                    <TableCell className="font-semibold">{row.source_a}</TableCell>
                    <TableCell className="font-semibold">{row.source_b}</TableCell>
                    <TableCell className={cn("font-black text-sm", row.discrepancy <= row.sla ? "text-[#007342]" : "text-[#b2162e]")}>
                      {row.discrepancy.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-[#6c7685]">{row.sla}%</TableCell>
                    <TableCell>{row.status === "ok" ? "OK" : row.status === "warning" ? "Monitorar" : "Crítico"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardWrapper>
      </PageContent>
    </>
  );
}
