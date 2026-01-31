import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'
import { generateCode, hashToken } from '../lib/crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  console.log('Creating admin user...')
  const adminUsername = process.env.ADMIN_USERNAME || 'LionsClubeGaia'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Lionsclubegaia@'
  
  const admin = await prisma.admin.upsert({
    where: { username: adminUsername },
    update: {
      password: await hashPassword(adminPassword),
    },
    create: {
      username: adminUsername,
      password: await hashPassword(adminPassword),
    },
  })
  console.log(`✅ Admin user created: ${admin.username}`)

  // Create a sample election
  console.log('Creating sample election...')
  const election = await prisma.election.create({
    data: {
      title: 'Eleição do Presidente do Lions Clube Gaia 2026',
      description: 'Eleição anual para escolher o presidente do clube',
      startDate: new Date('2026-02-01T09:00:00'),
      endDate: new Date('2026-02-01T18:00:00'),
      isActive: true,
      candidates: {
        create: [
          {
            name: 'João Silva',
            description: 'Membro desde 2015, experiência em gestão',
            order: 0,
          },
          {
            name: 'Maria Santos',
            description: 'Membro desde 2018, coordenadora de eventos',
            order: 1,
          },
          {
            name: 'Pedro Costa',
            description: 'Membro desde 2020, tesoureiro atual',
            order: 2,
          },
        ],
      },
    },
    include: {
      candidates: true,
    },
  })
  console.log(`✅ Election created: ${election.title}`)
  console.log(`✅ ${election.candidates.length} candidates created`)

  // Generate 10 voting codes
  console.log('Generating voting codes...')
  const codes = []
  for (let i = 0; i < 10; i++) {
    const code = generateCode()
    const tokenHash = hashToken(code)
    codes.push({
      code,
      tokenHash,
      electionId: election.id,
    })
  }

  await prisma.votingCode.createMany({
    data: codes,
  })
  console.log(`✅ ${codes.length} voting codes generated`)
  console.log('\nSample voting codes:')
  codes.forEach((c, i) => {
    if (i < 5) console.log(`  ${c.code}`)
  })
  console.log('  ...')

  console.log('\n✅ Database seeded successfully!')
  console.log('\nLogin credentials:')
  console.log(`  Username: ${adminUsername}`)
  console.log(`  Password: ${adminPassword}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
