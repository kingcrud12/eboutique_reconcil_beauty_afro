// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Passw0rd!', 10);

  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {}, // idempotent: ne recrée pas si déjà présent
    create: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      isConfirmed: true,
    },
  });

  console.log('User seeded ✅');
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
