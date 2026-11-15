import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { CustomerProfile, EmergencyContact } from '../types';
import { memoryStore } from '../utils/store';
import { NotFoundError } from '../utils/errors';

export class CustomerService {
  async getProfile(userId: string): Promise<CustomerProfile> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (!error && data) return data as CustomerProfile;
      } catch {
        // fallback
      }
    }

    let profile = memoryStore.customerProfiles.get(userId);
    if (!profile) {
      profile = {
        id: uuidv4(),
        user_id: userId,
        saved_addresses: [],
        preferred_payment_method: null,
        stripe_customer_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memoryStore.customerProfiles.set(userId, profile);
    }
    return profile;
  }

  async updateProfile(userId: string, data: Partial<CustomerProfile>): Promise<CustomerProfile> {
    try {
      const { data: updated, error } = await supabase
        .from('customer_profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();
      if (!error && updated) {
        memoryStore.customerProfiles.set(userId, updated as CustomerProfile);
        return updated as CustomerProfile;
      }
    } catch {
      // fallback
    }

    const profile = await this.getProfile(userId);
    const updated = { ...profile, ...data, updated_at: new Date().toISOString() };
    memoryStore.customerProfiles.set(userId, updated);
    return updated;
  }

  async addSavedAddress(userId: string, address: { label: string; address: string; lat: number; lng: number }) {
    const profile = await this.getProfile(userId);
    const saved = profile.saved_addresses || [];
    saved.push(address);
    return this.updateProfile(userId, { saved_addresses: saved });
  }

  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId);
      if (!error && data) return data as EmergencyContact[];
    } catch {
      // fallback
    }

    return memoryStore.emergencyContacts.get(userId) || [];
  }

  async addEmergencyContact(userId: string, data: { name: string; phone: string; relationship?: string }): Promise<EmergencyContact> {
    const contact: EmergencyContact = {
      id: uuidv4(),
      user_id: userId,
      name: data.name,
      phone: data.phone,
      relationship: data.relationship || null,
      created_at: new Date().toISOString(),
    };

    try {
      const { data: inserted, error } = await supabase
        .from('emergency_contacts')
        .insert(contact)
        .select()
        .single();
      if (!error && inserted) {
        return inserted as EmergencyContact;
      }
    } catch {
      // fallback
    }

    const list = memoryStore.emergencyContacts.get(userId) || [];
    list.push(contact);
    memoryStore.emergencyContacts.set(userId, list);
    return contact;
  }

  async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
    try {
      await supabase.from('emergency_contacts').delete().eq('id', contactId).eq('user_id', userId);
    } catch {
      // fallback
    }

    const list = memoryStore.emergencyContacts.get(userId) || [];
    memoryStore.emergencyContacts.set(
      userId,
      list.filter((c) => c.id !== contactId)
    );
  }
}

export const customerService = new CustomerService();
