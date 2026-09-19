// CommonJS format — guaranteed to work on all Vercel Node.js runtimes
const https = require('https');

module.exports = async function handler(req, res) {
    // CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({
            error: 'AI service is not configured. Add GEMINI_API_KEY to Vercel environment variables and redeploy.'
        });
    }

    const { planData } = req.body;
    if (!planData || !planData.name || !planData.type || !planData.date) {
        return res.status(400).json({ error: 'Missing required plan fields: name, type, date.' });
    }

    // gemini-2.0-flash is the current stable fast model
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are an intelligent student planning assistant. Convert the student's upcoming activity into a realistic, detailed, actionable plan.

Adapt your output entirely based on the plan type:
- Exam/Test: focus on study sessions, topic breakdown, revision, practice tests
- Project: focus on milestones, implementation phases, testing, documentation
- College Event: focus on logistics, team roles, venue, promotion, budget, resources
- Hackathon: focus on problem research, team roles, development, testing, demo prep
- Assignment: focus on research, drafting, review, submission
- Trip: focus on planning, transport, accommodation, packing, budget
- Other types: infer appropriate planning structure

Return ONLY a valid JSON object — no markdown, no explanation, no code fences. Raw JSON only.

Schema:
{
  "summary": "string",
  "priorities": ["string"],
  "checklist": [
    { "id": "c1", "title": "string", "description": "string", "priority": "high|medium|low", "deadline": "YYYY-MM-DD", "estimatedTime": "string", "completed": false }
  ],
  "schedule": [
    { "date": "YYYY-MM-DD", "tasks": ["string"], "estimatedHours": "string" }
  ],
  "tasks": [
    { "id": "t1", "title": "string", "description": "string", "role": "string", "priority": "high|medium|low", "deadline": "YYYY-MM-DD" }
  ],
  "resources": [
    { "name": "string", "category": "Equipment|Materials|People|Software|Venue|Other", "quantity": "string", "estimatedCost": "0" }
  ],
  "budget": {
    "estimatedTotal": 0,
    "breakdown": [{ "item": "string", "cost": 0 }]
  },
  "recommendations": ["string"]
}

Rules:
- Use role names (e.g. "Marketing Lead", "Yourself") not invented personal names
- All schedule dates MUST be before the deadline
- For solo academic plans (exam/assignment), set budget.estimatedTotal to 0 and breakdown to []
- Generate at least 5 checklist items
- Return raw JSON only`;

    const userPrompt = `Create a complete student plan:
Name: ${planData.name}
Type: ${planData.type}
Deadline: ${planData.date}
Description: ${planData.description || 'Not provided'}
Topics/Requirements: ${planData.topics || planData.requirements || 'Not provided'}
Available prep time: ${planData.availableTime ? planData.availableTime + ' hours/day' : 'Not specified'}
Participants/Team: ${planData.participants || 'Individual'}
Budget: ${planData.budget ? planData.budget : 'Not specified'}
Venue: ${planData.venue || 'Not specified'}

Return only the JSON object.`;

    const requestBody = JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { responseMimeType: 'application/json' }
    });

    try {
        // Use Node's built-in https module — avoids any fetch compatibility issues
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
            console.error('Gemini error:', geminiResult.status, geminiResult.body);
            return res.status(502).json({ error: errMsg });
        }

        let geminiData;
        try {
            geminiData = JSON.parse(geminiResult.body);
        } catch (_) {
            console.error('Cannot parse Gemini response body:', geminiResult.body);
            return res.status(502).json({ error: 'AI returned an unreadable response. Please try again.' });
        }

        if (!geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error('Unexpected Gemini structure:', JSON.stringify(geminiData));
            return res.status(502).json({ error: 'AI returned an unexpected response structure. Please try again.' });
        }

        return res.status(200).json(geminiData);

    } catch (err) {
        console.error('generate.js crash:', err.message);
        return res.status(500).json({ error: `Server error: ${err.message}` });
    }
};
