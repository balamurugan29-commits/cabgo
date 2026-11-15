'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  LifeBuoy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { supportApi } from '@/services/api';
import { SupportTicket, TicketStatus } from '@/types';
import { toast } from 'sonner';

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // New ticket state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supportApi
      .getUserTickets()
      .then((res) => setTickets(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Subject and description are required');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await supportApi.createTicket({
        subject,
        description,
        priority: 'medium',
      });
      setTickets([res.data, ...tickets]);
      setSubject('');
      setDescription('');
      toast.success('Support ticket created. Our team will contact you shortly.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return <Badge variant="warning">Open</Badge>;
      case TicketStatus.IN_PROGRESS:
        return <Badge variant="info">In Progress</Badge>;
      case TicketStatus.RESOLVED:
        return <Badge variant="success">Resolved</Badge>;
      case TicketStatus.CLOSED:
        return <Badge variant="secondary">Closed</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Help & Support"
        description="Raise a ticket or check answers to common queries regarding rides, charges, and account"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Create Ticket Form */}
        <div className="md:col-span-5">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Raise a Ticket</CardTitle>
              <CardDescription>Tell us about any problem you faced</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTicket} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Fare discrepancy on Trip #12"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details of your issue..."
                    rows={4}
                    className="w-full text-xs rounded-md border border-input bg-transparent p-2.5 outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full">
                  Submit Support Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <div className="md:col-span-7">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-xs text-muted-foreground py-8 text-center animate-pulse">
                  Loading tickets...
                </p>
              ) : tickets.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  <LifeBuoy className="size-8 mx-auto mb-2 opacity-50" />
                  No open tickets. If you ever need help, submit a request on the left.
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {tickets.map((t) => (
                    <div key={t.id} className="py-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">{t.subject}</span>
                        {getStatusBadge(t.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                        <span>Submitted on {new Date(t.created_at).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span className="capitalize">Priority: {t.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
