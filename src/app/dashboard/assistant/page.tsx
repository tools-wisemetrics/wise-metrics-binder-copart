import { PageHeader, PageContent } from "@/components/layout/page-header";
import { ComingSoonPanel } from "@/components/layout/coming-soon";

export const metadata = { title: "Assistente de IA — em breve" };

export default function AssistantPage() {
  return (
    <>
      <PageHeader title="Assistente de IA" subtitle="Perguntas em linguagem natural sobre o banco" badge="Em breve" badgeColor="#6c7685" />
      <PageContent>
        <ComingSoonPanel
          title="Assistente e base consultável"
          description="Perguntas em linguagem natural, cruzamentos quantitativos e recomendações fundamentadas em documentação. User ID comum entre fontes também entra nesta onda. Fora da versão intermediária."
          specIds={["D22", "D32", "D33", "D34"]}
        />
      </PageContent>
    </>
  );
}
