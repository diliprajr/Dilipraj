window.AIService = {

    // Detect if running locally via file:// (serverless functions won't work)
    isLocalFile() {
        return window.location.protocol === 'file:';
    },

    async generatePlan(planData) {
        if (this.isLocalFile()) {
            throw new Error(
                'AI generation requires the app to be deployed on Vercel. ' +
                'Open the app from your Vercel URL (https://your-app.vercel.app) to use AI features.'
            );
        }

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planData })
            });

            let data;
            try {
                data = await response.json();
            } catch (_) {
                throw new Error(`Server returned an unreadable response (HTTP ${response.status}). Please try again.`);
            }

            if (!response.ok) {
                // Surface the actual error from the backend
                throw new Error(data.error || `Request failed with status ${response.status}.`);
            }

            // Validate Gemini response structure
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error('AI returned an empty response. Please try generating again.');
            }

            // Parse the JSON plan
            let cleanJson = text.trim();
            // Strip markdown fences if present
            cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            // Extract JSON object in case of surrounding text
            const first = cleanJson.indexOf('{');
            const last  = cleanJson.lastIndexOf('}');
            if (first !== -1 && last !== -1) {
                cleanJson = cleanJson.substring(first, last + 1);
            }

            try {
                return JSON.parse(cleanJson);
            } catch (parseError) {
                console.error('Failed to parse AI JSON:', cleanJson);
                throw new Error('AI returned an invalid plan format. Please try generating again.');
            }

        } catch (error) {
            // Re-throw with the real message so UI can display it
            throw new Error(error.message || 'Failed to generate plan. Please check your connection and try again.');
        }
    },

    async refinePlan(planData, currentPlanOutput, instruction) {
        if (this.isLocalFile()) {
            throw new Error(
                'AI refinement requires the app to be deployed on Vercel. ' +
                'Open the app from your Vercel URL to use AI features.'
            );
        }

        try {
            const response = await fetch('/api/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planData, currentPlanOutput, instruction })
            });

            let data;
            try {
                data = await response.json();
            } catch (_) {
                throw new Error(`Server returned an unreadable response (HTTP ${response.status}). Please try again.`);
            }

            if (!response.ok) {
                throw new Error(data.error || `Request failed with status ${response.status}.`);
            }

            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error('AI returned an empty response. Please try refining again.');
            }

            let cleanJson = text.trim();
            cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            const first = cleanJson.indexOf('{');
            const last  = cleanJson.lastIndexOf('}');
            if (first !== -1 && last !== -1) {
                cleanJson = cleanJson.substring(first, last + 1);
            }

            try {
                return JSON.parse(cleanJson);
            } catch (parseError) {
                console.error('Failed to parse refined AI JSON:', cleanJson);
                throw new Error('AI returned an invalid format after refinement. Please try again.');
            }

        } catch (error) {
            throw new Error(error.message || 'Failed to refine plan. Please try again.');
        }
    }
};
