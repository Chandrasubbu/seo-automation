import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Connecting to database...');
    try {
        // Attempt to query the table metadata directly via raw query
        const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`;
        console.log('Tables in database:', result);

        console.log('Checking AeoAnalysis count...');
        try {
            const count = await prisma.aeoAnalysis.count();
            console.log('AeoAnalysis count:', count);
        } catch (e) {
            console.error('Failed to count AeoAnalysis:', e);
        }
    } catch (e) {
        console.error('Error connecting/querying:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
