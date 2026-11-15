'use client';

import React, { useState, useEffect } from 'react';
import { Car, Plus, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { driverApi } from '@/services/api';
import { Vehicle, VehicleType } from '@/types';
import { toast } from 'sonner';

export default function DriverVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'vehicle-001',
      driver_id: 'driver-profile-001',
      type: VehicleType.SEDAN,
      make: 'Honda',
      model: 'City',
      year: 2022,
      color: 'White',
      license_plate: 'KA 01 MJ 5566',
      is_active: true,
      created_at: '2026-02-01T00:00:00.000Z',
      updated_at: '2026-02-01T00:00:00.000Z',
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [type, setType] = useState<VehicleType>(VehicleType.SEDAN);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2023);
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    driverApi
      .getProfile()
      .then((res) => {
        if (res.data?.vehicles?.length) {
          setVehicles(res.data.vehicles);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!make.trim() || !model.trim() || !plate.trim() || !color.trim()) {
      toast.error('All vehicle fields are required');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await driverApi.addVehicle({
        type,
        make,
        model,
        year: Number(year),
        color,
        license_plate: plate.toUpperCase(),
      });
      setVehicles([...vehicles, res.data]);
      setMake('');
      setModel('');
      setColor('');
      setPlate('');
      toast.success('Vehicle registered successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Vehicle Management"
        description="Manage your registered cars, bikes, or autos authorized for commercial ride operations"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Register New Vehicle Form */}
        <div className="md:col-span-5">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Vehicle</CardTitle>
              <CardDescription>Enter details of your vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVehicle} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as VehicleType)}
                    className="w-full text-xs rounded-md border border-input bg-transparent px-3 py-2 outline-none"
                  >
                    <option value={VehicleType.BIKE}>Bike / Two-Wheeler</option>
                    <option value={VehicleType.AUTO}>Auto Rickshaw</option>
                    <option value={VehicleType.MINI}>Mini (Hatchback)</option>
                    <option value={VehicleType.SEDAN}>Sedan (Prime)</option>
                    <option value={VehicleType.SUV}>SUV (6-Seater)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Make</label>
                    <Input
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      placeholder="e.g. Maruti / Honda"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Model</label>
                    <Input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Dzire / City"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Year</label>
                    <Input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Color</label>
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. White"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">License Plate</label>
                  <Input
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    placeholder="e.g. KA 01 MJ 5566"
                    className="text-xs uppercase font-mono"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full">
                  <Plus className="size-3.5 mr-1" /> Register Vehicle
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Vehicles */}
        <div className="md:col-span-7 space-y-3">
          {vehicles.map((v) => (
            <Card key={v.id} className="shadow-sm">
              <CardContent className="p-5 flex items-start justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    <Car className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {v.make} {v.model} ({v.year})
                      </span>
                      <Badge variant="success" className="text-[10px]">
                        Active Fleet
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Color: {v.color} &bull; Category: <strong className="uppercase">{v.type}</strong>
                    </p>
                    <div className="mt-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md border border-border bg-muted/50">
                        {v.license_plate}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
