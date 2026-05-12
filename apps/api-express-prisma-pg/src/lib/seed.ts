import bcrypt from 'bcrypt';
import { prisma } from './prisma.ts';

async function seed() {
  const password = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', password, name: 'Demo User' }
  });

  await prisma.task.createMany({
    data: [
      { title: 'Set up project', status: 'DONE', userId: user.id },
      { title: 'Write tests', status: 'IN_PROGRESS', userId: user.id },
      { title: 'Deploy to production', status: 'TODO', userId: user.id }
    ],
    skipDuplicates: true
  });

  console.info('Seed complete');
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
