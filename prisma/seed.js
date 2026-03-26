const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const bcrypt = require('bcryptjs');
require('dotenv/config');

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@gt.com' },
    update: {},
    create: {
      email: 'admin@gt.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'admin',
    },
  });
  console.log('✅ Admin created');

  const charities = [
    { name: "Children's Hospital Foundation", description: 'Supporting pediatric healthcare and research.' },
    { name: 'Environmental Conservation Trust', description: 'Protecting natural habitats for future generations.' },
    { name: 'Education Access Initiative', description: 'Providing education to underserved communities.' },
    { name: 'Local Food Bank Network', description: 'Fighting hunger with nutritious meals for families.' },
  ];

  for (const charity of charities) {
    await prisma.charity.upsert({
      where: { name: charity.name },
      update: {},
      create: charity,
    });
  }

  console.log('✅ Charities seeded');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());