'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Star,
  Car,
  Phone,
  Mail,
  ShieldCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { driverApi, authApi } from '@/services/api';
import { toast } from 'sonner';

export default function DriverProfilePage() {
  const [driverUser, setDriverUser] = useState<any>({
    first_name: 'Rajesh',
    last_name: 'Kumar',
    email: 'driver@uberclone.com',
    phone: '+919876543212',
  });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driverApi
      .getProfile()
      .then((res) => {
        if (res.data?.user) setDriverUser(res.data.user);
        if (res.data?.profile) setProfile(res.data.profile);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    try {
      await authApi.updateProfile({
        first_name: driverUser.first_name,
        last_name: driverUser.last_name,
        phone: driverUser.phone,
      });
      toast.success('Driver profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Driver Profile & Ratings"
        description="View your passenger satisfaction scores, vehicle authorization, and contact info"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Driver Card */}
        <Card className="md:col-span-1 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="size-20 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center font-bold text-2xl mb-3">
              👨‍✈️
            </div>
            <h3 className="font-bold text-base text-foreground">
              {driverUser.first_name} {driverUser.last_name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{driverUser.email}</p>

            <div className="mt-3 flex items-center justify-center gap-1 text-amber-500 font-bold text-sm">
              <Star className="size-4 fill-current" />
              <span>{profile?.average_rating || 4.88} / 5.0</span>
            </div>

            <Badge variant="success" className="mt-3 text-[10px]">
              <CheckCircle2 className="size-3 mr-1" /> Approved & Verified Driver
            </Badge>

            <div className="pt-6 border-t border-border mt-6 text-left space-y-2.5 text-xs text-muted-foreground">
              <p>Total Completed Rides: <strong className="text-foreground">{profile?.total_rides || 142}</strong></p>
              <p>Acceptance Rate: <strong className="text-foreground">98.5%</strong></p>
              <p>Cancellation Rate: <strong className="text-foreground">1.2%</strong></p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Personal Details</CardTitle>
            <CardDescription>Keep your contact details up to date for passenger communications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">First Name</label>
                <Input
                  value={driverUser.first_name || ''}
                  onChange={(e) => setDriverUser({ ...driverUser, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
                <Input
                  value={driverUser.last_name || ''}
                  onChange={(e) => setDriverUser({ ...driverUser, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Registered Email</label>
              <Input value={driverUser.email || ''} disabled className="bg-muted/40 cursor-not-allowed" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
              <Input
                value={driverUser.phone || ''}
                onChange={(e) => setDriverUser({ ...driverUser, phone: e.target.value })}
              />
            </div>

            <Button onClick={handleSaveProfile} size="sm">
              <Save className="size-3.5 mr-1.5" /> Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
