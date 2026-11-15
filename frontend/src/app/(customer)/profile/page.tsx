'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { customerApi, authApi } from '@/services/api';
import { EmergencyContact } from '@/types';
import { toast } from 'sonner';

export default function CustomerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>({
    first_name: 'Alex',
    last_name: 'Morgan',
    email: 'customer@uberclone.com',
    phone: '+919876543211',
  });
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  // Emergency contact modal / inputs
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('Family');

  // Address inputs
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<any[]>([
    { label: 'Home', address: 'Koramangala 4th Block, Bengaluru', lat: 12.9345, lng: 77.6265 },
    { label: 'Work', address: 'Indiranagar 100ft Road, Bengaluru', lat: 12.9719, lng: 77.6412 },
  ]);

  useEffect(() => {
    Promise.all([
      customerApi.getProfile().catch(() => null),
      customerApi.getEmergencyContacts().catch(() => ({ data: [] })),
    ])
      .then(([profileRes, contactsRes]) => {
        if (profileRes?.data?.user) {
          setUser(profileRes.data.user);
          if (profileRes.data.profile?.saved_addresses?.length) {
            setSavedAddresses(profileRes.data.profile.saved_addresses);
          }
        }
        if (contactsRes?.data) {
          setContacts(contactsRes.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    try {
      await authApi.updateProfile({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
      });
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleAddEmergencyContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      toast.error('Name and Phone are required');
      return;
    }
    try {
      const res = await customerApi.addEmergencyContact({
        name: newContactName,
        phone: newContactPhone,
        relationship: newContactRel,
      });
      setContacts([...contacts, res.data]);
      setNewContactName('');
      setNewContactPhone('');
      toast.success('Emergency contact added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add emergency contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await customerApi.deleteEmergencyContact(id);
      setContacts(contacts.filter((c) => c.id !== id));
      toast.success('Contact removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove contact');
    }
  };

  const handleAddSavedAddress = async () => {
    if (!newAddressLabel.trim() || !newAddressText.trim()) {
      toast.error('Label and Address are required');
      return;
    }
    const newAddr = {
      label: newAddressLabel,
      address: newAddressText,
      lat: 12.9716,
      lng: 77.5946,
    };
    try {
      await customerApi.addSavedAddress(newAddr);
      setSavedAddresses([...savedAddresses, newAddr]);
      setNewAddressLabel('');
      setNewAddressText('');
      toast.success('Address saved to profile');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Profile & Safety Settings"
        description="Manage your passenger profile, saved addresses, and emergency safety contacts"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="md:col-span-1 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="size-20 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold text-2xl mb-3">
              {user.first_name ? user.first_name[0] : 'U'}
            </div>
            <h3 className="font-bold text-base text-foreground">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            <Badge variant="secondary" className="mt-2.5 text-[10px]">
              Passenger Account
            </Badge>

            <div className="pt-6 border-t border-border mt-6 text-left space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5 text-primary" />
                <span>{user.phone || '+91 9876543211'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="size-3.5 text-primary" />
                <span>Preferred: Stripe / UPI</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Personal Details</CardTitle>
            <CardDescription>Update your contact and identification details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">First Name</label>
                <Input
                  value={user.first_name || ''}
                  onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
                <Input
                  value={user.last_name || ''}
                  onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <Input value={user.email || ''} disabled className="bg-muted/40 cursor-not-allowed" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <Input
                value={user.phone || ''}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </div>

            <Button onClick={handleSaveProfile} size="sm">
              <Save className="size-3.5 mr-1.5" /> Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Emergency SOS Contacts (Uber Safety Requirement) */}
      <Card id="sos" className="border-rose-200 dark:border-rose-900/50 shadow-sm">
        <CardHeader className="bg-rose-500/5 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-rose-600" />
            <CardTitle className="text-base text-rose-700 dark:text-rose-400">
              Emergency SOS & Trusted Contacts
            </CardTitle>
          </div>
          <CardDescription>
            During any trip, pressing Emergency SOS shares your real-time GPS location with these trusted contacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              placeholder="Contact Name"
              className="text-xs"
            />
            <Input
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
              placeholder="Phone (e.g. +919876543210)"
              className="text-xs"
            />
            <div className="flex items-center gap-2">
              <Input
                value={newContactRel}
                onChange={(e) => setNewContactRel(e.target.value)}
                placeholder="Relationship"
                className="text-xs"
              />
              <Button size="sm" onClick={handleAddEmergencyContact}>
                <Plus className="size-3.5" /> Add
              </Button>
            </div>
          </div>

          <div className="divide-y divide-border/60 pt-2">
            {contacts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-3">No emergency contacts added yet.</p>
            ) : (
              contacts.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground">{c.name}</span>
                    <span className="text-muted-foreground ml-2">({c.relationship || 'Contact'})</span>
                    <p className="text-muted-foreground">{c.phone}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Saved Addresses */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Saved Addresses</CardTitle>
          <CardDescription>Save frequently visited locations for fast 1-click booking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              value={newAddressLabel}
              onChange={(e) => setNewAddressLabel(e.target.value)}
              placeholder="Label (e.g. Gym, Friend)"
              className="text-xs"
            />
            <div className="sm:col-span-2 flex items-center gap-2">
              <Input
                value={newAddressText}
                onChange={(e) => setNewAddressText(e.target.value)}
                placeholder="Full street address..."
                className="text-xs"
              />
              <Button size="sm" variant="outline" onClick={handleAddSavedAddress}>
                <Plus className="size-3.5" /> Add
              </Button>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {savedAddresses.map((addr, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <div>
                    <span className="font-semibold">{addr.label}</span>
                    <p className="text-muted-foreground">{addr.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
