import { prisma } from "../config/prisma.js";


export async function getFinishedUsedServices(email: string) {
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
    });
    if (!user) return [];

    const services = await prisma.service.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        include: {
            profession: { select: { name: true } },
            provider: { select: { name: true, lastName: true } },
            address: {
                select: {
                    street: true,
                    number: true,
                    postalCode: true,
                    country: true,
                    province: true,
                    floor: true,
                },
            },
        },
    });

    return services.map((s) => ({
        id: String(s.id),
        name: s.provider.name,
        lastName: s.provider.lastName,
        profession: s.profession.name,
        date: s.date.toISOString(),
        state: s.state,
        address: {
            street: s.address.street,
            number: s.address.number,
            postalCode: s.address.postalCode,
            country: s.address.country,
            province: s.address.province,
            floor: s.address.floor,
        },
    }));
}
