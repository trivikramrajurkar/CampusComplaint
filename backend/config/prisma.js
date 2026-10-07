import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // The hosted PostgreSQL instance can have cold starts; allow enough time for
  // the small, atomic lifecycle transactions without querying again in them.
  transactionOptions: { maxWait: 10000, timeout: 15000 },
});

export default prisma;
