import { prisma, InterviewCategory, InterviewDifficulty } from "@repo/db";




type CreateInterviewInput = {
    userId?: string;
    title: string;
    description?: string;
    category?: InterviewCategory;
    difficulty?: InterviewDifficulty;
    duration?: number;
    questionCount?: number;
    topics?: string[];
    icon?: string;
    color?: string;
    role?: string;
    level?: string;
    isTemplate?: boolean;
};

// Type for filtering interviews
type GetInterviewsFilter = {
    category?: InterviewCategory;
    difficulty?: InterviewDifficulty;
    isTemplate?: boolean;
    userId?: string;
    search?: string;
    status?: string;
};

export async function createInterview(input: CreateInterviewInput) {
    return prisma.interview.create({
        data: {
            userId: input.userId,
            title: input.title,
            description: input.description,
            category: input.category || "TECHNICAL",
            difficulty: input.difficulty || "INTERMEDIATE",
            duration: input.duration || 30,
            questionCount: input.questionCount || 10,
            topics: input.topics || [],
            icon: input.icon,
            color: input.color,
            role: input.role,
            level: input.level,
            isTemplate: input.isTemplate || false,
        },
    });
}

export async function getInterviews(filter?: GetInterviewsFilter) {
    const where: any = {};

    if (filter?.category) {
        where.category = filter.category;
    }

    if (filter?.difficulty) {
        where.difficulty = filter.difficulty;
    }

    if (filter?.isTemplate !== undefined) {
        where.isTemplate = filter.isTemplate;
    }

    if (filter?.userId) {
        where.userId = filter.userId;
    }

    if (filter?.status) {
        where.status = filter.status;
    }

    if (filter?.search) {
        where.OR = [
            { title: { contains: filter.search, mode: "insensitive" } },
            { description: { contains: filter.search, mode: "insensitive" } },
        ];
    }

    return prisma.interview.findMany({
        where,
        orderBy: [
            { updatedAt: "desc" },
            { createdAt: "desc" },
        ],
        include: {
            _count: {
                select: { questions: true },
            },
            results: filter?.status === "COMPLETED" ? true : false,
        },
    });
}

export async function getInterviewById(id: string) {
    return prisma.interview.findUnique({
        where: { id },
        include: {
            questions: true,
            results: true,
            skillScores: true,
        },
    });
}

export async function updateInterviewCompletions(id: string) {
    return prisma.interview.update({
        where: { id },
        data: {
            completions: { increment: 1 },
        },
    });
}

export async function updateInterviewRating(id: string, newRating: number) {
    const interview = await prisma.interview.findUnique({
        where: { id },
        select: { rating: true, completions: true },
    });

    if (!interview) return null;

    // Calculate new average rating
    const totalRatings = interview.completions;
    const currentAvg = interview.rating;
    const newAvg = totalRatings > 0
        ? ((currentAvg * totalRatings) + newRating) / (totalRatings + 1)
        : newRating;

    return prisma.interview.update({
        where: { id },
        data: { rating: newAvg },
    });
}
