import { prisma, InterviewStatus } from "@repo/db";
import {
    generateInterviewQuestions,
    analyzeInterviewResponses,
    type InterviewResponse,
} from "@ai-platform/ai-core";

/**
 * Start an interview session - generates questions and updates status
 */
export async function startInterviewSession(interviewId: string, userId: string) {
    // Get the interview details
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
    });

    if (!interview) {
        throw new Error("Interview not found");
    }

    // Check if questions already exist
    const existingQuestions = await prisma.interviewQuestion.findMany({
        where: { interviewId },
    });

    let questions;

    if (existingQuestions.length > 0) {
        // Use existing questions
        questions = existingQuestions;
    } else {
        // Generate new questions using AI
        const aiQuestions = await generateInterviewQuestions({
            title: interview.title,
            description: interview.description || undefined,
            category: interview.category,
            difficulty: interview.difficulty,
            topics: interview.topics,
            role: interview.role || undefined,
            level: interview.level || undefined,
            questionCount: 10,
        });

        // Store questions in database
        questions = await Promise.all(
            aiQuestions.map((q) =>
                prisma.interviewQuestion.create({
                    data: {
                        interviewId,
                        question: q.question,
                    },
                })
            )
        );
    }

    // Update interview status to IN_PROGRESS
    await prisma.interview.update({
        where: { id: interviewId },
        data: { status: InterviewStatus.IN_PROGRESS },
    });

    return {
        interview,
        questions: questions.map((q) => ({
            id: q.id,
            question: q.question,
        })),
    };
}

/**
 * Submit interview responses and get AI analysis
 */
export async function submitInterviewSession(
    interviewId: string,
    responses: InterviewResponse[]
) {
    // Get interview details
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            questions: true,
        },
    });

    if (!interview) {
        throw new Error("Interview not found");
    }

    // Analyze responses using AI
    const analysis = await analyzeInterviewResponses(
        {
            title: interview.title,
            category: interview.category,
            difficulty: interview.difficulty,
            topics: interview.topics,
        },
        responses
    );

    // Store individual question scores and feedback
    // Map AI question scores to actual database questions by index
    // AI returns questionIds like "q1", "q2", etc., but we need to match them to actual DB question IDs
    await Promise.all(
        analysis.questionScores.map((qs, index) => {
            // Extract the question number from AI's questionId (e.g., "q1" -> 0, "q2" -> 1)
            const questionIndex = parseInt(qs.questionId.replace(/\D/g, '')) - 1;
            const dbQuestion = interview.questions[questionIndex];

            if (!dbQuestion) {
                console.warn(`Question at index ${questionIndex} not found in database`);
                return Promise.resolve();
            }

            // Find the corresponding response by matching the questionId from frontend
            const response = responses.find((r) => {
                // The frontend might send either the DB ID or the AI ID
                return r.questionId === dbQuestion.id || r.questionId === qs.questionId;
            });

            return prisma.interviewQuestion.update({
                where: { id: dbQuestion.id },
                data: {
                    score: qs.score,
                    feedback: qs.feedback,
                    answer: response?.answer,
                },
            });
        })
    );

    // Store overall results
    const result = await prisma.interviewResult.upsert({
        where: { interviewId },
        create: {
            interviewId,
            overallScore: analysis.overallScore,
            summary: analysis.summary,
            strengths: analysis.strengths.join("\n"),
            weaknesses: analysis.weaknesses.join("\n"),
        },
        update: {
            overallScore: analysis.overallScore,
            summary: analysis.summary,
            strengths: analysis.strengths.join("\n"),
            weaknesses: analysis.weaknesses.join("\n"),
        },
    });

    // Store skill scores
    await Promise.all(
        analysis.skillScores.map((skill) =>
            prisma.skillScore.upsert({
                where: {
                    interviewId_skillName: {
                        interviewId,
                        skillName: skill.skillName,
                    },
                },
                create: {
                    interviewId,
                    skillName: skill.skillName,
                    score: skill.score,
                },
                update: {
                    score: skill.score,
                },
            })
        )
    );

    // Update interview status to COMPLETED
    await prisma.interview.update({
        where: { id: interviewId },
        data: {
            status: InterviewStatus.COMPLETED,
            completions: { increment: 1 },
        },
    });

    return {
        result,
        analysis,
    };
}

/**
 * Get interview session with questions
 */
export async function getInterviewSession(interviewId: string) {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            questions: {
                select: {
                    id: true,
                    question: true,
                },
            },
        },
    });

    if (!interview) {
        throw new Error("Interview not found");
    }

    return interview;
}

/**
 * Get interview results with complete analysis
 */
export async function getInterviewResults(interviewId: string) {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            questions: {
                select: {
                    id: true,
                    question: true,
                    answer: true,
                    score: true,
                    feedback: true,
                },
            },
            results: true,
            skillScores: true,
        },
    });

    if (!interview) {
        throw new Error("Interview not found");
    }

    if (!interview.results) {
        throw new Error("Interview results not found. Please complete the interview first.");
    }

    return {
        interview: {
            id: interview.id,
            title: interview.title,
            description: interview.description,
            category: interview.category,
            difficulty: interview.difficulty,
            duration: interview.duration,
            status: interview.status,
        },
        results: {
            overallScore: interview.results.overallScore,
            summary: interview.results.summary,
            strengths: interview.results.strengths.split('\n').filter(s => s.trim()),
            weaknesses: interview.results.weaknesses.split('\n').filter(s => s.trim()),
        },
        questions: interview.questions.map(q => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
            score: q.score,
            feedback: q.feedback,
        })),
        skillScores: interview.skillScores.map(s => ({
            skillName: s.skillName,
            score: s.score,
        })),
    };
}

