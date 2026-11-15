import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './constants';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to server:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection warning:', error.message);
    });
  }

  return socket;
}
