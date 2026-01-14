const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
    console.log("Checking models for key ending in...", process.env.GOOGLE_API_KEY?.slice(-4));

    try {
        // There isn't a direct listModels on genAI instance in the simplified SDK sometimes, 
        // but let's try to just run a generation on likely candidates to see which works.

        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-pro",
            "gemini-2.0-flash-exp",
        ];

        console.log("Testing model availability...");

        for (const modelName of candidates) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                const response = await result.response;
                console.log(`✅ [SUCCESS] ${modelName} is available.`);
                break; // Found one!
            } catch (e) {
                console.log(`❌ [FAILED] ${modelName}: ${e.message.split('[')[0]}`); // Print short error
                if (e.message.includes("429")) {
                    console.log(`   (Rate Limited - but exists)`);
                }
            }
        }

    } catch (error) {
        console.error("Fatal error:", error);
    }
}

// Env loader mock since we don't have dotenv
const fs = require('fs');
const path = require('path');
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
} catch (e) {
    console.log("Could not load .env.local");
}

listModels();
