const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'test@finfolio.com'

  // Skip if already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`User already exists — id: ${existing.id}, email: ${existing.email}`)
    console.log('Password: Test1234!')
    return
  }

  const hashed = await bcrypt.hash('Test1234!', 10)

  const user = await prisma.user.create({
    data: {
      name:     'Demo User',
      email,
      password: hashed,
      watchlist: {
        create: [
          { symbol: 'AAPL' },
          { symbol: 'NVDA' },
          { symbol: 'BTC'  },
          { symbol: 'TSLA' },
        ]
      },
      holdings: {
        create: [
          { symbol: 'AAPL', shares: 10,  buyPrice: 172.50, buyDate: new Date('2024-01-15') },
          { symbol: 'TSLA', shares: 5,   buyPrice: 245.00, buyDate: new Date('2024-03-10') },
          { symbol: 'NVDA', shares: 8,   buyPrice: 495.00, buyDate: new Date('2024-02-20') },
          { symbol: 'MSFT', shares: 3,   buyPrice: 380.00, buyDate: new Date('2024-04-05') },
          { symbol: 'AMZN', shares: 6,   buyPrice: 178.00, buyDate: new Date('2024-05-01') },
        ]
      },
    }
  })

  console.log(`\nDummy user created successfully`)
  console.log(`  ID:       ${user.id}`)
  console.log(`  Name:     ${user.name}`)
  console.log(`  Email:    ${user.email}`)
  console.log(`  Password: Test1234!`)
  console.log(`\nWatchlist: AAPL, NVDA, BTC, TSLA`)
  console.log(`Holdings:  AAPL ×10, TSLA ×5, NVDA ×8, MSFT ×3, AMZN ×6`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
