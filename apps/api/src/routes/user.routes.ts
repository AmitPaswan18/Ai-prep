import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { prisma, Prisma } from "@repo/db";
import { extractResumeSkills, analyzeResumeATS } from "@ai-platform/ai-core";

const router = Router();

/**
 * GET /user/settings
 * Get user settings including API keys
 */
router.get("/settings", requireAuth(), async (req, res) => {
    try {
        const { userId: clerkUserId } = getAuth(req);

        const user = await prisma.user.findUnique({
            where: { clerkUserId: clerkUserId! },
            select: {
                elevenLabsApiKey: true,
                email: true,
                name: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isElevenLabsConfigured = !!(user.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY);

        res.json({
            success: true,
            data: {
                ...user,
                isElevenLabsConfigured
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /user/settings
 * Update user settings
 */
router.patch("/settings", requireAuth(), async (req, res) => {
    try {
        const { userId: clerkUserId } = getAuth(req);
        const { elevenLabsApiKey, name } = req.body;

        const user = await prisma.user.update({
            where: { clerkUserId: clerkUserId! },
            data: {
                elevenLabsApiKey,
                name
            }
        });

        res.json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// @ts-ignore
import multer from "multer";
import { parseResume } from "../services/resume.service.js";

const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /user/resume
 * Upload and parse resume
 */
router.post("/resume", requireAuth(), upload.single("resume"), async (req, res) => {
    try {
        const { userId: clerkUserId } = getAuth(req);
        const file = (req as any).file;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const resumeText = await parseResume(file.buffer, file.mimetype);
        const resumeAnalysis = await analyzeResumeATS(resumeText);

        const user = await prisma.user.update({
            where: { clerkUserId: clerkUserId! },
            data: {
                resumeText: resumeText,
                resumeUpdatedAt: new Date(),
                resumeAnalysis: resumeAnalysis as any,
            },
            select: {
                id: true,
                resumeUpdatedAt: true,
            }
        });

        res.json({
            success: true,
            message: "Resume parsed and updated successfully",
            data: {
                resumeUpdatedAt: user.resumeUpdatedAt
            }
        });
    } catch (error: any) {
        console.error("Resume upload error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /user/resume
 * Get resume status
 */
router.get("/resume", requireAuth(), async (req, res) => {
    try {
        const { userId: clerkUserId } = getAuth(req);

        const user = await prisma.user.findUnique({
            where: { clerkUserId: clerkUserId! },
            select: {
                resumeText: true,
                resumeUpdatedAt: true,
                resumeAnalysis: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            success: true,
            data: {
                hasResume: !!user.resumeText,
                updatedAt: user.resumeUpdatedAt,
                resumeAnalysis: user.resumeAnalysis,
                // Only return snippet if requested, otherwise just status
                snippet: user.resumeText ? user.resumeText.substring(0, 200) + "..." : null
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /user/resume/skills
 * Get extracted skills and tech stack from user's resume
 */
router.get("/resume/skills", requireAuth(), async (req, res) => {
    try {
        const { userId: clerkUserId } = getAuth(req);

        const user = await prisma.user.findUnique({
            where: { clerkUserId: clerkUserId! },
            select: {
                resumeText: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.resumeText) {
            return res.json({
                success: true,
                data: { skills: [] }
            });
        }

        const skills = await extractResumeSkills(user.resumeText);
        res.json({
            success: true,
            data: { skills }
        });
    } catch (error: any) {
        console.error("Error fetching/extracting resume skills:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /user/resume
 * Remove resume data
 */
router.delete("/resume", requireAuth(), async (req, res) => {
    try {
        const { userId: clerkUserId } = getAuth(req);

        await prisma.user.update({
            where: { clerkUserId: clerkUserId! },
            data: {
                resumeText: null,
                resumeUpdatedAt: null,
                resumeAnalysis: Prisma.DbNull
            }
        });

        res.json({ success: true, message: "Resume data removed" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
