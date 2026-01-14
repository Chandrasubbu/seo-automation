import { prisma } from './lib/db'; async function main() { const users = await prisma.user.findMany(); console.log(users); } main();
