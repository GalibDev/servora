import 'dotenv/config'; import { app } from './app.js'; import { prisma } from './lib/prisma.js';
const port=Number(process.env.PORT)||5000;
const server=app.listen(port,()=>console.log(`Servora API running on http://localhost:${port}`));
const shutdown=async()=>{await prisma.$disconnect();server.close(()=>process.exit(0))}; process.on('SIGINT',shutdown); process.on('SIGTERM',shutdown);
