'use client';

import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DateRangePicker() {
  return (
    <Button variant="outline" className="w-[240px] justify-start text-left font-normal bg-white">
      <CalendarIcon className="mr-2 h-4 w-4" />
      <span>28 Jun, 2026 - 04 Jul, 2026</span>
    </Button>
  );
}
