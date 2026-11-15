'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Car,
  DollarSign,
  TrendingUp,
  Percent,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/stat-card';
import { PageHeader } from '@/components/shared/page-header';
import { adminApi } from '@/services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalCustomers: 28,
    totalDrivers: 14,
    pendingDrivers: 2,
    approvedDrivers: 12,
    rejectedDrivers: 0,
    activeRides: 3,
    completedRides: 185,
    cancelledRides: 12,
    totalRevenue: 64500,
    platformCommission: 12900,
    currency: 'INR',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('uber_clone_role', 'admin');
    adminApi
      .getStats()
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Management Console"
        description="Platform oversight, real-time dispatch monitoring, driver approvals, and revenue analytics"
      >
        <Link href="/admin/fare-settings">
          <Button variant="outline" size="sm">
            <Sliders className="size-4 mr-1.5" /> Adjust Fares
          </Button>
        </Link>
        <Link href="/admin/drivers">
          <Button size="sm">
            <ShieldCheck className="size-4 mr-1.5" /> Review Drivers ({stats.pendingDrivers})
          </Button>
        </Link>
      </PageHeader>

      {/* Pending driver approval alert if any */}
      {stats.pendingDrivers > 0 && (
        <Card className="border-amber-300 bg-amber-500/10 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-amber-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  {stats.pendingDrivers} Driver Applications Awaiting Verification
                </span>
                <p className="text-muted-foreground mt-0.5">
                  Review applicant driving licenses and vehicle registration documents to approve fleet access.
                </p>
              </div>
            </div>
            <Link href="/admin/drivers">
              <Button size="sm" variant="default" className="text-xs">
                Review Now &rarr;
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          subtitle="Processed volume"
          icon={DollarSign}
          color="text-emerald-500"
          trend={{ value: '+18.4% MoM', isPositive: true }}
        />
        <StatCard
          title="Platform Commission"
          value={`₹${stats.platformCommission.toLocaleString()}`}
          subtitle="20% Net platform fee"
          icon={Percent}
          color="text-blue-500"
        />
        <StatCard
          title="Registered Passengers"
          value={stats.totalCustomers}
          subtitle="Active customers"
          icon={Users}
          color="text-indigo-500"
        />
        <StatCard
          title="Fleet Drivers"
          value={stats.totalDrivers}
          subtitle={`${stats.approvedDrivers} Approved & Verified`}
          icon={Car}
          color="text-amber-500"
        />
      </div>

      {/* Trip Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Active Trips</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-600">{stats.activeRides}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Currently on road</p>
            </div>
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              🚕
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Completed Trips</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{stats.completedRides}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Successfully arrived</p>
            </div>
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Cancelled Trips</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600">{stats.cancelledRides}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">6.1% cancellation rate</p>
            </div>
            <div className="size-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Administrative Quick Jump Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/customers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Customer Management</p>
                <p className="text-xs text-muted-foreground">Manage user accounts & status</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/promo-codes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Tag className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Promo Codes & Discounts</p>
                <p className="text-xs text-muted-foreground">Create coupons & track redemptions</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/fare-settings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                <Sliders className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Dynamic Pricing Engine</p>
                <p className="text-xs text-muted-foreground">Configure base, per km & surge rates</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
