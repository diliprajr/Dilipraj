window.AIService = {
    async generatePlan(planData) {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ planData })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API returned ${response.status}`);
            }

            const data = await response.json();
            const jsonString = data.candidates[0].content.parts[0].text;
            
            let cleanJson = jsonString.trim();
            if (cleanJson.startsWith('```json')) {
                cleanJson = cleanJson.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
            } else if (cleanJson.startsWith('```')) {
                cleanJson = cleanJson.replace(/^```\n?/, '').replace(/\n```$/, '').trim();
            }

            const firstBrace = cleanJson.indexOf('{');
            const lastBrace = cleanJson.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
            }
            
            try {
                return JSON.parse(cleanJson);
            } catch (parseError) {
                console.error("Failed to parse AI JSON:", cleanJson);
                throw new Error("The AI generated an invalid plan format. Please try generating again.");
            }

        } catch (error) {
            console.error("Error generating plan:", error);
            throw new Error(error.message || "Failed to generate plan. Please check your connection.");
        }
    },
    
    async refinePlan(planData, currentPlanOutput, instruction) {
        try {
            const response = await fetch('/api/refine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ planData, currentPlanOutput, instruction })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API returned ${response.status}`);
            }

            const data = await response.json();
            const jsonString = data.candidates[0].content.parts[0].text;
            
            let cleanJson = jsonString.trim();
            if (cleanJson.startsWith('```json')) {
                cleanJson = cleanJson.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
            } else if (cleanJson.startsWith('```')) {
                cleanJson = cleanJson.replace(/^```\n?/, '').replace(/\n```$/, '').trim();
            }

            const firstBrace = cleanJson.indexOf('{');
            const lastBrace = cleanJson.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
            }

            try {
                return JSON.parse(cleanJson);
            } catch (parseError) {
                console.error("Failed to parse refined AI JSON:", cleanJson);
                throw new Error("The AI failed to refine the plan properly. Please try again.");
            }

        } catch (error) {
            console.error("Error refining plan:", error);
            throw new Error(error.message || "Failed to refine plan. Please try again.");
        }
    }
};
