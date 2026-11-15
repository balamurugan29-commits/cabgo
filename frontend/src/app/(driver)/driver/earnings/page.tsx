'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Download,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { driverApi } from '@/services/api';

export default function DriverEarningsPage() {
  const [earnings, setEarnings] = useState({
    today: 1250,
    thisWeek: 7400,
    thisMonth: 28600,
    total: 42500,
    recentEarnings: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driverApi
      .getEarnings()
      .then((res) => {
        if (res.data) setEarnings(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const weeklyBreakdown = [
    { day: 'Mon', trips: 8, net: 1420 },
    { day: 'Tue', trips: 10, net: 1850 },
    { day: 'Wed', trips: 6, net: 1100 },
    { day: 'Thu', trips: 9, net: 1600 },
    { day: 'Fri', trips: 12, net: 2150 },
    { day: 'Sat', trips: 14, net: 2680 },
    { day: 'Sun', trips: 11, net: 1980 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Earnings & Payouts"
        description="Comprehensive summary of your daily trips, net earnings, and platform commission breakdown"
      >
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Download className="size-4 mr-1.5" /> Download Statement
        </Button>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Net"
          value={`₹${earnings.today}`}
          subtitle="After 20% platform fee"
          icon={DollarSign}
          color="text-emerald-500"
          trend={{ value: '+12% vs last week', isPositive: true }}
        />
        <StatCard
          title="This Week"
          value={`₹${earnings.thisWeek}`}
          subtitle="Mon - Sun total"
          icon={Calendar}
          color="text-blue-500"
        />
        <StatCard
          title="This Month"
          value={`₹${earnings.thisMonth}`}
          subtitle="Current calendar month"
          icon={TrendingUp}
          color="text-indigo-500"
        />
        <StatCard
          title="Lifetime Payouts"
          value={`₹${earnings.total}`}
          subtitle="Direct bank transfers"
          icon={CreditCard}
          color="text-amber-500"
        />
      </div>

      {/* Weekly Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Weekly Activity Summary</CardTitle>
            <CardDescription>Daily completed rides and net take-home earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {weeklyBreakdown.map((row) => (
                <div key={row.day} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground w-10">{row.day}</span>
                    <span className="text-muted-foreground">{row.trips} trips completed</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">Commission: 20%</span>
                    <span className="font-bold text-emerald-600 text-sm">₹{row.net}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bank Payout Info */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Payout Account</CardTitle>
            <CardDescription>Automated weekly bank transfer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
              <p className="font-semibold text-foreground">HDFC Bank &bull;&bull;&bull;&bull; 4892</p>
              <p className="text-muted-foreground">IFSC: HDFC0001244</p>
              <Badge variant="success" className="text-[10px] mt-1">
                Verified for Payouts
              </Badge>
            </div>

            <div className="space-y-1 text-muted-foreground text-[11px]">
              <p>&bull; Payout schedule: Every Monday 08:00 AM</p>
              <p>&bull; Instant transfer supported via IMPS/NEFT</p>
              <p>&bull; 0% transaction withdrawal surcharge</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
