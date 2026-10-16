import { PageHeader, PageContent } from "@/components/layout/page-header";
import { ComingSoonPanel } from "@/components/layout/coming-soon";

export const metadata = { title: "Segurança — em breve" };

export default function SecurityPage() {
  return (
    <>
      <PageHeader title="Segurança e permissões" subtitle="ACL depois da versão intermediária" badge="Em breve" badgeColor="#6c7685" />
      <PageContent>
        <ComingSoonPanel
          title="Camada de segurança"
          description="Autenticação, papéis executivo vs operacional e permissões por unidade. Concluir após a versão intermediária, como combinado na reunião."
          specIds={["D43"]}
        />
      </PageContent>
    </>
  );
}
