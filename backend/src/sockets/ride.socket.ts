import { Server, Socket } from 'socket.io';
import { rideService } from '../services/ride.service';
import { driverService } from '../services/driver.service';
import { RideStatus, VehicleType } from '../types';
import { connectedDrivers } from './driver.socket';

export function registerRideHandlers(io: Server, socket: Socket) {
  // Join specific ride room for live tracking and status updates
  socket.on('ride:join', (data: { rideId: string }) => {
    socket.join(`ride:${data.rideId}`);
    console.log(`[Socket] Client ${socket.id} joined ride:${data.rideId}`);
  });

  socket.on('ride:leave', (data: { rideId: string }) => {
    socket.leave(`ride:${data.rideId}`);
    console.log(`[Socket] Client ${socket.id} left ride:${data.rideId}`);
  });

  // Customer broadcasts new ride request to nearby drivers
  socket.on('ride:request', async (data: { rideId: string; vehicleType: VehicleType; lat: number; lng: number }) => {
    try {
      const ride = await rideService.getRideById(data.rideId);
      const nearbyDrivers = await driverService.findNearbyDrivers(data.lat, data.lng, 10, data.vehicleType);

      // Emit to each connected nearby driver
      for (const item of nearbyDrivers) {
        const socketId = connectedDrivers.get(item.driver.id);
        if (socketId) {
          io.to(socketId).emit('driver:new-ride-request', {
            ride,
            distanceToPickup: item.distanceKm,
          });
        }
      }
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  // Driver accepts ride request
  socket.on('ride:accept', async (data: { rideId: string; driverId: string }) => {
    try {
      const updatedRide = await rideService.assignDriver(data.rideId, data.driverId);
      const fullRide = await rideService.getRideById(data.rideId);

      // Broadcast to ride room
      io.to(`ride:${data.rideId}`).emit('ride:accepted', fullRide);
      socket.emit('driver:ride-confirmed', fullRide);
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  // Status progression: driver_arriving -> arrived -> in_progress -> completed
  socket.on('ride:update-status', async (data: { rideId: string; status: RideStatus }) => {
    try {
      const updated = await rideService.updateRideStatus(data.rideId, data.status);
      const fullRide = await rideService.getRideById(data.rideId);

      io.to(`ride:${data.rideId}`).emit('ride:status-updated', fullRide);
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  // Cancel ride
  socket.on('ride:cancel', async (data: { rideId: string; reason: string; cancelledBy: string }) => {
    try {
      const cancelled = await rideService.updateRideStatus(
        data.rideId,
        RideStatus.CANCELLED,
        data.reason,
        data.cancelledBy
      );
      io.to(`ride:${data.rideId}`).emit('ride:cancelled', cancelled);
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });
}
