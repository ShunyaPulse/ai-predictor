const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());

// 1. Serve static files using absolute paths
app.use(express.static(path.join(__dirname, 'public')));

// 2. Secure API Route with Auto-Rotation
app.post('/api/analyze', async (req, res) => {
    // 1. Vercel se singular naam waali string uthayiye
    const apiKeyString = process.env.GEMINI_API_KEY;
    const { eventText, evidenceArray, currentProbability } = req.body;

    if (!apiKeyString) {
        return res.status(500).json({ error: "Server error: Missing API key configuration." });
    }

    // 2. Agar aapne ek se zyada keys comma laga kar daali hain, toh yeh use array mein split kar dega
    // Agar sirf ek hi key hai, toh bhi yeh perfectly single-item array bana dega!
    const keys = apiKeyString.split(',').map(key => key.trim());

    const formattedEvidence = evidenceArray.map((ev, index) => `${index + 1}. ${ev}`).join('\n');

    const prompt = `
        You are a Bayesian probability AI. Event: "${eventText}". Current Prob: ${currentProbability.toFixed(1)}%.
        New Batch of Evidence:
        ${formattedEvidence}
        
        Evaluate logically. Return strictly JSON:
        {"weight": integer from -10 to 10, "reasoning": "1-2 sentence explanation speaking to the user."}
    `;

    let finalAiResponseText = null;
    let lastErrorMessage = "Unknown error";

    // 3. Loop over every key in the list
    for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];

        try {
            const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: "application/json" }
                })
            });

            if (!googleResponse.ok) {
                if (googleResponse.status === 429 || googleResponse.status === 403) {
                    console.log(`Key ${i + 1} exhausted or rate-limited. Trying next key...`);
                    continue;
                }
                const errorData = await googleResponse.json();
                throw new Error(errorData.error?.message || `API Error ${googleResponse.status}`);
            }

            const data = await googleResponse.json();
            let aiResponseText = data.candidates[0].content.parts[0].text;
            finalAiResponseText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
            break;

        } catch (error) {
            console.error(`Attempt with Key ${i + 1} failed:`, error.message);
            lastErrorMessage = error.message;
        }
    }

    if (!finalAiResponseText) {
        return res.status(500).json({ error: `Backend details: All API keys exhausted or failed. Last error: ${lastErrorMessage}` });
    }

    res.json(JSON.parse(finalAiResponseText));
});

// 3. Explicitly catch the root URL and serve the HTML file securely
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Premium Predictor server running at http://localhost:${port}`);
});

// Export for Vercel serverless integration
module.exports = app;