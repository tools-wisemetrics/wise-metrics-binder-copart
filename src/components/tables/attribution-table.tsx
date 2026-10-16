import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AttributionComparison } from '@/lib/data/types';
import { formatNumber } from '@/lib/utils/formatters';

interface AttributionTableProps {
  data: AttributionComparison[];
}

export function AttributionTable({ data }: AttributionTableProps) {
  return (
    <div className="rounded-md border animate-fade-in">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[300px] font-semibold text-copart-navy">Campanha</TableHead>
            <TableHead className="text-right font-semibold">First Touch</TableHead>
            <TableHead className="text-right font-semibold">Last Touch</TableHead>
            <TableHead className="text-right font-semibold">Linear</TableHead>
            <TableHead className="text-right font-semibold">Time Decay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i} className="hover:bg-muted/30">
              <TableCell className="font-medium">{row.campaign_name}</TableCell>
              <TableCell className="text-right">{formatNumber(row.first_touch)}</TableCell>
              <TableCell className="text-right">{formatNumber(row.last_touch)}</TableCell>
              <TableCell className="text-right">{formatNumber(row.linear)}</TableCell>
              <TableCell className="text-right">{formatNumber(row.time_decay)}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Nenhum dado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
