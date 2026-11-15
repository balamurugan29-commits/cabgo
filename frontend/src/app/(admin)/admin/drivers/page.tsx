'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  FileText,
  Car,
  User,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { adminApi } from '@/services/api';
import { DriverStatus } from '@/types';
import { toast } from 'sonner';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  // Reject dialog modal state
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Incomplete or illegible document scan');

  const loadDrivers = () => {
    adminApi
      .getDrivers()
      .then((res) => {
        if (res.data) setDrivers(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleApprove = async (driverId: string) => {
    try {
      await adminApi.approveDriver(driverId);
      toast.success('Driver application APPROVED! Fleet access granted.');
      loadDrivers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve driver');
    }
  };

  const handleReject = async () => {
    if (!selectedDriverId) return;
    try {
      await adminApi.rejectDriver(selectedDriverId, rejectReason);
      toast.info('Driver application rejected.');
      setSelectedDriverId(null);
      loadDrivers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject driver');
    }
  };

  const filtered = drivers.filter((d) => {
    if (activeTab === 'pending' && d.status !== DriverStatus.PENDING) return false;
    if (activeTab === 'approved' && d.status !== DriverStatus.APPROVED) return false;
    if (activeTab === 'rejected' && d.status !== DriverStatus.REJECTED) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const name = `${d.user?.first_name || ''} ${d.user?.last_name || ''}`.toLowerCase();
      const email = (d.user?.email || '').toLowerCase();
      const plate = (d.vehicle?.license_plate || '').toLowerCase();
      return name.includes(q) || email.includes(q) || plate.includes(q);
    }
    return true;
  });

  const getStatusBadge = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.APPROVED:
        return <Badge variant="success">Approved</Badge>;
      case DriverStatus.PENDING:
        return <Badge variant="warning">Pending Review</Badge>;
      case DriverStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>;
      case DriverStatus.SUSPENDED:
        return <Badge variant="destructive">Suspended</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Fleet & Verification"
        description="Verify commercial driver licenses, vehicle registration certificates, and manage active fleet status"
      />

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border w-full sm:w-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver by name, email, plate..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Drivers List */}
      {loading ? (
        <p className="text-xs text-muted-foreground py-12 text-center animate-pulse">
          Loading fleet applications...
        </p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No drivers found"
          description={`No driver records found under "${activeTab}" filter.`}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((driver) => (
            <Card key={driver.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center font-bold text-xl shrink-0 mt-0.5">
                    👨‍✈️
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {driver.user?.first_name || 'Driver'} {driver.user?.last_name || ''}
                      </span>
                      {getStatusBadge(driver.status)}
                      <span className="text-xs text-muted-foreground font-mono">
                        (Rating: {driver.average_rating || 4.9} ★)
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {driver.user?.email || 'driver@uberclone.com'} &bull; {driver.user?.phone || '+91 9876543212'}
                    </p>

                    {driver.vehicle ? (
                      <div className="flex items-center gap-2 text-xs text-foreground pt-1">
                        <Car className="size-3.5 text-primary" />
                        <span>
                          {driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model}
                        </span>
                        <span className="font-mono font-bold text-[11px] px-1.5 py-0.2 rounded border bg-muted/50">
                          {driver.vehicle.license_plate}
                        </span>
                        <span className="text-muted-foreground uppercase text-[10px]">
                          ({driver.vehicle.type})
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600">No vehicle registered yet</p>
                    )}
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="flex items-center gap-2 justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border/60">
                  {driver.status === DriverStatus.PENDING && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(driver.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      >
                        <CheckCircle2 className="size-3.5 mr-1" /> Approve Driver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDriverId(driver.id)}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
                      >
                        <XCircle className="size-3.5 mr-1" /> Reject
                      </Button>
                    </>
                  )}

                  {driver.status === DriverStatus.APPROVED && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(driver.id)}
                      className="text-xs text-muted-foreground"
                    >
                      <ShieldCheck className="size-3.5 mr-1 text-emerald-600" /> Re-verify
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Reason Dialog Modal */}
      {selectedDriverId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base text-rose-600">Reject Driver Application</CardTitle>
              <CardDescription>
                Specify the reason for rejection. This notice will be emailed to the applicant.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs rounded-md border border-input bg-transparent px-3 py-2 outline-none"
              >
                <option value="Incomplete or illegible document scan">Incomplete or illegible document scan</option>
                <option value="Expired driving license certificate">Expired driving license certificate</option>
                <option value="Vehicle commercial age exceeds platform limits">Vehicle commercial age exceeds platform limits</option>
                <option value="Identity verification mismatch">Identity verification mismatch</option>
              </select>

              <div className="flex items-center gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setSelectedDriverId(null)}>
                  Cancel
                </Button>
                <Button size="sm" variant="destructive" onClick={handleReject}>
                  Confirm Rejection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
