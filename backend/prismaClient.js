import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['error', 'warn'], // Chỉ log những gì quan trọng để tránh làm lag server
});

export default prisma;
