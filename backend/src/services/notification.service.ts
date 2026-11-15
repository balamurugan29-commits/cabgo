import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { Notification } from '../types';
import { memoryStore } from '../utils/store';

export class NotificationService {
  async create(userId: string, title: string, message: string, type: string, metadata?: any): Promise<Notification> {
    const notification: Notification = {
      id: uuidv4(),
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('notifications').insert(notification);
      } catch {
        // fallback
      }
    }

    const list = memoryStore.notifications.get(userId) || [];
    list.unshift(notification);
    memoryStore.notifications.set(userId, list);

    return notification;
  }

  async getAll(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Notification[];
    } catch {
      // fallback
    }

    return memoryStore.notifications.get(userId) || [];
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);
    } catch {
      // fallback
    }

    const list = memoryStore.notifications.get(userId) || [];
    const item = list.find((n) => n.id === notificationId);
    if (item) item.is_read = true;
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
    } catch {
      // fallback
    }

    const list = memoryStore.notifications.get(userId) || [];
    list.forEach((n) => (n.is_read = true));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const list = memoryStore.notifications.get(userId) || [];
    return list.filter((n) => !n.is_read).length;
  }
}

export const notificationService = new NotificationService();
