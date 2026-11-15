'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, Mail, Lock, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'driver' | 'admin'>('customer');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      // Set active role and user identity in client store
      localStorage.setItem('uber_clone_role', role);
      if (role === 'customer') {
        localStorage.setItem('uber_clone_user_id', 'customer-user-001');
      } else if (role === 'driver') {
        localStorage.setItem('uber_clone_user_id', 'driver-user-001');
      } else {
        localStorage.setItem('uber_clone_user_id', 'admin-user-001');
      }

      toast.success(`Welcome back! Signed in as ${role.toUpperCase()}`);

      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'driver') router.push('/driver/dashboard');
      else router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign In to CabGo</h1>
          <p className="text-sm text-muted-foreground">Select your role to access your dedicated workspace</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 rounded-lg transition-all ${
              role === 'customer'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Passenger
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
            Driver
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`py-2 rounded-lg transition-all ${
              role === 'admin'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Admin
          </button>
        </div>

        <Card className="shadow-lg border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{role.toUpperCase()} Login</span>
              <Badge variant="outline" className="text-[10px]">
                {role === 'customer' ? 'Rider' : role === 'driver' ? 'Partner' : 'Staff'}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Demo accounts pre-configured for instant evaluation
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === 'customer'
                        ? 'customer@uberclone.com'
                        : role === 'driver'
                        ? 'driver@uberclone.com'
                        : 'admin@uberclone.com'
                    }
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full text-xs font-semibold py-2.5 mt-2">
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Don't have an account?</span>
              <Link href="/register" className="text-primary hover:underline font-semibold">
                Create Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
