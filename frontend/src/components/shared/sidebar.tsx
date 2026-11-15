'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Clock,
  User,
  HelpCircle,
  Car,
  DollarSign,
  FileText,
  Users,
  ShieldAlert,
  CreditCard,
  Tag,
  Sliders,
  LifeBuoy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

function SidebarInner({ role }: { role: 'customer' | 'driver' | 'admin' }) {
  const pathname = usePathname();

  const customerItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Book a Ride', href: '/book-ride', icon: MapPin },
    { label: 'My Rides', href: '/rides', icon: Clock },
    { label: 'Profile & Settings', href: '/profile', icon: User },
    { label: 'Help & Support', href: '/support', icon: HelpCircle },
  ];

  const driverItems: NavItem[] = [
    { label: 'Dashboard', href: '/driver/dashboard', icon: LayoutDashboard },
    { label: 'My Trips', href: '/driver/rides', icon: Clock },
    { label: 'Earnings', href: '/driver/earnings', icon: DollarSign },
    { label: 'My Vehicles', href: '/driver/vehicles', icon: Car },
    { label: 'Documents', href: '/driver/documents', icon: FileText },
    { label: 'Driver Profile', href: '/driver/profile', icon: User },
  ];

  const adminItems: NavItem[] = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Drivers & Approval', href: '/admin/drivers', icon: ShieldAlert },
    { label: 'All Rides', href: '/admin/rides', icon: Clock },
    { label: 'Transactions', href: '/admin/payments', icon: CreditCard },
    { label: 'Promo Codes', href: '/admin/promo-codes', icon: Tag },
    { label: 'Fare Settings', href: '/admin/fare-settings', icon: Sliders },
    { label: 'Support Tickets', href: '/admin/support', icon: LifeBuoy },
  ];

  const items = role === 'admin' ? adminItems : role === 'driver' ? driverItems : customerItems;

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card/60 backdrop-blur min-h-[calc(100vh-4rem)] hidden md:block p-4">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {role} Menu
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/driver/dashboard' && item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export function Sidebar({ role }: { role: 'customer' | 'driver' | 'admin' }) {
  return (
    <Suspense fallback={<aside className="w-64 shrink-0 border-r border-border bg-card/60 hidden md:block p-4" />}>
      <SidebarInner role={role} />
    </Suspense>
  );
}
