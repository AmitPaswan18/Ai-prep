import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import {
    createInterview,
    getInterviews,
    getInterviewById,
} from "../services/interview.service.js";
import { prisma, InterviewCategory, InterviewDifficulty } from "@repo/db";


const router = Router();

// GET /interview - Get list of interviews (templates or user's interviews)
router.get("/", async (req, res) => {
    try {
        const { category, difficulty, search, template, status } = req.query;

        // Build filter object
        const filter: any = {};

        // If requesting templates, allow without auth
        if (template === "true") {
            filter.isTemplate = true;
        } else {
            // For user's own interviews, require authentication
            try {
                const { userId: clerkUserId } = getAuth(req);

                if (!clerkUserId) {
                    return res.status(401).json({ error: "Authentication required to view your interviews" });
                }

                const user = await prisma.user.findUnique({
                    where: { clerkUserId },
                });

                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }

                // Filter to show only this user's interviews
                filter.userId = user.id;
            } catch (authError) {
                console.error("[ERROR] Auth failed:", authError);
                return res.status(401).json({ error: "Authentication required" });
            }
        }

        // Category filter
        if (category && category !== "all") {
            const categoryMap: Record<string, InterviewCategory> = {
                "technical": "TECHNICAL",
                "behavioral": "BEHAVIORAL",
                "system-design": "SYSTEM_DESIGN",
                "case-study": "CASE_STUDY",
            };
            if (categoryMap[category as string]) {
                filter.category = categoryMap[category as string];
            }
        }

        // Difficulty filter
        if (difficulty) {
            const difficultyMap: Record<string, InterviewDifficulty> = {
                "beginner": "BEGINNER",
                "intermediate": "INTERMEDIATE",
                "advanced": "ADVANCED",
            };
            if (difficultyMap[difficulty as string]) {
                filter.difficulty = difficultyMap[difficulty as string];
            }
        }

        // Search filter
        if (search) {
            filter.search = search as string;
        }



        // Status filter - for fetching completed interviews
        if (status) {
            filter.status = status as string;
        }

        const interviews = await getInterviews(filter);

        res.json(interviews);
    } catch (error) {
        console.error("Error fetching interviews:", error);
        res.status(500).json({ error: "Failed to fetch interviews" });
    }
});

// GET /interview/:id - Get a single interview by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await getInterviewById(id);

        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        // Allow access to templates without auth
        if (interview.isTemplate) {
            return res.json(interview);
        }

        // For non-templates, verify the user owns this interview
        try {
            const { userId: clerkUserId } = getAuth(req);

            if (!clerkUserId) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const user = await prisma.user.findUnique({
                where: { clerkUserId },
            });

            if (!user || interview.userId !== user.id) {
                return res.status(403).json({ error: "You don't have access to this interview" });
            }
        } catch (authError) {
            return res.status(401).json({ error: "Authentication required" });
        }

        res.json(interview);
    } catch (error) {
        console.error("Error fetching interview:", error);
        res.status(500).json({ error: "Failed to fetch interview" });
    }
});

// POST /interview - Create a new interview (requires auth)
router.post("/", requireAuth(), async (req, res) => {
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

        const {
            title,
            description,
            category,
            difficulty,
            duration,
            topics,
            icon,
            color,
            role,
            level,
            isTemplate,
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        // Map category string to enum
        const categoryMap: Record<string, InterviewCategory> = {
            "technical": "TECHNICAL",
            "behavioral": "BEHAVIORAL",
            "system-design": "SYSTEM_DESIGN",
            "case-study": "CASE_STUDY",
        };

        // Map difficulty string to enum
        const difficultyMap: Record<string, InterviewDifficulty> = {
            "beginner": "BEGINNER",
            "intermediate": "INTERMEDIATE",
            "advanced": "ADVANCED",
        };

        const interview = await createInterview({
            userId: user.id,
            title,
            description,
            category: category ? categoryMap[category] || "TECHNICAL" : "TECHNICAL",
            difficulty: difficulty ? difficultyMap[difficulty.toLowerCase()] || "INTERMEDIATE" : "INTERMEDIATE",
            duration: duration || 30,
            topics: topics || [],
            icon,
            color,
            role,
            level,
            isTemplate: isTemplate || false,
        });

        res.status(201).json(interview);
    } catch (error) {
        console.error("Error creating interview:", error);
        res.status(500).json({ error: "Failed to create interview" });
    }
});

export default router;
