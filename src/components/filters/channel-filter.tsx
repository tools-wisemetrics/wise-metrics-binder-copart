'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ChannelFilter() {
  return (
    <Select defaultValue="all">
      <SelectTrigger className="w-[180px] bg-white">
        <SelectValue placeholder="Canal" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os Canais</SelectItem>
        <SelectItem value="meta">Meta Ads</SelectItem>
        <SelectItem value="google">Google Ads</SelectItem>
        <SelectItem value="tiktok">TikTok Ads</SelectItem>
        <SelectItem value="organic">Orgânico</SelectItem>
        <SelectItem value="direct">Direto</SelectItem>
      </SelectContent>
    </Select>
  );
}
