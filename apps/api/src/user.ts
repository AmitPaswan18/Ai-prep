import { prisma } from "@repo/db";

export async function getOrCreateUser(clerkUser: {
    id: string;
    email: string;
    name?: string;
}) {
    const existing = await prisma.user.findUnique({
        where: { clerkUserId: clerkUser.id },
    });

    if (existing) return existing;

    return prisma.user.create({
        data: {
            clerkUserId: clerkUser.id,
            email: clerkUser.email,
            name: clerkUser.name,
        },
    });
}
