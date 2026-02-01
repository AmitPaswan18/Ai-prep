import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { getOrCreateUser } from "../services/user.service.js";

const router = Router();

router.get("/me", requireAuth(), async (req, res) => {
    const { userId, sessionClaims } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const email =
        sessionClaims?.email ??
        (sessionClaims?.email_addresses as any)?.[0]?.email_address ??
        "";

    const user = await getOrCreateUser({
        clerkUserId: userId,
    });

    res.json(user);
});

export default router;
