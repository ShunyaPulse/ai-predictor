const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // Added path module to fix folder confusion

dotenv.config();

const app = express();
app.use(express.json());

// 1. Serve static files using absolute paths
app.use(express.static(path.join(__dirname, 'public')));

// 2. Secure API Route
app.post('/api/analyze', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const { eventText, evidenceArray, currentProbability } = req.body;

    if (!apiKey) {
        return res.status(500).json({ error: "Server error: Missing API key." });
    }

    const formattedEvidence = evidenceArray.map((ev, index) => `${index + 1}. ${ev}`).join('\n');

    const prompt = `
        You are a Bayesian probability AI. Event: "${eventText}". Current Prob: ${currentProbability.toFixed(1)}%.
        New Batch of Evidence:
        ${formattedEvidence}
        
        Evaluate logically. Return strictly JSON:
        {"weight": integer from -10 to 10, "reasoning": "1-2 sentence explanation speaking to the user."}
    `;

    try {
        const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        if (!googleResponse.ok) {
            const errorData = await googleResponse.json();
            throw new Error(`Google API Error (${googleResponse.status}): ${errorData.error?.message || "Unknown Error"}`);
        }

        const data = await googleResponse.json();
        let aiResponseText = data.candidates[0].content.parts[0].text;
        aiResponseText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();

        res.json(JSON.parse(aiResponseText));

    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json({ error: `Backend details: ${error.message}` });
    }
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