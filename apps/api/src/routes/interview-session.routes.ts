import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { prisma } from "@repo/db";
import {
    startInterviewSession,
    submitInterviewSession,
    getInterviewSession,
    getInterviewResults,
} from "../services/interview-session.service.js";

const router = Router();

/**
 * Helper function to get database user from Clerk auth
 */
async function getDbUser(req: any) {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
        return null;
    }

    return prisma.user.findUnique({
        where: { clerkUserId },
    });
}

/**
 * Helper function to verify user owns the interview
 */
async function verifyInterviewOwnership(interviewId: string, userId: string) {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        select: { userId: true, isTemplate: true },
    });

    if (!interview) {
        return { valid: false, error: "Interview not found", status: 404 };
    }

    // Allow access to templates or user's own interviews
    if (interview.isTemplate || interview.userId === userId) {
        return { valid: true };
    }

    return { valid: false, error: "You don't have access to this interview", status: 403 };
}

/**
 * POST /interview-session/start/:interviewId
 * Start an interview session (requires auth)
 */
router.post("/start/:interviewId", requireAuth(), async (req, res) => {
    try {
        const interviewId = req.params.interviewId as string;

        const user = await getDbUser(req);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        const ownership = await verifyInterviewOwnership(interviewId, user.id);
        if (!ownership.valid) {
            return res.status(ownership.status!).json({
                success: false,
                error: ownership.error,
            });
        }

        const session = await startInterviewSession(interviewId, user.id);

        res.json({
            success: true,
            data: session,
        });
    } catch (error: any) {
        console.error("Error starting interview session:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to start interview session",
        });
    }
});

/**
 * GET /interview-session/:interviewId
 * Get interview session details (requires auth)
 */
router.get("/:interviewId", requireAuth(), async (req, res) => {
    try {
        const interviewId = req.params.interviewId as string;

        const user = await getDbUser(req);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        const ownership = await verifyInterviewOwnership(interviewId, user.id);
        if (!ownership.valid) {
            return res.status(ownership.status!).json({
                success: false,
                error: ownership.error,
            });
        }

        const session = await getInterviewSession(interviewId);

        res.json({
            success: true,
            data: session,
        });
    } catch (error: any) {
        console.error("Error fetching interview session:");
        console.error("Error message:", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch interview session",
        });
    }
});

/**
 * POST /interview-session/submit/:interviewId
 * Submit interview responses for analysis (requires auth)
 */
router.post("/submit/:interviewId", requireAuth(), async (req, res) => {
    try {
        const interviewId = req.params.interviewId as string;
        const { responses } = req.body;

        const user = await getDbUser(req);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        const ownership = await verifyInterviewOwnership(interviewId, user.id);
        if (!ownership.valid) {
            return res.status(ownership.status!).json({
                success: false,
                error: ownership.error,
            });
        }

        if (!responses || !Array.isArray(responses)) {
            return res.status(400).json({
                success: false,
                error: "Invalid request: responses array is required",
            });
        }

        const result = await submitInterviewSession(interviewId, responses);

        res.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error("Error submitting interview:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to submit interview",
        });
    }
});

/**
 * GET /interview-session/results/:interviewId
 * Get interview results with complete analysis (requires auth)
 */
router.get("/results/:interviewId", requireAuth(), async (req, res) => {
    try {
        const interviewId = req.params.interviewId as string;

        const user = await getDbUser(req);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        const ownership = await verifyInterviewOwnership(interviewId, user.id);
        if (!ownership.valid) {
            return res.status(ownership.status!).json({
                success: false,
                error: ownership.error,
            });
        }

        const results = await getInterviewResults(interviewId);

        res.json({
            success: true,
            data: results,
        });
    } catch (error: any) {
        console.error("Error fetching interview results:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch interview results",
        });
    }
});

export default router;

