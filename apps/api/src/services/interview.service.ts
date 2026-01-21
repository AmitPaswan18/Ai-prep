import { prisma } from "@repo/db";

type CreateInterviewInput = {
    userId: string;
    title: string;
    role: string;
    level: string;
};

export async function createInterview({
    userId,
    title,
    role,
    level,
}: CreateInterviewInput) {
    return prisma.interview.create({
        data: {
            userId,
            title,
            role,
            level,
        },
    });
}
