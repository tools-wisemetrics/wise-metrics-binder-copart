import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialPlatform } from '@/lib/data/types';
import { formatNumberFull } from '@/lib/utils/formatters';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialCardProps {
  platform: SocialPlatform;
  className?: string;
}

export function SocialCard({ platform, className }: SocialCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md animate-fade-in-up", className)}>
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: platform.color }}
            />
            <span>{platform.name}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Base */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Base de Fãs / Seguidores</p>
            <p className="text-2xl font-black text-foreground">{formatNumberFull(platform.base)}</p>
          </div>
          <div className="text-xs font-medium text-muted-foreground mb-1">
            {platform.baseDelta}
          </div>
        </div>
        
        {/* Main Metric */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Métrica Principal</p>
            <p className="text-xl font-bold text-foreground">{formatNumberFull(platform.mainMetric)}</p>
          </div>
          <div className={cn(
            "flex items-center text-xs font-medium mb-1",
            platform.mainDeltaType === 'good' ? "text-copart-green" : 
            platform.mainDeltaType === 'bad' ? "text-copart-red" : "text-muted-foreground"
          )}>
            {platform.mainDeltaType === 'good' ? <ArrowUpRight className="w-3 h-3 mr-1" /> :
             platform.mainDeltaType === 'bad' ? <ArrowDownRight className="w-3 h-3 mr-1" /> :
             <Minus className="w-3 h-3 mr-1" />}
            {platform.mainDelta > 0 ? '+' : ''}{platform.mainDelta}
          </div>
        </div>

        {/* Detailed Metrics */}
        {platform.details && platform.details.length > 0 && (
          <div className="pt-3 mt-3 border-t space-y-2">
            {platform.details.map((detail, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{detail.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{detail.value}</span>
                  <span className={cn(
                    "text-[10px] font-medium px-1 rounded",
                    detail.deltaType === 'good' ? "bg-copart-green/10 text-copart-green" : "bg-copart-red/10 text-copart-red"
                  )}>
                    {detail.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
