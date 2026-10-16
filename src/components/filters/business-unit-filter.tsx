'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function BusinessUnitFilter() {
  return (
    <Select defaultValue="all">
      <SelectTrigger className="w-[180px] bg-white">
        <SelectValue placeholder="Unidade de Negócio" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as Unidades</SelectItem>
        <SelectItem value="leilao_compra">Leilão/Compra</SelectItem>
        <SelectItem value="select_venda">Select/Venda</SelectItem>
        <SelectItem value="select_compra">Select/Compra</SelectItem>
      </SelectContent>
    </Select>
  );
}
