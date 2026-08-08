import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';
import { AppError, ok } from '../lib/http.js';

export const categories = Router();
categories.get('/', async (_q,r,n)=>{try{ok(r,'Categories retrieved successfully',await prisma.category.findMany({where:{isDeleted:false},orderBy:{name:'asc'}}));}catch(e){n(e)}});
categories.get('/:id', async(q,r,n)=>{try{const d=await prisma.category.findFirst({where:{id:String(q.params.id),isDeleted:false}});if(!d)throw new AppError(404,'Category not found');ok(r,'Category retrieved successfully',d)}catch(e){n(e)}});
categories.post('/',auth,async(q,r,n)=>{try{ok(r,'Category created successfully',await prisma.category.create({data:q.body}),201)}catch(e){n(e)}});
categories.patch('/:id',auth,async(q,r,n)=>{try{ok(r,'Category updated successfully',await prisma.category.update({where:{id:String(q.params.id)},data:q.body}))}catch(e){n(e)}});
categories.delete('/:id',auth,async(q,r,n)=>{try{ok(r,'Category deleted successfully',await prisma.category.update({where:{id:String(q.params.id)},data:{isDeleted:true}}))}catch(e){n(e)}});

export const services = Router();
const serviceInclude={category:true,provider:{select:{id:true,name:true,avatar:true}},reviews:{where:{isDeleted:false}}} as const;
services.get('/',async(q,r,n)=>{try{const where={isDeleted:false,status:'ACTIVE' as const,...(q.query.categoryId?{categoryId:String(q.query.categoryId)}:{})};ok(r,'Services retrieved successfully',await prisma.service.findMany({where,include:serviceInclude,orderBy:{createdAt:'desc'}}))}catch(e){n(e)}});
services.get('/:id',async(q,r,n)=>{try{const d=await prisma.service.findFirst({where:{id:String(q.params.id),isDeleted:false},include:serviceInclude});if(!d)throw new AppError(404,'Service not found');ok(r,'Service retrieved successfully',d)}catch(e){n(e)}});
services.post('/',auth,async(q,r,n)=>{try{ok(r,'Service created successfully',await prisma.service.create({data:{...q.body,providerId:q.user!.id}}),201)}catch(e){n(e)}});
services.patch('/:id',auth,async(q,r,n)=>{try{ok(r,'Service updated successfully',await prisma.service.update({where:{id:String(q.params.id)},data:q.body}))}catch(e){n(e)}});
services.delete('/:id',auth,async(q,r,n)=>{try{ok(r,'Service deleted successfully',await prisma.service.update({where:{id:String(q.params.id)},data:{isDeleted:true}}))}catch(e){n(e)}});

export const users = Router(); users.use(auth);
users.get('/me',async(q,r,n)=>{try{ok(r,'Profile retrieved successfully',await prisma.user.findUnique({where:{id:q.user!.id},omit:{password:true}}))}catch(e){n(e)}});
users.get('/',async(_q,r,n)=>{try{ok(r,'Users retrieved successfully',await prisma.user.findMany({where:{isDeleted:false},omit:{password:true}}))}catch(e){n(e)}});
users.get('/:id',async(q,r,n)=>{try{const d=await prisma.user.findFirst({where:{id:String(q.params.id),isDeleted:false},omit:{password:true}});if(!d)throw new AppError(404,'User not found');ok(r,'User retrieved successfully',d)}catch(e){n(e)}});
users.patch('/:id',async(q,r,n)=>{try{const id=String(q.params.id);if(q.user!.id!==id&&q.user!.role!=='ADMIN')throw new AppError(403,'Forbidden');delete q.body.password;ok(r,'User updated successfully',await prisma.user.update({where:{id},data:q.body,omit:{password:true}}))}catch(e){n(e)}});
users.delete('/:id',async(q,r,n)=>{try{const id=String(q.params.id);if(q.user!.id!==id&&q.user!.role!=='ADMIN')throw new AppError(403,'Forbidden');ok(r,'User deleted successfully',await prisma.user.update({where:{id},data:{isDeleted:true},omit:{password:true}}))}catch(e){n(e)}});

export const reviews=Router();
reviews.get('/',async(q,r,n)=>{try{ok(r,'Reviews retrieved successfully',await prisma.review.findMany({where:{isDeleted:false,...(q.query.serviceId?{serviceId:String(q.query.serviceId)}:{})},include:{user:{select:{id:true,name:true,avatar:true}}}}))}catch(e){n(e)}});
reviews.get('/:id',async(q,r,n)=>{try{const d=await prisma.review.findFirst({where:{id:String(q.params.id),isDeleted:false}});if(!d)throw new AppError(404,'Review not found');ok(r,'Review retrieved successfully',d)}catch(e){n(e)}});
reviews.post('/',auth,async(q,r,n)=>{try{ok(r,'Review created successfully',await prisma.review.create({data:{...q.body,userId:q.user!.id}}),201)}catch(e){n(e)}});
reviews.patch('/:id',auth,async(q,r,n)=>{try{ok(r,'Review updated successfully',await prisma.review.update({where:{id:String(q.params.id),userId:q.user!.id},data:q.body}))}catch(e){n(e)}});
reviews.delete('/:id',auth,async(q,r,n)=>{try{ok(r,'Review deleted successfully',await prisma.review.update({where:{id:String(q.params.id),userId:q.user!.id},data:{isDeleted:true}}))}catch(e){n(e)}});

export const bookings=Router(); bookings.use(auth);
bookings.get('/',async(q,r,n)=>{try{ok(r,'Bookings retrieved successfully',await prisma.booking.findMany({where:{customerId:q.user!.id,isDeleted:false},include:{service:{include:{category:true,provider:{select:{name:true}}}}},orderBy:{scheduledAt:'desc'}}))}catch(e){n(e)}});
bookings.get('/:id',async(q,r,n)=>{try{const d=await prisma.booking.findFirst({where:{id:String(q.params.id),customerId:q.user!.id,isDeleted:false},include:{service:true}});if(!d)throw new AppError(404,'Booking not found');ok(r,'Booking retrieved successfully',d)}catch(e){n(e)}});
bookings.post('/',async(q,r,n)=>{try{const service=await prisma.service.findFirst({where:{id:q.body.serviceId,isDeleted:false,status:'ACTIVE'}});if(!service)throw new AppError(404,'Service not found');ok(r,'Booking created successfully',await prisma.booking.create({data:{...q.body,total:service.price,customerId:q.user!.id}}),201)}catch(e){n(e)}});
bookings.patch('/:id',async(q,r,n)=>{try{ok(r,'Booking updated successfully',await prisma.booking.update({where:{id:String(q.params.id),customerId:q.user!.id},data:q.body}))}catch(e){n(e)}});
bookings.delete('/:id',async(q,r,n)=>{try{ok(r,'Booking deleted successfully',await prisma.booking.update({where:{id:String(q.params.id),customerId:q.user!.id},data:{isDeleted:true}}))}catch(e){n(e)}});
