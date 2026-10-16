"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";
import { navHref } from "@/lib/filters";

const links = [
  { href: "/dashboard", label: "Geral" },
  { href: "/dashboard/paid-media", label: "Mídia Paga" },
  { href: "/dashboard/funnel", label: "Funil" },
  { href: "/dashboard/direct-sales", label: "Select" },
  { href: "/dashboard/channel-goals", label: "Metas" },
  { href: "/dashboard/conversion-paths", label: "Origens" },
  { href: "/dashboard/regional", label: "Regional" },
  { href: "/dashboard/evolution", label: "Evolução" },
  { href: "/dashboard/campaigns", label: "Campanhas" },
  { href: "/dashboard/alerts", label: "Alertas" },
  { href: "/dashboard/report", label: "Relatório" },
  { href: "/dashboard/creatives", label: "Criativos" },
];

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <div className="md:hidden overflow-x-auto border-b border-[#dfe6ee] bg-[#0b1f3a] px-3 py-2 flex gap-2">
      {links.map((link) => {
        const active = link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href);
        const href = navHref(link.href, query);
        return (
          <Link
            key={link.href}
            href={href}
            className={`whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-full ${
              active ? "bg-[#00b8cf] text-[#0b1f3a]" : "text-[#8aa4be]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <form action={logout} className="ml-auto border-l border-white/10 pl-2">
        <button
          type="submit"
          aria-label="Sair do dashboard"
          className="flex size-7 items-center justify-center rounded-full text-[#8aa4be] transition hover:bg-white/10 hover:text-white"
        >
          <LogOut aria-hidden="true" className="size-3.5" />
        </button>
      </form>
    </div>
  );
}
