import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { config } from '../config/env';
import { registerDriverHandlers } from './driver.socket';
import { registerRideHandlers } from './ride.socket';

export function setupSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow frontend connection
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // Register domain handlers
    registerDriverHandlers(io, socket);
    registerRideHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
