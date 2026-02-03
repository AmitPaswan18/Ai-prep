import { Router } from "express";
import {
    startInterviewSession,
    submitInterviewSession,
    getInterviewSession,
    getInterviewResults,
} from "../services/interview-session.service.js";

const router = Router();

/**
 * POST /interview-session/start/:interviewId
 * Start an interview session
 */
router.post("/start/:interviewId", async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { userId } = req.body; // TODO: Get from auth middleware

        const session = await startInterviewSession(interviewId, userId);

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
 * Get interview session details
 */
router.get("/:interviewId", async (req, res) => {
    try {
        const { interviewId } = req.params;

        const session = await getInterviewSession(interviewId);

        res.json({
            success: true,
            data: session,
        });
    } catch (error: any) {
        console.error("Error fetching interview session:");
        console.error("Error message:", error.message);
        console.error("Full error:", JSON.stringify(error, null, 2));
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch interview session",
        });
    }
});

/**
 * POST /interview-session/submit/:interviewId
 * Submit interview responses for analysis
 */
router.post("/submit/:interviewId", async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { responses } = req.body;

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
 * Get interview results with complete analysis
 */
router.get("/results/:interviewId", async (req, res) => {
    try {
        const { interviewId } = req.params;

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
