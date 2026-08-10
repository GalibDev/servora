import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma as db } from '../src/lib/prisma.js';

async function main() {
  const password = await bcrypt.hash('Password123!', 12);
  const provider = await db.user.upsert({ where: { email: 'provider@servora.com' }, update: {}, create: { name: 'Ariana Rahman', email: 'provider@servora.com', password, role: 'PROVIDER', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' } });
  const customer = await db.user.upsert({ where: { email: 'customer@servora.com' }, update: {}, create: { name: 'Demo Customer', email: 'customer@servora.com', password, role: 'CUSTOMER' } });
  await db.user.upsert({ where: { email: 'admin@servora.com' }, update: {}, create: { name: 'Servora Admin', email: 'admin@servora.com', password, role: 'ADMIN' } });

  const categoryRows = [
    ['Home Cleaning', 'home-cleaning', '⌂'], ['Beauty & Wellness', 'beauty-wellness', '✦'],
    ['Repairs & Maintenance', 'repairs-maintenance', '⌁'], ['Moving Services', 'moving-services', '→'],
    ['Pet Care', 'pet-care', '♡'], ['Learning & Tutoring', 'learning-tutoring', 'A+'],
  ];
  const categories = new Map<string, string>();
  for (const [name, slug, icon] of categoryRows) {
    const category = await db.category.upsert({ where: { slug }, update: { icon, isDeleted: false }, create: { name, slug, icon } });
    categories.set(slug, category.id);
  }

  const serviceRows = [
    ['Deep Home Cleaning', 'A complete top-to-bottom reset for your home, using eco-conscious products and a meticulous checklist.', 89, 180, 'home-cleaning', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000'],
    ['Weekly Home Refresh', 'A reliable weekly clean covering kitchens, bathrooms, floors and high-touch surfaces.', 55, 120, 'home-cleaning', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1000'],
    ['Signature Wellness Massage', 'A restorative in-home massage tailored to release tension and help you feel renewed.', 110, 90, 'beauty-wellness', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1200'],
    ['At-Home Glow Facial', 'A personalized facial with cleansing, exfoliation and hydration for a natural glow.', 78, 60, 'beauty-wellness', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1000'],
    ['Expert Handyman Visit', 'Skilled help for mounting, repairs, fixtures and the small jobs that make a big difference.', 65, 120, 'repairs-maintenance', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200'],
    ['Electrical Safety Check', 'A certified inspection of outlets, switches and common electrical concerns in your home.', 95, 90, 'repairs-maintenance', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1000'],
    ['Stress-Free Moving Help', 'Two careful professionals to help pack, lift and settle your essentials safely.', 140, 180, 'moving-services', 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1000'],
    ['Dog Walking & Play', 'A joyful neighborhood walk with exercise, fresh water and a photo update.', 24, 45, 'pet-care', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1000'],
    ['Math Tutoring Session', 'Friendly one-to-one support for school mathematics, homework and exam confidence.', 42, 60, 'learning-tutoring', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000'],
  ] as const;

  const createdServices = new Map<string, string>();
  for (const [title, description, price, duration, categorySlug, image] of serviceRows) {
    const existing = await db.service.findFirst({ where: { title, providerId: provider.id } });
    const service = existing ? await db.service.update({ where: { id: existing.id }, data: { description, price, duration, image, status: 'ACTIVE', isDeleted: false, categoryId: categories.get(categorySlug)! } }) : await db.service.create({ data: { title, description, price, duration, image, status: 'ACTIVE', providerId: provider.id, categoryId: categories.get(categorySlug)! } });
    createdServices.set(title, service.id);
  }

  const completedServiceId = createdServices.get('Deep Home Cleaning')!;
  const upcomingServiceId = createdServices.get('Signature Wellness Massage')!;
  let completedBooking = await db.booking.findFirst({ where: { customerId: customer.id, serviceId: completedServiceId, address: '12 Lakeview Avenue' } });
  if (!completedBooking) completedBooking = await db.booking.create({ data: { customerId: customer.id, serviceId: completedServiceId, address: '12 Lakeview Avenue', note: 'Please focus on the kitchen.', total: 89, status: 'COMPLETED', scheduledAt: new Date(Date.now() - 7 * 86400000) } });
  const upcomingBooking = await db.booking.findFirst({ where: { customerId: customer.id, serviceId: upcomingServiceId, address: '44 Garden Road' } });
  if (!upcomingBooking) await db.booking.create({ data: { customerId: customer.id, serviceId: upcomingServiceId, address: '44 Garden Road', note: 'Evening appointment preferred.', total: 110, status: 'CONFIRMED', scheduledAt: new Date(Date.now() + 5 * 86400000) } });

  await db.review.upsert({ where: { userId_serviceId: { userId: customer.id, serviceId: completedServiceId } }, update: { rating: 5, comment: 'Wonderful attention to detail—my home felt completely refreshed.', isDeleted: false }, create: { userId: customer.id, serviceId: completedServiceId, rating: 5, comment: 'Wonderful attention to detail—my home felt completely refreshed.' } });
  console.log('Servora seed completed: 3 users, 6 categories, 9 services, 2 bookings and 1 review are ready.');
}

main().finally(() => db.$disconnect());
