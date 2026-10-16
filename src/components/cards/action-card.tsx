import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionRecommendation } from '@/lib/data/types';
import { Lightbulb, CalendarClock, User, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  action: ActionRecommendation;
  className?: string;
}

export function ActionCard({ action, className }: ActionCardProps) {
  const isHighPriority = action.priority >= 8;
  
  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md animate-fade-in-up border-l-4",
      isHighPriority ? "border-l-copart-amber" : "border-l-copart-blue",
      className
    )}>
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={cn(
            "mb-2 font-semibold", 
            isHighPriority ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"
          )}>
            Prioridade {action.priority}/10
          </Badge>
          {action.campaign && (
            <Badge variant="secondary" className="text-xs font-normal">
              {action.campaign}
            </Badge>
          )}
        </div>
        <CardTitle className="text-base font-bold leading-tight">
          {action.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <div className="flex gap-2 text-sm">
          <Lightbulb className="w-4 h-4 text-copart-teal shrink-0 mt-0.5" />
          <span className="text-muted-foreground">{action.reason}</span>
        </div>
        <div className="flex gap-2 text-sm font-medium">
          <TrendingUp className="w-4 h-4 text-copart-green shrink-0 mt-0.5" />
          <span className="text-foreground">Impacto: {action.impact}</span>
        </div>
        {action.budget_change && (
          <div className="text-xs font-semibold px-2 py-1 bg-copart-bg rounded inline-block text-copart-navy">
            Orçamento: {action.budget_change}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/30 py-2 px-4 flex justify-between items-center text-xs text-muted-foreground border-t">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>{action.responsavel}</span>
        </div>
        <div className="flex items-center gap-1">
          <CalendarClock className="w-3 h-3" />
          <span className={cn("font-medium", isHighPriority ? "text-copart-red" : "")}>
            {action.deadline}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
