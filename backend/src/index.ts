import http from 'http';
import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { setupSocketIO } from './sockets/socket';

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
export const io = setupSocketIO(httpServer);

// Security and standard middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(morgan('dev'));

// Rate limiting
app.use(generalLimiter);

// Stripe webhook requires raw body; handle it before json parser if needed
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded assets statically
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Root welcome endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Uber Clone Cab Booking API',
    documentation: '/api/v1/health',
    status: 'online',
  });
});

// Mount API routes
app.use('/api/v1', apiRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = config.port || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚕 Cab Booking Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO server initialized on port ${PORT}`);
  console.log(`🩺 Health check available at http://localhost:${PORT}/api/v1/health`);
});

export default app;
