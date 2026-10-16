import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BarChart3, LockKeyhole, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/app/login/login-form";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Acesso seguro — Copart BI",
  description: "Acesso restrito ao dashboard de Business Intelligence.",
};

export default async function LoginPage() {
  if (await getSession()) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07182d]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(0,184,207,0.18),transparent_30%),radial-gradient(circle_at_92%_80%,rgba(21,58,115,0.6),transparent_35%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
        <section className="hidden max-w-xl text-white lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#00b8cf] to-[#153a73] shadow-lg shadow-[#00b8cf]/15">
              <span className="text-xl font-black">C</span>
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">
                Copart<span className="text-[#00b8cf]">.</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8aa4be]">
                BI Dashboard
              </p>
            </div>
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00b8cf]/25 bg-[#00b8cf]/10 px-3 py-1.5 text-xs font-bold text-[#70dce8]">
            <ShieldCheck aria-hidden="true" className="size-4" />
            Ambiente corporativo protegido
          </div>
          <h1 className="text-4xl font-black leading-[1.12] tracking-tight xl:text-5xl">
            Decisões mais rápidas,
            <span className="block text-[#55d5e4]">dados sob controle.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#a7b8ca]">
            Acompanhe performance, funil de leilão e atribuição em um único
            ambiente seguro para a operação Copart Brasil.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <BarChart3 className="mb-3 size-5 text-[#00b8cf]" />
              <p className="text-sm font-bold">Visão integrada</p>
              <p className="mt-1 text-xs leading-5 text-[#8197ad]">
                Indicadores executivos e operacionais.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
              <LockKeyhole className="mb-3 size-5 text-[#00b8cf]" />
              <p className="text-sm font-bold">Acesso restrito</p>
              <p className="mt-1 text-xs leading-5 text-[#8197ad]">
                Sessão protegida e credenciais no servidor.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-[28px] border border-white/60 bg-[#f8fafc]/[0.98] p-7 shadow-2xl shadow-black/25 backdrop-blur sm:p-9">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00b8cf] to-[#153a73] text-white">
                <span className="font-black">C</span>
              </div>
              <p className="text-xl font-black text-[#0b1f3a]">
                Copart<span className="text-[#00b8cf]">.</span>
              </p>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#e8f7f9] text-[#008da2]">
              <LockKeyhole aria-hidden="true" className="size-5" />
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-[#0b1f3a]">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6c7685]">
              Identifique-se para acessar o dashboard corporativo.
            </p>

            <LoginForm />

            <div className="mt-7 border-t border-[#e2e8f0] pt-5">
              <p className="flex items-center justify-center gap-2 text-center text-xs text-[#738399]">
                <ShieldCheck aria-hidden="true" className="size-3.5" />
                Sessão expira automaticamente após 12 horas
              </p>
            </div>
          </div>
          <p className="mt-5 text-center text-[11px] leading-5 text-[#6f849a]">
            Uso exclusivo de pessoas autorizadas · Copart Brasil
          </p>
        </section>
      </div>
    </main>
  );
}
