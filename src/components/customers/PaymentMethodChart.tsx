
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';

type PaymentMethodChartProps = {
  transactions: Transaction[];
};

const COLORS = {
  'Cash': 'hsl(var(--chart-1))',
  'Card': 'hsl(var(--chart-2))',
  'Bank Transfer': 'hsl(var(--chart-3))',
  'Online Payment': 'hsl(var(--chart-4))',
  'Product': 'hsl(var(--chart-5))',
};

export function PaymentMethodChart({ transactions }: PaymentMethodChartProps) {
  const data = useMemo(() => {
    const counts = transactions.reduce((acc, tx) => {
      const method = tx.meta.method || 'N/A';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No payment data available.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="p-2 bg-card border rounded-lg shadow-sm">
                  <p className="text-sm font-bold">{`${payload[0].name}: ${payload[0].value}`}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={35}
          fontSize={10}
          fill="#8884d8"
          dataKey="value"
          stroke="hsl(var(--background))"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#cccccc'} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
