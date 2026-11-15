import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'text-primary' }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`p-2.5 rounded-xl bg-muted/60 ${color}`}>
            <Icon className="size-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {(subtitle || trend) && (
            <div className="mt-1 flex items-center text-xs text-muted-foreground gap-1.5">
              {trend && (
                <span className={`font-semibold ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {trend.value}
                </span>
              )}
              {subtitle && <span>{subtitle}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
