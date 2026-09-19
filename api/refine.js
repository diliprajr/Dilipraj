export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'AI service is not configured. Please contact the application administrator.' });
    }

    const { planData, currentPlanOutput, instruction } = req.body;
    if (!planData || !currentPlanOutput || !instruction) {
        return res.status(400).json({ error: 'Missing required fields in request body.' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `
You are refining an existing AI-generated student plan based on new user instructions.
Preserve the existing structure and useful information, but adapt it according to the user's refinement request.
Output MUST be valid JSON matching the exact schema from the original generation.
`;

    const userPrompt = `
Original Plan Context:
Name: ${planData.name}
Type: ${planData.type}
Date: ${planData.date}

Current AI Plan Output:
${JSON.stringify(currentPlanOutput)}

User Refinement Instruction:
"${instruction}"

Please provide the updated plan in the strict JSON schema.
`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            return res.status(500).json({ error: 'Failed to refine plan. Please try again.' });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Serverless Function Error:", error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
