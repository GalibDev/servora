import 'dotenv/config'; import bcrypt from 'bcryptjs'; import { prisma as db } from '../src/lib/prisma.js';
async function main(){
 const password=await bcrypt.hash('Password123!',12);
 const provider=await db.user.upsert({where:{email:'provider@servora.com'},update:{},create:{name:'Ariana Rahman',email:'provider@servora.com',password,role:'PROVIDER',avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'}});
 await db.user.upsert({where:{email:'customer@servora.com'},update:{},create:{name:'Demo Customer',email:'customer@servora.com',password,role:'CUSTOMER'}});
 const rows=[['Home Cleaning','home-cleaning','⌂'],['Beauty & Wellness','beauty-wellness','✦'],['Repairs & Maintenance','repairs-maintenance','⌁'],['Moving Services','moving-services','→']];
 const cats=[]; for(const [name,slug,icon] of rows) cats.push(await db.category.upsert({where:{slug},update:{},create:{name,slug,icon}}));
 const count=await db.service.count(); if(!count){await db.service.createMany({data:[
  {title:'Deep Home Cleaning',description:'A complete top-to-bottom reset for your home, using eco-conscious products and a meticulous checklist.',price:89,duration:180,status:'ACTIVE',categoryId:cats[0].id,providerId:provider.id,image:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000'},
  {title:'Signature Wellness Massage',description:'A restorative in-home massage tailored to release tension and help you feel renewed.',price:110,duration:90,status:'ACTIVE',categoryId:cats[1].id,providerId:provider.id,image:'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1000'},
  {title:'Expert Handyman Visit',description:'Skilled help for mounting, repairs, fixtures and the small jobs that make a big difference.',price:65,duration:120,status:'ACTIVE',categoryId:cats[2].id,providerId:provider.id,image:'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?w=1000'}]})}
}
main().finally(()=>db.$disconnect());
