import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

let client: PrismaClient | undefined;

function getClient() {
  if (client) return client;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL environment variable is required');
  const adapter = new PrismaPg({ connectionString });
  client = new PrismaClient({ adapter });
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const activeClient = getClient();
    const value = Reflect.get(activeClient, property, activeClient);
    return typeof value === 'function' ? value.bind(activeClient) : value;
  },
});
