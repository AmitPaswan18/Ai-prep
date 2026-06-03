
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debugData() {
  console.log('--- Interviews ---');
  const interviews = await prisma.interview.findMany({
    take: 10,
    select: { id: true, userId: true, isTemplate: true, title: true }
  });
  console.table(interviews);

  console.log('\n--- Users ---');
  const users = await prisma.user.findMany({
    take: 5,
    select: { id: true, clerkUserId: true, email: true }
  });
  console.table(users);
  
  const targetId = '34c76ba2-9bd7-45a8-b206-2e4389d52d8a';
  const target = await prisma.interview.findUnique({
    where: { id: targetId }
  });
  console.log('\n--- Target Interview ---');
  console.log(JSON.stringify(target, null, 2));
}

debugData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
