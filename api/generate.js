export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'AI service is not configured. Please contact the application administrator.' });
    }

    const { planData } = req.body;
    if (!planData) {
        return res.status(400).json({ error: 'Missing planData in request body.' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `
You are an intelligent student planning assistant that converts an upcoming student activity into a realistic, actionable plan.
You must behave differently depending on the plan type (e.g. Exam vs College Event vs Project).
Always consider the deadline, available time, participants, and budget when provided.

You MUST return the output ONLY as a valid JSON object matching the following schema:
{
  "summary": "A brief encouraging summary of the plan.",
  "priorities": ["Top priority 1", "Top priority 2"],
  "checklist": [
    {
      "id": "c1",
      "title": "Task name",
      "description": "Short description",
      "priority": "high | medium | low",
      "deadline": "YYYY-MM-DD or relative description",
      "estimatedTime": "e.g. 2 hours",
      "completed": false
    }
  ],
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "tasks": ["Study Unit 1", "Draft introduction"],
      "estimatedHours": "2 hours"
    }
  ],
  "tasks": [
    {
      "id": "t1",
      "title": "Team/Delegated task name",
      "description": "Task description",
      "role": "Assigned role or 'Yourself'",
      "priority": "high | medium | low",
      "deadline": "YYYY-MM-DD"
    }
  ],
  "resources": [
    {
      "name": "Resource name",
      "category": "Equipment | Materials | People | Software | Venue | Other",
      "quantity": "Amount",
      "estimatedCost": "Numeric value or 0 if free"
    }
  ],
  "budget": {
    "estimatedTotal": 0,
    "breakdown": [
      {
        "item": "Item name",
        "cost": 0
      }
    ]
  },
  "recommendations": ["Tip 1", "Tip 2"]
}

Important Rules:
1. Do not invent arbitrary people unless names are provided; use roles (e.g., "Marketing Team", "Yourself").
2. Ensure dates in the schedule occur BEFORE the plan deadline.
3. If budget is irrelevant (like an individual exam), return 0 for costs and an empty budget breakdown.
4. Output raw JSON without markdown code blocks.
`;

    const userPrompt = `
Plan Details:
Name: ${planData.name}
Type: ${planData.type}
Date/Deadline: ${planData.date}
Description: ${planData.description || 'None provided'}
Topics/Requirements: ${planData.topics || planData.requirements || 'None provided'}
Available Time: ${planData.availableTime ? planData.availableTime + ' hours/day' : 'Not specified'}
Participants/Team: ${planData.participants || 'Individual'}
Budget: ${planData.budget ? '$' + planData.budget : 'No specific budget'}
Venue: ${planData.venue || 'Not specified'}

Generate the comprehensive plan based on the JSON schema provided.
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
            return res.status(500).json({ error: 'Failed to generate plan. Please try again.' });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Serverless Function Error:", error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
