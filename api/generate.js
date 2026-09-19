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

    const { planData } = req.body;
    if (!planData || !planData.name || !planData.type || !planData.date) {
        return res.status(400).json({ error: 'Missing required plan fields (name, type, date).' });
    }

    // Use gemini-2.0-flash (latest stable, widely supported)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are an intelligent student planning assistant that converts an upcoming student activity into a realistic, actionable plan.
You must behave differently depending on the plan type (e.g. Exam vs College Event vs Project vs Hackathon).
Always consider the deadline, available time, participants, and budget when provided.

You MUST return ONLY a valid JSON object. No markdown, no explanation, no code fences.

JSON schema:
{
  "summary": "Brief encouraging summary",
  "priorities": ["Priority 1", "Priority 2"],
  "checklist": [
    {
      "id": "c1",
      "title": "Task name",
      "description": "Short description",
      "priority": "high",
      "deadline": "YYYY-MM-DD",
      "estimatedTime": "2 hours",
      "completed": false
    }
  ],
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "tasks": ["Task description"],
      "estimatedHours": "2 hours"
    }
  ],
  "tasks": [
    {
      "id": "t1",
      "title": "Task name",
      "description": "Description",
      "role": "Role or Yourself",
      "priority": "high",
      "deadline": "YYYY-MM-DD"
    }
  ],
  "resources": [
    {
      "name": "Resource",
      "category": "Materials",
      "quantity": "1",
      "estimatedCost": "0"
    }
  ],
  "budget": {
    "estimatedTotal": 0,
    "breakdown": [{ "item": "Item", "cost": 0 }]
  },
  "recommendations": ["Tip 1", "Tip 2"]
}

Rules:
- Use roles not invented names unless user provides names
- All schedule dates must be BEFORE the deadline
- For individual academic plans (exam/assignment), set budget estimatedTotal to 0
- Return raw JSON only, no markdown fences`;

    const userPrompt = `Create a complete student plan for:
Name: ${planData.name}
Type: ${planData.type}
Deadline: ${planData.date}
Description: ${planData.description || 'Not provided'}
Topics/Requirements: ${planData.topics || planData.requirements || 'Not provided'}
Study/Prep time available: ${planData.availableTime ? planData.availableTime + ' hours/day' : 'Not specified'}
Participants/Team size: ${planData.participants || 'Individual / Solo'}
Budget: ${planData.budget ? '$' + planData.budget : 'No budget specified'}
Venue: ${planData.venue || 'Not specified'}

Return only the JSON object.`;

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
            // Parse the Gemini error and surface it properly
            let geminiError = 'Gemini API request failed.';
            try {
                const parsed = JSON.parse(responseText);
                geminiError = parsed?.error?.message || geminiError;
            } catch (_) {}
            console.error('Gemini API Error:', geminiResponse.status, responseText);
            return res.status(502).json({
                error: `AI service error: ${geminiError}`,
                status: geminiResponse.status
            });
        }

        // Parse and validate the response
        let geminiData;
        try {
            geminiData = JSON.parse(responseText);
        } catch (_) {
            console.error('Failed to parse Gemini response:', responseText);
            return res.status(502).json({ error: 'AI returned an unreadable response. Please try again.' });
        }

        // Validate expected structure
        if (!geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error('Unexpected Gemini response structure:', JSON.stringify(geminiData));
            return res.status(502).json({ error: 'AI returned an unexpected response format. Please try again.' });
        }

        return res.status(200).json(geminiData);

    } catch (error) {
        console.error('Serverless Function Error:', error.message);
        return res.status(500).json({ error: `Server error: ${error.message}` });
    }
}
