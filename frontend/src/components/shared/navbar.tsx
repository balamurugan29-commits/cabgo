'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Car,
  Bell,
  Sun,
  Moon,
  Shield,
  User,
  ChevronDown,
  Navigation,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notificationApi } from '@/services/api';
import { Notification } from '@/types';

function NavbarInner() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [currentRole, setCurrentRole] = useState<'customer' | 'driver' | 'admin'>('customer');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRole = (localStorage.getItem('uber_clone_role') as any) || 'customer';
      setCurrentRole(storedRole);
    }
  }, [pathname]);

  useEffect(() => {
    notificationApi
      .getUnreadCount()
      .then((res) => setUnreadCount(res.data.unreadCount))
      .catch(() => {});
  }, [pathname]);

  const switchRole = (role: 'customer' | 'driver' | 'admin') => {
    localStorage.setItem('uber_clone_role', role);
    setCurrentRole(role);
    setShowRoleMenu(false);

    if (role === 'customer') router.push('/dashboard');
    else if (role === 'driver') router.push('/driver/dashboard');
    else if (role === 'admin') router.push('/admin/dashboard');
  };

  const loadNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      try {
        const res = await notificationApi.getAll();
        setNotifications(res.data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <div className="flex items-center justify-center size-9 rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Car className="size-5" />
            </div>
            <span>
              Cab<span className="text-primary font-black">Go</span>
            </span>
          </Link>

          {/* Quick Module Switcher Pill */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/40 hover:bg-muted text-xs font-medium transition-colors"
            >
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Role: <strong className="capitalize">{currentRole}</strong></span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>

            {showRoleMenu && (
              <div className="absolute left-0 mt-2 w-48 rounded-xl border border-border bg-card p-1.5 shadow-lg z-50">
                <button
                  onClick={() => switchRole('customer')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left ${currentRole === 'customer' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <span className="flex items-center gap-2">
                    <User className="size-3.5" /> Customer View
                  </span>
                  {currentRole === 'customer' && <CheckCircle2 className="size-3.5" />}
                </button>
                <button
                  onClick={() => switchRole('driver')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left ${currentRole === 'driver' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <span className="flex items-center gap-2">
                    <Navigation className="size-3.5" /> Driver View
                  </span>
                  {currentRole === 'driver' && <CheckCircle2 className="size-3.5" />}
                </button>
                <button
                  onClick={() => switchRole('admin')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left ${currentRole === 'admin' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="size-3.5" /> Admin Panel
                  </span>
                  {currentRole === 'admin' && <CheckCircle2 className="size-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right action bar */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={loadNotifications}
              className="relative rounded-full"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  <Badge variant="secondary" className="text-[10px]">
                    {notifications.length} Total
                  </Badge>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-border/60 py-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="py-2">
                        <p className="text-xs font-semibold text-foreground">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
                        <span className="text-[9px] text-muted-foreground/80 mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Current User pill */}
          <Link
            href={currentRole === 'driver' ? '/driver/profile' : currentRole === 'admin' ? '/admin/dashboard' : '/profile'}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-border bg-muted/30 hover:bg-muted text-xs font-medium transition-colors"
          >
            <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
              {currentRole === 'admin' ? 'A' : currentRole === 'driver' ? 'D' : 'C'}
            </div>
            <span className="capitalize hidden sm:inline">{currentRole}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 w-full border-b border-border bg-background" />}>
      <NavbarInner />
    </Suspense>
  );
}
