
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Customer } from '@/lib/types';
import { formatAmount } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


type CustomerWithBalance = Customer & { balance: number };

type TopCustomersChartProps = {
  customers: CustomerWithBalance[];
};

export function TopCustomersChart({ customers }: TopCustomersChartProps) {
  const isMobile = useIsMobile();
  const sortedCustomers = [...customers].sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  const topCustomers = sortedCustomers.slice(0, 5);

  const chartData = topCustomers.map(c => ({
    name: c.meta.name.split(' ')[0],
    balance: c.balance
  }));

  return (
    <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart 
                data={chartData} 
                margin={{ top: 5, right: isMobile ? -10 : 20, left: isMobile ? -35 : -10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => formatAmount(value).replace('.00', '')}
                />
                <Tooltip 
                    cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="p-2 bg-card border rounded-lg shadow-sm">
                                    <p className="font-bold">{payload[0].payload.name}</p>
                                    <p className={`text-sm ${payload[0].value >= 0 ? 'text-[hsl(var(--chart-2))]' : 'text-destructive'}`}>
                                        Balance: {formatAmount(payload[0].value as number)}
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
                    {
                        chartData.map((entry, index) => (
                            <Bar key={`cell-${index}`} fill={entry.balance >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'} />
                        ))
                    }
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
