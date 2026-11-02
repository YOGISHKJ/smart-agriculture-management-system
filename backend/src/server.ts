import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging (Development)
if (config.nodeEnv === 'development') {
  app.use((req: Request, _res: Response, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// API Routes
app.use('/api', apiRouter);

// 404 Handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found on AgriPulse Backend API`
  });
});

// Central Error Handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`=========================================`);
    console.log(`🚀 AgriPulse Backend API running on port ${config.port}`);
    console.log(`📡 URL: http://localhost:${config.port}/api`);
    console.log(`🌐 Allowed CORS Origin: ${config.frontendUrl}`);
    console.log(`🗄️  PostgreSQL Target: ${config.databaseUrl.replace(/:[^:@]+@/, ':****@')}`);
    console.log(`🍃 MongoDB Target:    ${config.mongodbUri}`);
    console.log(`=========================================`);
  });
}

export default app;
