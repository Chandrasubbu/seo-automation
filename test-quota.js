const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testQuota() {
    // Load env
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
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
    console.log("Testing API key ending in:", process.env.GOOGLE_API_KEY?.slice(-4));
    console.log("Model: gemini-2.0-flash-exp\n");

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        console.log("Sending test request...");

        const result = await model.generateContent("Say 'Hello' in one word.");
        const response = await result.response;
        const text = response.text();

        console.log("✅ SUCCESS! API is working.");
        console.log("Response:", text);
        console.log("\n🎉 Your billing upgrade is active!");

    } catch (error) {
        console.error("❌ FAILED:", error.message);

        if (error.message.includes("429")) {
            console.log("\n⚠️  Still hitting rate limits. This could mean:");
            console.log("   1. Quota increase hasn't propagated yet (wait 5-10 minutes)");
            console.log("   2. You need to generate a NEW API key after enabling billing");
            console.log("   3. Billing setup is still processing");
            console.log("\n💡 Try generating a new API key at: https://aistudio.google.com/app/apikey");
        } else if (error.message.includes("404")) {
            console.log("\n⚠️  Model not found. Your key might not have access to gemini-2.0-flash-exp");
        }
    }
}

testQuota();
