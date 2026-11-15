'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Mail, Lock, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'driver'>('customer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !password) {
      toast.error('Please fill out all required fields');
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem('uber_clone_role', role);
      if (role === 'customer') {
        localStorage.setItem('uber_clone_user_id', 'customer-user-001');
      } else {
        localStorage.setItem('uber_clone_user_id', 'driver-user-001');
      }

      toast.success(`Account registered successfully as ${role.toUpperCase()}!`);
      if (role === 'driver') {
        router.push('/driver/documents');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex size-12 rounded-2xl bg-primary text-primary-foreground items-center justify-center shadow-lg shadow-primary/20">
            <Car className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your CabGo Account</h1>
          <p className="text-sm text-muted-foreground">Sign up as a rider or apply to drive with us</p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 rounded-lg transition-all ${
              role === 'customer'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            I am a Passenger
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`py-2 rounded-lg transition-all ${
              role === 'driver'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            I want to Drive
          </button>
        </div>

        <Card className="shadow-lg border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{role === 'customer' ? 'Rider Registration' : 'Driver Partner Onboarding'}</span>
              <Badge variant="outline" className="text-[10px]">
                {role === 'customer' ? 'Instant Activation' : 'Requires Verification'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              {role === 'customer'
                ? 'Book quick, affordable, and safe rides across the city'
                : 'Earn on your schedule with competitive platform payouts'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">First Name</label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Last Name</label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Morgan"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.morgan@example.com"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              {role === 'driver' && (
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Driver's License Number</label>
                  <Input
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="KA01 20240001234"
                    className="text-xs font-mono"
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full text-xs font-semibold py-2.5 mt-2">
                {loading ? 'Creating Account...' : 'Complete Registration'}
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Already registered?</span>
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
