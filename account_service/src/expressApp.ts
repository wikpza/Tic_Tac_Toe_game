import express, { Request, Response, NextFunction } from 'express';
import userRoutes from './api/user.routes';
import playRoutes from './api/play.routes'
import http from 'http';
import socketIo from 'socket.io';

// Создание экземпляра приложения Express
const app = express();
app.use(express.json());
app.use('/user', userRoutes);
app.use('/play', playRoutes)
export default app