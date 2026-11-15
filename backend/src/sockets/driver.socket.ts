import { Server, Socket } from 'socket.io';
import { driverService } from '../services/driver.service';
import { memoryStore } from '../utils/store';

// Map of driverId -> socketId
export const connectedDrivers = new Map<string, string>();
// Map of socketId -> driverId
export const driverSockets = new Map<string, string>();

export function registerDriverHandlers(io: Server, socket: Socket) {
  socket.on('driver:join', async (data: { driverId: string }) => {
    connectedDrivers.set(data.driverId, socket.id);
    driverSockets.set(socket.id, data.driverId);
    socket.join(`driver:${data.driverId}`);
    console.log(`[Socket] Driver joined: ${data.driverId}`);
  });

  socket.on('driver:location-update', async (data: { driverId: string; lat: number; lng: number; rideId?: string }) => {
    try {
      await driverService.updateLocation(data.driverId, data.lat, data.lng);

      // If driver is currently on a ride, stream location to the customer in the ride room
      if (data.rideId) {
        io.to(`ride:${data.rideId}`).emit('ride:driver-location', {
          driverId: data.driverId,
          lat: data.lat,
          lng: data.lng,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('driver:toggle-online', async (data: { driverId: string; isOnline: boolean }) => {
    try {
      const updated = await driverService.updateOnlineStatus(data.driverId, data.isOnline);
      socket.emit('driver:status-updated', updated);
    } catch (err: any) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    const driverId = driverSockets.get(socket.id);
    if (driverId) {
      connectedDrivers.delete(driverId);
      driverSockets.delete(socket.id);
      console.log(`[Socket] Driver disconnected: ${driverId}`);
    }
  });
}
