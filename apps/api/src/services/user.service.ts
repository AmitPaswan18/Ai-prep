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

    // 1. Check if user already exists by clerkUserId
    const existingByClerkId = await prisma.user.findUnique({
        where: { clerkUserId }
    });

    if (existingByClerkId) {
        return prisma.user.update({
            where: { clerkUserId },
            data: {
                email,
                name,
            },
        });
    }

    // 2. Check if user already exists by email (to prevent P2002 duplicate email conflicts)
    if (email) {
        const existingByEmail = await prisma.user.findUnique({
            where: { email }
        });

        if (existingByEmail) {
            // Update the existing user record with the new clerkUserId
            console.log(`[Auth Sync] Migrating user account with email ${email} to new clerkUserId: ${clerkUserId}`);
            return prisma.user.update({
                where: { email },
                data: {
                    clerkUserId,
                    name,
                },
            });
        }
    }

    // 3. Otherwise, create a brand new user
    return prisma.user.create({
        data: {
            clerkUserId,
            email,
            name,
        },
    });
}
