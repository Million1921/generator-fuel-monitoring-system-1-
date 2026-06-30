import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString('hex')}`;
}

async function main() {
  const newPassword = process.env.ADMIN_PASSWORD;
  if (!newPassword) {
    throw new Error("Set ADMIN_PASSWORD before resetting passwords.");
  }

  const hashed = await hashPassword(newPassword);

  // Get all users
  const users = await prisma.user.findMany();
  console.log("Found users:");
  users.forEach(u => console.log(`  - ${u.email} (id: ${u.id})`));

  // Get all accounts  
  const accounts = await prisma.account.findMany();
  
  // Update password for credential accounts
  for (const account of accounts) {
    if (account.providerId === 'credential') {
      await prisma.account.update({
        where: { id: account.id },
        data: { password: hashed }
      });
      const user = users.find(u => u.id === account.userId);
      console.log(`✅ Password reset for: ${user?.email}`);
    }
  }
  
  console.log(`\n========================================`);
  console.log(`  Email:    admin@example.com`);
  console.log(`========================================`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
