import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = 'changeme';
  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: '管理者',
      email: 'admin@example.com',
      passwordHash: hash,
    },
  });

  // find or create teams
  let teamA = await prisma.team.findFirst({ where: { name: 'チームA' } });
  if (!teamA) {
    teamA = await prisma.team.create({ data: { name: 'チームA', category: '小学生' } });
  }

  let teamB = await prisma.team.findFirst({ where: { name: 'チームB' } });
  if (!teamB) {
    teamB = await prisma.team.create({ data: { name: 'チームB', category: '小学生' } });
  }

  // Create sample players if they don't exist
  const p1 = await prisma.player.findFirst({ where: { name: '山田 太郎' } });
  if (!p1) {
    await prisma.player.create({ data: { teamId: teamA.id, uniformNumber: 1, name: '山田 太郎' } });
  }
  const p2 = await prisma.player.findFirst({ where: { name: '鈴木 次郎' } });
  if (!p2) {
    await prisma.player.create({ data: { teamId: teamB.id, uniformNumber: 2, name: '鈴木 次郎' } });
  }

  console.log('Seed finished:', { user: user.email, teamA: teamA.name, teamB: teamB.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
