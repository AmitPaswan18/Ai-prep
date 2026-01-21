import { prisma } from "@repo/db";
import { clerkClient } from "@clerk/express";

type ClerkUserPayload = {
    clerkUserId: string;
};

export async function getOrCreateUser({ clerkUserId }: ClerkUserPayload) {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

    return prisma.user.upsert({
        where: { clerkUserId },
        update: {
            email,
            name,
        },
        create: {
            clerkUserId,
            email,
            name,
        },
    });
}
