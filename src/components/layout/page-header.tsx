import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { DataSourceModal } from "@/components/layout/data-source-modal";
import { DATA_ORIGIN_LABEL } from "@/lib/constants";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  children?: React.ReactNode;
  className?: string;
  dataOriginLabel?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  badgeColor = "#00b8cf",
  children,
  className,
  dataOriginLabel = DATA_ORIGIN_LABEL,
  actions,
}: PageHeaderProps) {
  return (
    <div className={cn("z-10 bg-white/90 backdrop-blur-md border-b border-[#dfe6ee] px-4 sm:px-8 py-4", className)}>
      <div className="flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          {badge && (
            <span
              className="text-[10px] uppercase tracking-[0.12em] font-black px-2.5 py-1 rounded-full text-white flex-shrink-0"
              style={{ background: badgeColor }}
            >
              {badge}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-black text-[#0b1f3a] tracking-tight truncate">{title}</h1>
            {subtitle && <p className="text-sm text-[#6c7685] mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 text-xs text-[#6c7685]">
          {actions}
          <DataSourceModal />
          <div className="hidden sm:flex items-center gap-1.5 bg-[#e8f8ef] px-3 py-1.5 rounded-xl border border-[#00a85a]/30">
            <span className="font-semibold text-[#007342]">{dataOriginLabel}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 bg-[#f4f7fb] px-3 py-1.5 rounded-xl border border-[#dfe6ee]">
            <RefreshCw className="w-3.5 h-3.5 text-[#00a85a]" />
            <span className="font-medium text-[#344255]">Atualizado 11h</span>
          </div>
        </div>
      </div>
      {children && (
        <div className="max-w-[1400px] mx-auto mt-3">{children}</div>
      )}
    </div>
  );
}

export function PageContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-4 sm:p-8 max-w-[1400px] mx-auto w-full", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-base font-black text-[#0b1f3a] mb-4", className)}>{children}</h2>
  );
}

export function CardWrapper({ children, title, subtitle, className }: { children: React.ReactNode; title?: string; subtitle?: string; className?: string }) {
  return (
    <div className={cn("bg-white border border-[#dfe6ee] rounded-2xl p-5", className)}>
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-black text-[#0b1f3a]">{title}</h3>
          {subtitle && <p className="text-xs text-[#6c7685] mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
