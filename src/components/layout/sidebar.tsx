"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Filter, MessageCircle,
  BarChart3, Gavel, ShoppingCart, AlertTriangle, Lightbulb,
  ChevronRight, Target, Route, Map, TrendingUp, FileText, Images, Bot, Shield,
  LogOut,
} from "lucide-react";
import { logout } from "@/app/login/actions";
import { navHref } from "@/lib/filters";
import { cn } from "@/lib/utils";

const icons = {
  LayoutDashboard, Filter, MessageCircle, BarChart3, Gavel,
  ShoppingCart, AlertTriangle, Lightbulb, Target, Route, Map, TrendingUp,
  FileText, Images, Bot, Shield,
};

const navGroups = [
  {
    label: "Executivo",
    items: [
      { label: "Visão Geral", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Funil de Leilão", href: "/dashboard/funnel", icon: "Filter" },
      { label: "Copart Select", href: "/dashboard/direct-sales", icon: "MessageCircle" },
      { label: "Metas por Canal", href: "/dashboard/channel-goals", icon: "Target" },
      { label: "Canais de origem", href: "/dashboard/conversion-paths", icon: "Route" },
      { label: "Análise Regional", href: "/dashboard/regional", icon: "Map" },
      { label: "Evolução", href: "/dashboard/evolution", icon: "TrendingUp" },
    ],
  },
  {
    label: "Operacional",
    items: [
      { label: "Mídia Paga", href: "/dashboard/paid-media", icon: "BarChart3" },
      { label: "Scorecard de campanhas", href: "/dashboard/campaigns", icon: "BarChart3" },
      { label: "Campanhas Leilão", href: "/dashboard/auction-campaigns", icon: "Gavel" },
      { label: "Campanhas Select", href: "/dashboard/direct-campaigns", icon: "ShoppingCart" },
      { label: "Alertas", href: "/dashboard/alerts", icon: "AlertTriangle" },
      { label: "Recomendações", href: "/dashboard/recommendations", icon: "Lightbulb" },
      { label: "Relatório", href: "/dashboard/report", icon: "FileText" },
      { label: "Criativos", href: "/dashboard/creatives", icon: "Images" },
    ],
  },
  {
    label: "Em breve",
    items: [
      { label: "Assistente de IA", href: "/dashboard/assistant", icon: "Bot" },
      { label: "Segurança", href: "/dashboard/security", icon: "Shield" },
    ],
  },
];

function useQueryAfterHydration() {
  const searchParams = useSearchParams();
  return searchParams.toString();
}

function SidebarNav() {
  const pathname = usePathname();
  const query = useQueryAfterHydration();

  return (
    <nav className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.12em] font-bold text-[#4a6080]">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const Icon = icons[item.icon as keyof typeof icons];
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
              const href = navHref(item.href, query);
              const upcoming = group.label === "Em breve";
              return (
                <li key={item.href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-[#00b8cf]/20 to-[#153a73]/20 text-white border border-[#00b8cf]/30"
                        : upcoming
                        ? "text-[#6b8098] hover:bg-white/5 hover:text-white"
                        : "text-[#8aa4be] hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0 transition-colors",
                        isActive ? "text-[#00b8cf]" : "text-[#4a6080] group-hover:text-[#8aa4be]"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {upcoming && !isActive && (
                      <span className="text-[9px] uppercase tracking-widest text-[#4a6080] ml-1">Em breve</span>
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 text-[#00b8cf]" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 flex-col h-screen bg-[#0b1f3a] border-r border-[#1a3050] sticky top-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1a3050]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00b8cf] to-[#153a73] flex items-center justify-center">
          <span className="text-white font-black text-sm">C</span>
        </div>
        <div>
          <span className="text-white font-black text-lg tracking-tight">Copart</span>
          <span className="text-[#00b8cf] font-black text-lg">.</span>
          <p className="text-[#6c7685] text-[10px] uppercase tracking-widest font-bold -mt-1">
            BI Dashboard
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav />
      </div>

      <div className="px-6 py-4 border-t border-[#1a3050]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00a85a]" />
              <span className="text-white text-xs font-bold">Acesso seguro</span>
            </div>
            <p className="text-[#8aa4be] text-[10px] mt-1 truncate">
              Sessão autenticada
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="Sair"
              aria-label="Sair do dashboard"
              className="flex size-8 items-center justify-center rounded-lg text-[#6b8098] transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b8cf]"
            >
              <LogOut aria-hidden="true" className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
