'use client';

import React from 'react';
import Link from 'next/link';
import {
  Car,
  Bike,
  Zap,
  ShieldCheck,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  Users,
  Navigation,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/shared/navbar';

export default function HomePage() {
  const vehicleCards = [
    { name: 'Moto Bike', fare: '₹25', time: '2 mins', icon: Bike, desc: 'Beat the traffic solo at lowest prices', color: 'text-amber-500' },
    { name: 'Auto Rickshaw', fare: '₹30', time: '3 mins', icon: Zap, desc: 'Everyday doorstep rides for up to 3 people', color: 'text-emerald-500' },
    { name: 'Mini Comfort', fare: '₹50', time: '4 mins', icon: Car, desc: 'Compact AC hatchbacks for daily commute', color: 'text-blue-500' },
    { name: 'Prime Sedan', fare: '₹80', time: '5 mins', icon: ShieldCheck, desc: 'Spacious sedans with top-rated drivers', color: 'text-indigo-500' },
    { name: 'Prime SUV', fare: '₹100', time: '7 mins', icon: Truck, desc: '6-seater spacious cabins for family travel', color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-border bg-radial from-primary/10 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
                <Sparkles className="size-3.5" />
                <span>Modern Full-Stack Ride Hailing System</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
                Request a ride now. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
                  Arrive safely & comfortably.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
                Experience seamless urban mobility. Choose from bikes, autos, sedans, and SUVs with instant driver matching, live GPS telemetry, verified drivers, and secure Stripe checkout.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link href="/book-ride">
                  <Button size="lg" className="h-12 px-6 font-bold shadow-md">
                    <Car className="size-4 mr-2" /> Book a Ride Now
                  </Button>
                </Link>
                <Link href="/driver/dashboard">
                  <Button size="lg" variant="outline" className="h-12 px-6 font-semibold">
                    <Navigation className="size-4 mr-2" /> Driver Partner Portal
                  </Button>
                </Link>
                <Link href="/admin/dashboard">
                  <Button size="lg" variant="ghost" className="h-12 px-4 text-xs text-muted-foreground hover:text-foreground">
                    Admin Console &rarr;
                  </Button>
                </Link>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/80 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Real-time GPS tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Verified fleet drivers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  <span>Stripe & UPI ready</span>
                </div>
              </div>
            </div>

            {/* Right Card Mockup */}
            <div className="lg:col-span-5">
              <Card className="shadow-2xl border-border bg-card/90 backdrop-blur">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider">Fast Booking Demo</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">OSRM Live Routing</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-3 text-xs">
                      <div className="size-2.5 rounded-full bg-blue-600 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Pickup</p>
                        <p className="font-semibold text-foreground">Koramangala 4th Block, Bengaluru</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-3 text-xs">
                      <div className="size-2.5 rounded-full bg-emerald-600 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">Destination</p>
                        <p className="font-semibold text-foreground">Indiranagar 100ft Road, Bengaluru</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Available Categories</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg border border-primary bg-primary/5 flex items-center justify-between text-xs">
                        <span className="font-semibold">Prime Sedan</span>
                        <span className="font-bold text-primary">₹190</span>
                      </div>
                      <div className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between text-xs text-muted-foreground">
                        <span>Moto Bike</span>
                        <span>₹45</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/book-ride" className="block pt-2">
                    <Button className="w-full font-bold">
                      Launch Interactive Booking Flow &rarr;
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="text-xs mb-2">Vehicles For Every Need</Badge>
          <h2 className="text-3xl font-bold tracking-tight">Select your ride tier</h2>
          <p className="text-sm text-muted-foreground mt-1">
            From single-commute two wheelers to 6-seater premium SUVs, all configured with dynamic pricing rules
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {vehicleCards.map((v) => {
            const Icon = v.icon;
            return (
              <Card key={v.name} className="hover:shadow-md hover:border-primary/50 transition-all">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className={`p-3 rounded-xl bg-muted/60 w-fit mb-3 ${v.color}`}>
                      <Icon className="size-6" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">{v.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{v.desc}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">From {v.fare}</span>
                    <Badge variant="secondary" className="text-[10px]">{v.time}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Three Complete Modules */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Three Integrated Role Portals</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Fully built and connected end-to-end to backend APIs and real-time Socket.IO channels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Module */}
            <Card className="shadow-sm border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <Users className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">1. Passenger Module</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pickup/dropoff selection with OpenStreetMap, multi-stop trips, promo codes, driver tracking, Stripe payments, and driver ratings.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Open Customer Dashboard <ArrowRight className="size-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Driver Module */}
            <Card className="shadow-sm border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Navigation className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">2. Driver Module</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Online/offline toggle, real-time incoming dispatches, accept/reject requests, turn-by-turn state progression, earnings breakdown, and vehicle management.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/driver/dashboard">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Open Driver Dashboard <ArrowRight className="size-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Admin Module */}
            <Card className="shadow-sm border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">3. Admin Module</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Driver document verification & approval, customer account controls, platform commission management, dynamic fare calculator, and promo codes.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Open Admin Console <ArrowRight className="size-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Car className="size-4 text-primary" />
            <span className="font-bold text-foreground">CabGo Inc.</span> &bull; Production Uber Clone Platform
          </div>
          <div>
            <span>Powered by Next.js 14 &bull; Node.js Express &bull; Supabase &bull; Socket.IO &bull; Stripe</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
