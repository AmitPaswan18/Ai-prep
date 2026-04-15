import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { prisma } from "@repo/db";

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

        res.json({ success: true, data: user });
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

export default router;
