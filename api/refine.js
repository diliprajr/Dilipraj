export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'AI service is not configured. Please add GEMINI_API_KEY in Vercel environment variables.' });
    }

    const { planData, currentPlanOutput, instruction } = req.body;
    if (!planData || !instruction) {
        return res.status(400).json({ error: 'Missing required fields: planData and instruction.' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are refining an existing AI-generated student plan based on the user's new instruction.
Preserve all useful existing information. Only modify what the instruction asks to change.
Return ONLY a valid JSON object matching the same schema as the original. No markdown, no explanation.`;

    const userPrompt = `Original plan:
Name: ${planData.name}
Type: ${planData.type}
Deadline: ${planData.date}

Current plan JSON:
${JSON.stringify(currentPlanOutput, null, 2)}

User instruction: "${instruction}"

Apply the instruction to the plan and return the updated JSON object only.`;

    try {
        const geminiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: { responseMimeType: 'application/json' }
            })
        });

        const responseText = await geminiResponse.text();

        if (!geminiResponse.ok) {
            let geminiError = 'Gemini API request failed.';
            try {
                const parsed = JSON.parse(responseText);
                geminiError = parsed?.error?.message || geminiError;
            } catch (_) {}
            console.error('Gemini API Error (refine):', geminiResponse.status, responseText);
            return res.status(502).json({
                error: `AI service error: ${geminiError}`,
                status: geminiResponse.status
            });
        }

        let geminiData;
        try {
            geminiData = JSON.parse(responseText);
        } catch (_) {
            return res.status(502).json({ error: 'AI returned an unreadable response. Please try again.' });
        }

        if (!geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
            return res.status(502).json({ error: 'AI returned an unexpected response format. Please try again.' });
        }

        return res.status(200).json(geminiData);

    } catch (error) {
        console.error('Serverless Function Error (refine):', error.message);
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }
}
