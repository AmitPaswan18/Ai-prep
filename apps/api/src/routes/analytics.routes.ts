import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { prisma } from "@repo/db";

const router = Router();

// GET /analytics - Get aggregated statistics for the logged-in user
router.get("/", requireAuth(), async (req, res) => {
    try {
        const { userId: clerkUserId } = getAuth(req);

        if (!clerkUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { clerkUserId },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 1. Basic Stats
        const sessionsDone = await prisma.interview.count({
            where: {
                userId: user.id,
                status: "COMPLETED",
            },
        });

        if (sessionsDone === 0) {
            return res.json({
                sessionsDone: 0,
                totalPractice: 0,
                averageScore: 0,
                topScore: 0,
                comparativeRank: "N/A",
                averageWpm: 0,
                averageFillerCount: 0,
                categoryData: [],
                skillRadarData: [],
                progressData: [],
            });
        }

        const durationAggregate = await prisma.interview.aggregate({
            where: {
                userId: user.id,
                status: "COMPLETED",
            },
            _sum: {
                duration: true,
            },
        });

        const scoreAggregate = await prisma.interviewResult.aggregate({
            where: {
                interview: {
                    userId: user.id,
                    status: "COMPLETED",
                },
            },
            _avg: {
                overallScore: true,
            },
            _max: {
                overallScore: true,
            },
        });

        // 1.1 Calculate speech and pacing metrics from InterviewQuestion
        const questionAggregate = await prisma.interviewQuestion.aggregate({
            where: {
                interview: {
                    userId: user.id,
                    status: "COMPLETED",
                },
            },
            _avg: {
                wpm: true,
                fillerCount: true,
            },
        });

        const totalPractice = durationAggregate._sum.duration || 0;
        const averageScore = Math.round(scoreAggregate._avg.overallScore || 0);
        const topScore = scoreAggregate._max.overallScore || 0;
        const averageWpm = Math.round(questionAggregate._avg.wpm || 0);
        const averageFillerCount = Math.round(questionAggregate._avg.fillerCount || 0);

        // 1.2 Calculate Dynamic Comparative Rank (Percentile Rank compared to all other users' top scores)
        const topScoresRaw = await prisma.$queryRaw<Array<{ userId: string; topScore: number }>>`
            SELECT i."userId", MAX(r."overallScore")::integer as "topScore"
            FROM "Interview" i
            JOIN "InterviewResult" r ON i.id = r."interviewId"
            WHERE i.status = 'COMPLETED' AND i."userId" IS NOT NULL
            GROUP BY i."userId"
        `;

        let comparativeRank = "Top 100%";
        const totalUsers = topScoresRaw.length;
        if (totalUsers > 0 && topScore > 0) {
            const lowerOrEqualCount = topScoresRaw.filter(u => u.topScore <= topScore).length;
            const percentile = (lowerOrEqualCount / totalUsers) * 100;
            const topPercent = Math.max(1, Math.round(100 - percentile));
            comparativeRank = `Top ${topPercent}%`;
        }

        // 2. Category Domain Mastery Aggregation
        const categoryDataRaw = await prisma.$queryRaw<Array<{ category: string; score: number }>>`
            SELECT i.category, ROUND(AVG(r."overallScore"))::integer as "score"
            FROM "Interview" i
            JOIN "InterviewResult" r ON i.id = r."interviewId"
            WHERE i."userId" = ${user.id} AND i.status = 'COMPLETED'
            GROUP BY i.category
        `;

        // Format category name to display friendly titles
        const categoryMap: Record<string, string> = {
            "TECHNICAL": "Technical",
            "BEHAVIORAL": "Behavioral",
            "SYSTEM_DESIGN": "System Design",
            "CASE_STUDY": "Case Study",
        };

        const categoryData = categoryDataRaw.map(item => ({
            name: categoryMap[item.category] || item.category,
            score: Number(item.score),
        }));

        // 3. Skill Scores Aggregation
        const skillGroup = await prisma.skillScore.groupBy({
            by: ["skillName"],
            where: {
                interview: {
                    userId: user.id,
                    status: "COMPLETED",
                },
            },
            _avg: {
                score: true,
            },
        });

        const skillRadarData = skillGroup.map(item => ({
            skill: item.skillName,
            score: Math.round(item._avg.score || 0),
            fullMark: 100,
        }));

        // 4. Monthly Progress Aggregation (last 6 months)
        const progressDataRaw = await prisma.$queryRaw<Array<{ month: string; score: number; month_num: number }>>`
            SELECT 
                TO_CHAR(i."updatedAt", 'Mon') as "month",
                ROUND(AVG(r."overallScore"))::integer as "score",
                EXTRACT(MONTH FROM i."updatedAt")::integer as "month_num"
            FROM "Interview" i
            JOIN "InterviewResult" r ON i.id = r."interviewId"
            WHERE i."userId" = ${user.id} 
              AND i.status = 'COMPLETED'
              AND i."updatedAt" >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(i."updatedAt", 'Mon'), EXTRACT(MONTH FROM i."updatedAt")
            ORDER BY EXTRACT(MONTH FROM i."updatedAt") ASC
        `;

        const progressData = progressDataRaw.map(item => ({
            month: item.month,
            score: Number(item.score),
        }));

        res.json({
            sessionsDone,
            totalPractice,
            averageScore,
            topScore,
            comparativeRank,
            averageWpm,
            averageFillerCount,
            categoryData,
            skillRadarData,
            progressData,
        });

    } catch (error) {
        console.error("Error fetching analytics stats:", error);
        res.status(500).json({ error: "Failed to fetch analytics statistics" });
    }
});

export default router;
