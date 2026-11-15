import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { User, UserRole } from '../types';
import { memoryStore } from '../utils/store';
import { NotFoundError } from '../utils/errors';

export class UserService {
  async syncUser(clerkId: string, data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
    role?: UserRole;
  }): Promise<User> {
    const role = data.role || UserRole.CUSTOMER;
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (existing) {
        const { data: updated } = await supabase
          .from('users')
          .update({
            first_name: data.first_name || null,
            last_name: data.last_name || null,
            phone: data.phone || null,
            avatar_url: data.avatar_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_id', clerkId)
          .select()
          .single();

        if (updated) {
          memoryStore.users.set(updated.id, updated as User);
          return updated as User;
        }
      } else {
        const { data: inserted, error } = await supabase
          .from('users')
          .insert({
            clerk_id: clerkId,
            email: data.email,
            first_name: data.first_name || null,
            last_name: data.last_name || null,
            phone: data.phone || null,
            avatar_url: data.avatar_url || null,
            role,
          })
          .select()
          .single();

        if (!error && inserted) {
          memoryStore.users.set(inserted.id, inserted as User);
          return inserted as User;
        }
      }
    } catch {
      // Fallback to store
    }

    // Memory Store Fallback
    let existingUser = Array.from(memoryStore.users.values()).find(
      (u) => u.clerk_id === clerkId || u.email === data.email
    );

    if (existingUser) {
      existingUser = {
        ...existingUser,
        first_name: data.first_name ?? existingUser.first_name,
        last_name: data.last_name ?? existingUser.last_name,
        phone: data.phone ?? existingUser.phone,
        avatar_url: data.avatar_url ?? existingUser.avatar_url,
        updated_at: new Date().toISOString(),
      };
      memoryStore.users.set(existingUser.id, existingUser);
      return existingUser;
    }

    const newUser: User = {
      id: uuidv4(),
      clerk_id: clerkId,
      email: data.email,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryStore.users.set(newUser.id, newUser);
    return newUser;
  }

  async getUserByClerkId(clerkId: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkId)
        .single();

      if (!error && data) return data as User;
    } catch {
      // fallback
    }

    const user = Array.from(memoryStore.users.values()).find((u) => u.clerk_id === clerkId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getUserById(id: string): Promise<User> {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (!error && data) return data as User;
    } catch {
      // fallback
    }

    const user = memoryStore.users.get(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const { data: updated, error } = await supabase
        .from('users')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && updated) {
        memoryStore.users.set(id, updated as User);
        return updated as User;
      }
    } catch {
      // fallback
    }

    const existing = memoryStore.users.get(id);
    if (!existing) throw new NotFoundError('User not found');

    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    memoryStore.users.set(id, updated);
    return updated;
  }
}

export const userService = new UserService();
