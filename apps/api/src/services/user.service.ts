import { prisma } from "@repo/db";

type ClerkUserPayload = {
    clerkUserId: string;
    email: string;
    name?: string;
};

export async function getOrCreateUser({
    clerkUserId,
    email,
    name,
}: ClerkUserPayload) {
    const existingUser = await prisma.user.findUnique({
        where: { clerkUserId },
    });

    if (existingUser) {
        return existingUser;
    }

    return prisma.user.create({
        data: {
            clerkUserId,
            email,
            name,
        },
    });
}
