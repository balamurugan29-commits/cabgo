'use client';

import React, { useState } from 'react';
import { Users, Search, ShieldAlert, CheckCircle2, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { adminApi } from '@/services/api';
import { toast } from 'sonner';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([
    {
      id: 'cust-1',
      first_name: 'Alex',
      last_name: 'Morgan',
      email: 'customer@uberclone.com',
      phone: '+91 9876543211',
      total_rides: 14,
      is_active: true,
      created_at: '2026-01-10T10:00:00Z',
    },
    {
      id: 'cust-2',
      first_name: 'Priya',
      last_name: 'Sharma',
      email: 'priya.s@gmail.com',
      phone: '+91 9811223344',
      total_rides: 38,
      is_active: true,
      created_at: '2026-02-14T14:30:00Z',
    },
    {
      id: 'cust-3',
      first_name: 'David',
      last_name: 'Chen',
      email: 'david.c@outlook.com',
      phone: '+91 9988776655',
      total_rides: 5,
      is_active: true,
      created_at: '2026-03-01T09:15:00Z',
    },
    {
      id: 'cust-4',
      first_name: 'Rohan',
      last_name: 'Verma',
      email: 'rohan.v@yahoo.com',
      phone: '+91 9123456789',
      total_rides: 0,
      is_active: false,
      created_at: '2026-03-10T16:45:00Z',
    },
  ]);

  const [search, setSearch] = useState('');

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
    const name = `${c.first_name} ${c.last_name}`.toLowerCase();
    return name.includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
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
