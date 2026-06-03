
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function checkInterview() {
  const interviewId = '34c76ba2-9bd7-45a8-b206-2e4389d52d8a';
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });
  
  console.log('Target Interview:', JSON.stringify(interview, null, 2));
}

checkInterview()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
