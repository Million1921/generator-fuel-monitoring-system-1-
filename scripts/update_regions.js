const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres:postgres@localhost:5432/ethio_telecom_fgams"
})

async function main() {
  try {
    const result = await prisma.site.updateMany({
      data: { region: "NAAR" }
    })
    console.log(`Updated ${result.count} sites to NAAR region.`)
  } catch (error) {
    console.error(error)
  }
}

main().finally(() => prisma.$disconnect())
