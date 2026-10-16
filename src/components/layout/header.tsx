"use client";

import { Calendar, RefreshCw, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  title: string;
  subtitle?: string;
  period?: string;
}

export function Header({ title, subtitle, period = "Últimos 30 dias" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#dfe6ee] px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div className="min-w-0">
          <h1 className="text-xl font-black text-[#0b1f3a] tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[#6c7685] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Period selector */}
          <div className="flex items-center gap-2 bg-[#f4f7fb] border border-[#dfe6ee] rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-[#6c7685]" />
            <Select defaultValue="30d">
              <SelectTrigger className="border-0 bg-transparent h-auto p-0 text-sm font-semibold text-[#0b1f3a] focus:ring-0 w-auto min-w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Channel filter */}
          <Select defaultValue="all">
            <SelectTrigger className="border border-[#dfe6ee] bg-white rounded-xl h-10 text-sm font-semibold text-[#0b1f3a] w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Canais</SelectItem>
              <SelectItem value="meta">Meta Ads</SelectItem>
              <SelectItem value="google">Google Ads</SelectItem>
              <SelectItem value="organic">Orgânico</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh */}
          <Button
            variant="outline"
            size="icon"
            className="border-[#dfe6ee] hover:bg-[#f4f7fb] rounded-xl"
          >
            <RefreshCw className="w-4 h-4 text-[#6c7685]" />
          </Button>

          {/* Alerts bell */}
          <Button
            variant="outline"
            size="icon"
            className="border-[#dfe6ee] hover:bg-[#f4f7fb] rounded-xl relative"
          >
            <Bell className="w-4 h-4 text-[#6c7685]" />
            <Badge className="absolute -top-1.5 -right-1.5 w-4 h-4 p-0 text-[9px] flex items-center justify-center bg-[#cf3044] text-white border-0">
              2
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  );
}
