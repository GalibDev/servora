import express from 'express'; import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import { bookings, categories, reviews, services, users } from './routes/resource.routes.js';
import { errorHandler } from './middleware/error.js';
export const app=express();
app.use(cors({origin:process.env.CLIENT_URL?.split(',')||true,credentials:true})); app.use(express.json());
app.get('/api/health',(_q,r)=>r.json({success:true,message:'Servora API is healthy',data:{timestamp:new Date(),databaseConfigured:Boolean(process.env.DATABASE_URL),jwtConfigured:Boolean(process.env.JWT_SECRET)}}));
app.use('/api/auth',authRoutes); app.use('/api/users',users); app.use('/api/categories',categories); app.use('/api/services',services); app.use('/api/reviews',reviews); app.use('/api/bookings',bookings);
app.use((_q,r)=>r.status(404).json({success:false,message:'Route not found',data:null})); app.use(errorHandler);
