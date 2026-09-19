const https = require('https');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({
            error: 'AI service is not configured. Add GEMINI_API_KEY to Vercel environment variables and redeploy.'
        });
    }

    const { planData, currentPlanOutput, instruction } = req.body;
    if (!planData || !instruction) {
        return res.status(400).json({ error: 'Missing planData or instruction.' });
    }

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are refining an existing AI-generated student plan based on the user's instruction.
Preserve all existing useful content. Only modify what the instruction asks to change.
Return ONLY a valid JSON object in exactly the same schema as the original plan. No markdown, no explanation.`;

    const userPrompt = `Original plan:
Name: ${planData.name}
Type: ${planData.type}
Deadline: ${planData.date}

Current plan JSON:
${JSON.stringify(currentPlanOutput)}

User instruction: "${instruction}"

Apply the instruction and return the complete updated JSON object only.`;

    const requestBody = JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { responseMimeType: 'application/json' }
    });

    try {
        const geminiResult = await new Promise((resolve, reject) => {
            const urlObj = new URL(GEMINI_URL);
            const options = {
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            };
            const httpReq = https.request(options, (httpRes) => {
                let data = '';
                httpRes.on('data', chunk => data += chunk);
                httpRes.on('end', () => resolve({ status: httpRes.statusCode, body: data }));
            });
            httpReq.on('error', reject);
            httpReq.write(requestBody);
            httpReq.end();
        });

        if (geminiResult.status !== 200) {
            let errMsg = `Gemini API error (HTTP ${geminiResult.status})`;
            try {
                const parsed = JSON.parse(geminiResult.body);
                errMsg = parsed?.error?.message || errMsg;
            } catch (_) {}
            console.error('Gemini refine error:', geminiResult.status, geminiResult.body);
            return res.status(502).json({ error: errMsg });
        }

        let geminiData;
        try {
            geminiData = JSON.parse(geminiResult.body);
        } catch (_) {
            return res.status(502).json({ error: 'AI returned an unreadable response. Please try again.' });
        }

        if (!geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return res.status(502).json({ error: 'AI returned an unexpected response format. Please try again.' });
        }

        return res.status(200).json(geminiData);

    } catch (err) {
        console.error('refine.js crash:', err.message);
        return res.status(500).json({ error: `Server error: ${err.message}` });
    }
};
