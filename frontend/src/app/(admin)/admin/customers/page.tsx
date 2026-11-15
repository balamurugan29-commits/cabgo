'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldAlert, CheckCircle2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { adminApi } from '@/services/api';
import { toast } from 'sonner';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminApi
      .getCustomers()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCustomers(res.data);
        } else {
          // Fallback initial directory if none created yet
          setCustomers([
            {
              id: 'cust-1',
              first_name: 'Alex',
              last_name: 'Morgan',
              email: 'customer@uberclone.com',
              phone_number: '+91 9876543211',
              total_rides: 14,
              is_active: true,
              created_at: '2026-01-10T10:00:00Z',
            },
            {
              id: 'cust-2',
              first_name: 'Priya',
              last_name: 'Sharma',
              email: 'priya.s@gmail.com',
              phone_number: '+91 9811223344',
              total_rides: 38,
              is_active: true,
              created_at: '2026-02-14T14:30:00Z',
            },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleSuspend = async (id: string, currentActive: boolean) => {
    try {
      await adminApi.suspendUser(id, currentActive);
      setCustomers(
        customers.map((c) => (c.id === id ? { ...c, is_active: !currentActive } : c))
      );
      toast.success(`User has been ${currentActive ? 'suspended' : 'reactivated'}`);
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const name = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    const phone = c.phone_number || c.phone || '';
    return name.includes(q) || (c.email && c.email.toLowerCase().includes(q)) || phone.includes(q);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Management"
        description="View registered riders, ride usage frequencies, and administer account privileges"
      />

      <div className="flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <Card key={c.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                  {c.first_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      {c.first_name} {c.last_name}
                    </span>
                    <Badge variant={c.is_active ? 'success' : 'destructive'} className="text-[10px]">
                      {c.is_active ? 'Active' : 'Suspended'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {c.email} &bull; {c.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <span className="font-bold text-foreground">{c.total_rides}</span>
                  <span className="text-muted-foreground block text-[10px]">Trips Booked</span>
                </div>

                <Button
                  size="sm"
                  variant={c.is_active ? 'outline' : 'default'}
                  onClick={() => handleToggleSuspend(c.id, c.is_active)}
                  className={`text-xs ${
                    c.is_active ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'bg-emerald-600'
                  }`}
                >
                  {c.is_active ? 'Suspend Account' : 'Reactivate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
