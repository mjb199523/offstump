import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding fake data...')

    // Clean
    await prisma.booking.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.service.deleteMany()
    await prisma.admin.deleteMany()

    // Admin
    await prisma.admin.create({
        data: {
            email: "admin@offstump.com",
            passwordHash: "12345", // dummy
            name: "Admin User",
            role: "ADMIN"
        }
    })

    // Services
    const cricket = await prisma.service.create({
        data: {
            name: "Cricket Turf Hourly",
            pricePerHour: 1200,
            description: "Standard Box Cricket Turf (1 hour)",
        }
    })

    const yoga = await prisma.service.create({
        data: {
            name: "Yoga Session",
            pricePerHour: 500,
            description: "Morning Yoga Class (Drop-in)",
        }
    })

    // Customers
    const sources = ["WALK_IN", "INSTAGRAM", "REFERRAL", "WEBSITE"]
    const customers = []
    for (let i = 1; i <= 20; i++) {
        const cust = await prisma.customer.create({
            data: {
                fullName: `Test Customer ${i}`,
                phoneNumber: `98765432${i.toString().padStart(2, '0')}`,
                email: `tester${i}@example.com`,
                source: sources[Math.floor(Math.random() * sources.length)] as any,
                totalVisits: 0,
                totalMoneySpent: 0
            }
        });
        customers.push(cust);
    }

    // Bookings 
    const statuses = ["COMPLETED", "CONFIRMED", "CANCELLED"]

    // create some past and future bookings
    for (let i = 0; i < 40; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)]
        const service = Math.random() > 0.3 ? cricket : yoga
        const status = statuses[Math.floor(Math.random() * statuses.length)]

        // random date between -30 and +10 days
        const daysOffset = Math.floor(Math.random() * 40) - 30
        const date = new Date()
        date.setDate(date.getDate() + daysOffset)
        date.setHours(0, 0, 0, 0)

        const startTime = new Date(date)
        startTime.setHours(Math.floor(Math.random() * 12) + 8, 0, 0, 0) // 8am to 8pm

        const endTime = new Date(startTime)
        endTime.setHours(startTime.getHours() + 1)

        // Using query raw or individual create to bypass complex aggregation in seed
        const booking = await prisma.booking.create({
            data: {
                customerId: customer.id,
                serviceId: service.id,
                date: date,
                startTime: startTime,
                endTime: endTime,
                amountPaid: status !== 'CANCELLED' ? service.pricePerHour : 0,
                paymentMode: "UPI",
                status: status as any
            }
        })

        if (status === 'COMPLETED') {
            await prisma.customer.update({
                where: { id: customer.id },
                data: {
                    totalVisits: { increment: 1 },
                    totalMoneySpent: { increment: booking.amountPaid },
                    lastVisitDate: date
                }
            })
        }
    }

    console.log('Seeding complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
