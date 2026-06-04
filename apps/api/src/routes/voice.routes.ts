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
        const { text, voiceId } = req.body;

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
        let voiceIdToUse = voiceId || process.env.ELEVENLABS_VOICE_ID || "EXAVIT9j9E6On0bxicth";

        // Dynamic voice discovery to prevent 404s
        try {
            const voices = await elevenLabs.voices.getAll();
            if (voices.voices && voices.voices.length > 0) {
                const voiceExists = voices.voices.some(v => v.voice_id === voiceIdToUse);
                if (!voiceExists) {
                    console.log(`[TTS] Requested/Default voice not found. Falling back to: ${voices.voices[0].name} (${voices.voices[0].voice_id})`);
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
                text: text,
                model_id: "eleven_turbo_v2_5",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true
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

/**
 * POST /voice/hint
 * Generate a spoken hint for a specific interview question using OpenAI
 */
router.post("/hint", requireAuth(), async (req, res) => {
    try {
        const { question, partialAnswer } = req.body;

        if (!question) {
            return res.status(400).json({ error: "Question is required" });
        }

        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
            return res.status(500).json({ error: "OpenAI API key not configured" });
        }

        const prompt = partialAnswer
            ? `You are a friendly interview coach. The candidate is answering this interview question: "${question}". So far they've said: "${partialAnswer}". Give them a short, encouraging spoken hint (2-3 sentences max) about what key points they should include to make their answer stronger. Be concise and conversational, as this will be spoken aloud.`
            : `You are a friendly interview coach. Give the candidate a short, encouraging spoken hint (2-3 sentences max) about how to approach this interview question: "${question}". Focus on structure and key points to mention. Be concise and conversational, as this will be spoken aloud.`;

        const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: "You are a helpful interview coach." }, { role: "user", content: prompt }],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!openAIRes.ok) {
            if (openAIRes.status === 429) {
                console.warn("OpenAI API rate limit exceeded (429), falling back to generic hint.");
                const genericHint = partialAnswer
                    ? "You're on the right track. Try to expand on the specific actions you took and the results you achieved."
                    : "A good approach here is to use the STAR method. Describe the Situation, Task, Action, and Result.";
                return res.json({ hint: genericHint });
            }
            throw new Error(`OpenAI API Error: ${openAIRes.status}`);
        }

        const openAIData = await openAIRes.json() as any;
        let hint = openAIData?.choices?.[0]?.message?.content || "Think about using the STAR method. Describe the Situation, Task, Action, and Result.";

        // Remove colons or complex characters that can cause TTS glitches
        hint = hint.replace(/:/g, ".");

        res.json({ hint: hint.trim() });
    } catch (error: any) {
        console.error("Error generating hint:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /voice/analyze
 * Analyze a specific question+answer pair and suggest improvements (for results page) using OpenAI
 */
router.post("/analyze", requireAuth(), async (req, res) => {
    try {
        const { question, answer } = req.body;

        if (!question) {
            return res.status(400).json({ error: "Question is required" });
        }

        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
            return res.status(500).json({ error: "OpenAI API key not configured" });
        }

        const answerText = answer || "(No answer provided)";
        const prompt = `You are an expert interview coach reviewing a candidate's answer.

Question: "${question}"
Candidate's Answer: "${answerText}"

Provide a brief, actionable analysis (3-5 sentences) of what is missing or could be improved in this answer. Focus on:
1. Key concepts or points that were omitted
2. Structure improvements (e.g., STAR method if behavioral)
3. Specific examples or depth that should have been added

Be direct and constructive. Start with "Your answer" or "This answer".`;

        const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: "You are a helpful interview coach." }, { role: "user", content: prompt }],
                max_tokens: 250,
                temperature: 0.5
            })
        });

        if (!openAIRes.ok) {
            if (openAIRes.status === 429) {
                console.warn("OpenAI API rate limit exceeded (429) during analyze, skipping analysis.");
                return res.json({ analysis: "Analysis skipped due to API rate limits. Overall, good effort!" });
            }
            throw new Error(`OpenAI API Error: ${openAIRes.status}`);
        }

        const openAIData = await openAIRes.json() as any;
        const analysis = openAIData?.choices?.[0]?.message?.content || "Unable to analyze this answer at this time.";

        res.json({ analysis: analysis.trim() });
    } catch (error: any) {
        console.error("Error analyzing answer:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
