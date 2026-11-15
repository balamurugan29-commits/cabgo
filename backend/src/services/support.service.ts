import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { SupportTicket, TicketStatus, TicketPriority } from '../types';
import { memoryStore } from '../utils/store';
import { NotFoundError } from '../utils/errors';

export class SupportService {
  async createTicket(
    userId: string,
    data: {
      subject: string;
      description: string;
      ride_id?: string;
      priority?: TicketPriority;
    }
  ): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      id: uuidv4(),
      user_id: userId,
      ride_id: data.ride_id || null,
      subject: data.subject,
      description: data.description,
      status: TicketStatus.OPEN,
      priority: data.priority || TicketPriority.MEDIUM,
      assigned_to: null,
      resolved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('support_tickets').insert(ticket);
    } catch {
      // fallback
    }

    memoryStore.supportTickets.set(ticket.id, ticket);
    return ticket;
  }

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as SupportTicket[];
    } catch {
      // fallback
    }

    return Array.from(memoryStore.supportTickets.values())
      .filter((t) => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getAllTickets(status?: TicketStatus): Promise<SupportTicket[]> {
    let list = Array.from(memoryStore.supportTickets.values());
    if (status) {
      list = list.filter((t) => t.status === status);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async updateTicket(
    ticketId: string,
    data: { status?: TicketStatus; priority?: TicketPriority; assigned_to?: string }
  ): Promise<SupportTicket> {
    const ticket = memoryStore.supportTickets.get(ticketId);
    if (!ticket) throw new NotFoundError('Ticket not found');

    const updated: SupportTicket = {
      ...ticket,
      ...data,
      priority: data.priority || ticket.priority,
      assigned_to: data.assigned_to !== undefined ? data.assigned_to : ticket.assigned_to,
      resolved_at: data.status === TicketStatus.RESOLVED ? new Date().toISOString() : ticket.resolved_at,
      updated_at: new Date().toISOString(),
    };

    memoryStore.supportTickets.set(ticketId, updated);

    try {
      await supabase.from('support_tickets').update(updated).eq('id', ticketId);
    } catch {
      // fallback
    }

    return updated;
  }
}

export const supportService = new SupportService();
