import { Router } from "express";
import { AccessToken } from "livekit-server-sdk";
import { requireAuth, getAuth } from "@clerk/express";
import { ElevenLabsClient } from "elevenlabs";

const router = Router();

// ElevenLabs configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const elevenLabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

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
        const { text } = req.body;
        const voiceId = process.env.ELEVENLABS_VOICE_ID || "JBF2zOfHhiS98uBUne69"; // Default professional voice

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        if (!ELEVENLABS_API_KEY) {
            return res.status(500).json({ error: "ElevenLabs API key is missing" });
        }

        const audio = await elevenLabs.textToSpeech.convert(voiceId, {
            text,
            model_id: "eleven_multilingual_v2",
            output_format: "mp3_44100_128",
        });

        // Set correct content type
        res.setHeader("Content-Type", "audio/mpeg");

        // Stream the response
        // Note: ElevenLabs SDK returns a stream that can be piped
        (audio as any).pipe(res);
    } catch (error: any) {
        console.error("Error generating TTS:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
