import { useState } from 'react';
export const RANGES = [{ value: '7d', label: '7 Days' }, { value: '30d', label: '30 Days' }, { value: '90d', label: '90 Days' }];
export function useAnalyticsRange(initial = '30d') {
  const [range, setRange] = useState(initial);
  return { range, setRange };
}