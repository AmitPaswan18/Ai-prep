import { Router } from "express";
import { AccessToken } from "livekit-server-sdk";
import { requireAuth, getAuth } from "@clerk/express";
import { ElevenLabsClient } from "elevenlabs";
import { prisma } from "@repo/db";

const router = Router();

/**
 * GET /voice/token
 * Generate an access token for LiveKit
 */
router.get("/token", requireAuth(), async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const room = req.query.room as string;

        if (!room) {
            return res.status(400).json({ error: "Room name is required" });
        }

        const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
        const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

        if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
            return res.status(500).json({ error: "LiveKit configuration is missing" });
        }

        const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: userId || "anonymous",
            name: userId || "anonymous",
        });

        at.addGrant({
            roomJoin: true,
            room: room,
            canPublish: true,
            canSubscribe: true,
        });

        res.json({ token: await at.toJwt() });
    } catch (error: any) {
        console.error("Error generating LiveKit token:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /voice/tts
 * Generate speech from text using ElevenLabs
 */
router.post("/tts", requireAuth(), async (req, res) => {
    try {
        const { userId: clerkUserId } = getAuth(req);
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        // Fetch user's API key from database
        const user = await prisma.user.findUnique({
            where: { clerkUserId: clerkUserId! },
            select: { elevenLabsApiKey: true }
        });

        const apiKey = user?.elevenLabsApiKey || process.env.ELEVENLABS_API_KEY;

        if (!apiKey) {
            return res.status(400).json({ error: "ElevenLabs API key is missing. Please add it in your settings." });
        }

        const elevenLabs = new ElevenLabsClient({ apiKey });
        let voiceIdToUse = process.env.ELEVENLABS_VOICE_ID || "EXAVIT9j9E6On0bxicth";

        // Dynamic voice discovery to prevent 404s
        try {
            const voices = await elevenLabs.voices.getAll();
            if (voices.voices && voices.voices.length > 0) {
                const voiceExists = voices.voices.some(v => v.voice_id === voiceIdToUse);
                if (!voiceExists) {
                    console.log(`[TTS] Default voice not found. Falling back to: ${voices.voices[0].name} (${voices.voices[0].voice_id})`);
                    voiceIdToUse = voices.voices[0].voice_id;
                }
            }
        } catch (vErr) {
            console.warn('[TTS] Could not verify voices, attempting default...');
        }

        console.log(`[TTS] Final Voice ID: ${voiceIdToUse}`);

        // Using direct fetch to rule out SDK issues
        const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceIdToUse}`, {
            method: 'POST',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json',
                'accept': 'audio/mpeg'
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_turbo_v2_5",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!ttsResponse.ok) {
            const errorBody = await ttsResponse.text();
            throw new Error(`ElevenLabs API Error (${ttsResponse.status}): ${errorBody}`);
        }

        const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());

        // Set correct content type
        res.setHeader("Content-Type", "audio/mpeg");
        res.send(audioBuffer);
    } catch (error: any) {
        console.error("Error generating TTS:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
