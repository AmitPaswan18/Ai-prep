import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { createInterview } from "../services/interview.service";
import { prisma } from "@repo/db";

const router = Router();

router.post("/", requireAuth(), async (req, res) => {
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

    const { title, role, level } = req.body;

    if (!title || !role || !level) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const interview = await createInterview({
        userId: user.id,
        title,
        role,
        level,
    });

    res.status(201).json(interview);
});

export default router;
