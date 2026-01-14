
import { prisma } from './lib/db';

async function main() {
    try {
        let user = await prisma.user.findFirst();
        if (!user) {
            console.log("No user found, creating one...");
            user = await prisma.user.create({
                data: {
                    email: 'test@example.com',
                    name: 'Test User',
                    password: 'password123', // In real app should be hashed
                    role: 'user'
                }
            });
        }
        console.log("USER_ID:", user.id);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
