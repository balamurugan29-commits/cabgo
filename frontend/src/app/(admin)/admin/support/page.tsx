'use client';

import React, { useState, useEffect } from 'react';
import { LifeBuoy, CheckCircle2, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { supportApi } from '@/services/api';
import { SupportTicket, TicketStatus } from '@/types';
import { toast } from 'sonner';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'tick-1',
      user_id: 'cust-1',
      ride_id: 'ride-1',
      subject: 'Driver took longer route',
      description: 'The driver took a longer detour causing an extra ₹40 charge.',
      status: TicketStatus.OPEN,
      priority: 'high' as any,
      assigned_to: null,
      resolved_at: null,
      created_at: '2026-03-01T10:00:00.000Z',
      updated_at: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'tick-2',
      user_id: 'cust-2',
      ride_id: null,
      subject: 'Question about promo code validity',
      description: 'Unable to apply FIRST50 on auto booking.',
      status: TicketStatus.RESOLVED,
      priority: 'medium' as any,
      assigned_to: 'admin-001',
      resolved_at: '2026-03-02T10:00:00.000Z',
      created_at: '2026-03-02T08:00:00.000Z',
      updated_at: '2026-03-02T10:00:00.000Z',
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supportApi
      .getAllTickets()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) setTickets(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (ticketId: string) => {
    try {
      await supportApi.updateTicket(ticketId, { status: TicketStatus.RESOLVED });
      setTickets(
        tickets.map((t) => (t.id === ticketId ? { ...t, status: TicketStatus.RESOLVED } : t))
      );
      toast.success('Ticket marked as Resolved');
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets & Complaints"
        description="Address passenger and driver grievances, investigate fare disputes, and log resolutions"
      />

      <div className="space-y-3">
        {tickets.map((t) => (
          <Card key={t.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{t.subject}</span>
                  <Badge variant={t.status === TicketStatus.RESOLVED ? 'success' : 'warning'} className="text-[10px]">
                    {t.status}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                    (Priority: {t.priority})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t.description}</p>
                <p className="text-[10px] text-muted-foreground pt-1">
                  Created on: {new Date(t.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                {t.status !== TicketStatus.RESOLVED && (
                  <Button
                    size="sm"
                    onClick={() => handleResolve(t.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                  >
                    <CheckCircle2 className="size-3.5 mr-1" /> Mark Resolved
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
