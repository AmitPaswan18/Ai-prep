import { prisma } from "@repo/db";
import dotenv from "dotenv";

// Load platform .env
dotenv.config({ path: "../../.env" });

async function run() {
    console.log("=========================================");
    console.log("Checking ElevenLabs configuration...");
    console.log("=========================================");

    const envKey = process.env.ELEVENLABS_API_KEY;
    if (envKey) {
        console.log("Global ELEVENLABS_API_KEY found in .env!");
        await testKey(envKey, "Global .env Key");
    } else {
        console.log("No global ELEVENLABS_API_KEY found in .env.");
    }

    try {
        console.log("\nQuerying database for users with custom ElevenLabs keys...");
        const users = await prisma.user.findMany({
            where: {
                elevenLabsApiKey: {
                    not: null,
                    not: ""
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                elevenLabsApiKey: true
            }
        });

        if (users.length === 0) {
            console.log("No users in database have configured a custom ElevenLabs key yet.");
        } else {
            console.log(`Found ${users.length} user(s) with custom keys:`);
            for (const user of users) {
                console.log(`\nUser: ${user.name} (${user.email})`);
                await testKey(user.elevenLabsApiKey, `Custom key for ${user.name}`);
            }
        }
    } catch (err) {
        console.error("Database query failed:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

async function testKey(key, label) {
    if (!key) {
        console.log(`❌ Failed! Key is null or empty.`);
        return;
    }
    const masked = key.substring(0, 5) + "..." + key.substring(key.length - 4);
    console.log(`Testing key [${masked}] for label: "${label}"...`);

    try {
        const res = await fetch("https://api.elevenlabs.io/v1/voices", {
            headers: {
                "xi-api-key": key
            }
        });

        if (res.ok) {
            const data = await res.json();
            const voiceCount = data.voices ? data.voices.length : 0;
            console.log(`✅ Success! ElevenLabs key is valid and working.`);
            console.log(`   Available Voices: ${voiceCount}`);
        } else {
            const errText = await res.text();
            console.log(`❌ Failed! ElevenLabs returned status: ${res.status}`);
            console.log(`   Error body: ${errText}`);
        }
    } catch (err) {
        console.log(`❌ Connection Error: Failed to reach ElevenLabs API:`, err.message);
    }
}

run();
