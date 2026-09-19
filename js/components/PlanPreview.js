window.PlanPreview = {
    async handleGeneratePlan(plan) {
        window.Store.setGenerating(true, null);
        try {
            const aiData = await window.AIService.generatePlan(plan);
            window.Store.updatePlanAI(plan.id, aiData);
        } catch (error) {
            window.Store.setGenerating(false, error.message);
        }
        window.Store.setGenerating(false, null);
    },

    async handleRefinePlan(plan, instruction) {
        if (!instruction.trim()) return;
        window.Store.setGenerating(true, null);
        try {
            const aiData = await window.AIService.refinePlan(plan, plan.aiData, instruction);
            window.Store.updatePlanAI(plan.id, aiData);
        } catch (error) {
            window.Store.setGenerating(false, error.message);
        }
        window.Store.setGenerating(false, null);
    },

    attachEvents() {
        const genBtn = document.getElementById('generateAiBtn');
        if (genBtn) {
            genBtn.addEventListener('click', () => {
                const plan = window.Store.state.currentPlanData;
                this.handleGeneratePlan(plan);
            });
        }

        const refineForm = document.getElementById('refineForm');
        if (refineForm) {
            refineForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('refineInput').value;
                const plan = window.Store.state.currentPlanData;
                this.handleRefinePlan(plan, input);
            });
        }
    },

    renderChecklist(checklist, planId) {
        if (!checklist || checklist.length === 0) return '';
        
        const completedCount = checklist.filter(t => t.completed).length;
        const progress = Math.round((completedCount / checklist.length) * 100);

        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i class="ph ph-check-square-offset text-primary"></i> Checklist
                </h3>
                
                <div class="mb-4">
                    <div class="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>Progress</span>
                        <span class="font-medium text-gray-700">${progress}% (${completedCount} of ${checklist.length})</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                        <div class="bg-primary h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="space-y-3">
                    ${checklist.map(task => `
                        <div class="flex items-start gap-3 p-3 rounded-lg border ${task.completed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-200'} transition-all">
                            <input type="checkbox" 
                                ${task.completed ? 'checked' : ''} 
                                onchange="window.Store.toggleTaskCompletion(${planId}, '${task.id}')"
                                class="mt-1 w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer">
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-900 text-sm ${task.completed ? 'line-through' : ''}">${task.title}</h4>
                                <p class="text-xs text-gray-500 mt-1">${task.description}</p>
                                <div class="flex gap-3 mt-2 text-xs font-medium text-gray-400">
                                    <span class="flex items-center gap-1"><i class="ph ph-clock"></i> ${task.estimatedTime}</span>
                                    ${task.deadline ? `<span class="flex items-center gap-1"><i class="ph ph-calendar"></i> ${task.deadline}</span>` : ''}
                                    <span class="px-1.5 rounded bg-gray-100 text-gray-600 capitalize">${task.priority} Priority</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderSchedule(schedule) {
        if (!schedule || schedule.length === 0) return '';
        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i class="ph ph-calendar-check text-primary"></i> Timeline / Schedule
                </h3>
                <div class="relative border-l-2 border-indigo-100 ml-3 space-y-6">
                    ${schedule.map(slot => `
                        <div class="relative pl-6">
                            <div class="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-primary rounded-full"></div>
                            <h4 class="font-bold text-gray-900 text-sm">${slot.date} <span class="text-xs font-normal text-gray-500 ml-2">(${slot.estimatedHours})</span></h4>
                            <ul class="mt-2 space-y-1">
                                ${slot.tasks.map(t => `<li class="text-sm text-gray-600 flex items-start gap-2"><i class="ph ph-caret-right text-primary mt-0.5"></i> ${t}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderTasks(tasks) {
        if (!tasks || tasks.length === 0) return '';
        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i class="ph ph-users text-primary"></i> Team Tasks
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    ${tasks.map(task => `
                        <div class="p-4 rounded-xl border border-gray-100 bg-gray-50">
                            <div class="text-xs font-bold text-primary mb-1 uppercase tracking-wider">${task.role}</div>
                            <h4 class="font-semibold text-gray-900 text-sm mb-1">${task.title}</h4>
                            <p class="text-xs text-gray-600 mb-3">${task.description}</p>
                            <div class="flex justify-between items-center text-xs text-gray-500 font-medium">
                                <span><i class="ph ph-calendar"></i> ${task.deadline}</span>
                                <span class="capitalize px-1.5 py-0.5 bg-white rounded shadow-sm">${task.priority}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderResources(resources) {
        if (!resources || resources.length === 0) return '';
        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i class="ph ph-package text-primary"></i> Resources
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    ${resources.map(res => `
                        <div class="flex justify-between items-center p-3 rounded-lg border border-gray-200">
                            <div>
                                <h4 class="font-medium text-gray-900 text-sm">${res.name} <span class="text-xs text-gray-500 ml-1">x${res.quantity}</span></h4>
                                <p class="text-xs text-gray-500 capitalize">${res.category}</p>
                            </div>
                            <div class="text-sm font-semibold text-gray-700">
                                ${res.estimatedCost ? (res.estimatedCost === '0' || res.estimatedCost === 0 ? 'Free' : '$' + res.estimatedCost) : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderBudget(budget) {
        if (!budget || !budget.estimatedTotal || budget.estimatedTotal === 0) return '';
        return `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i class="ph ph-currency-dollar text-primary"></i> Budget Estimate
                </h3>
                <div class="mb-4 flex items-end gap-2">
                    <span class="text-3xl font-bold text-gray-900">$${budget.estimatedTotal}</span>
                    <span class="text-sm text-gray-500 mb-1">Total Estimated</span>
                </div>
                <div class="space-y-2">
                    ${budget.breakdown.map(item => `
                        <div class="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                            <span class="text-gray-600">${item.item}</span>
                            <span class="font-medium text-gray-900">$${item.cost}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderRecommendations(recommendations) {
        if (!recommendations || recommendations.length === 0) return '';
        return `
            <div class="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl shadow-sm border border-amber-100 p-6 mb-6">
                <h3 class="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <i class="ph ph-lightbulb text-amber-600"></i> AI Recommendations
                </h3>
                <ul class="space-y-2">
                    ${recommendations.map(rec => `
                        <li class="text-sm text-amber-800 flex items-start gap-2">
                            <i class="ph ph-sparkle text-amber-500 mt-0.5"></i>
                            <span>${rec}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    },

    render(state) {
        // We will call attachEvents from app.js after rendering
        setTimeout(() => this.attachEvents(), 0);

        const plan = state.currentPlanData;
        if (!plan) return '';

        // Extract basic plan info
        const optionalFields = [];
        if (plan.description) optionalFields.push({ label: 'Description', value: plan.description });
        if (plan.topics) optionalFields.push({ label: 'Topics', value: plan.topics });
        if (plan.availableTime) optionalFields.push({ label: 'Available Time', value: `${plan.availableTime} hours/day` });
        if (plan.requirements) optionalFields.push({ label: 'Requirements', value: plan.requirements });
        if (plan.participants) optionalFields.push({ label: 'Participants', value: plan.participants });
        if (plan.budget) optionalFields.push({ label: 'Budget', value: `$${plan.budget}` });
        if (plan.venue) optionalFields.push({ label: 'Venue', value: plan.venue });

        let rightColumnHtml = '';

        if (state.isGenerating) {
            rightColumnHtml = `
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                    <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6 relative">
                        <i class="ph ph-magic-wand text-3xl text-primary animate-spin"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">Generating AI Plan...</h3>
                    <p class="text-gray-500 max-w-md mx-auto mb-6 text-sm">
                        Analyzing your plan... Breaking it into tasks... Building your timeline... Preparing your resources...
                    </p>
                </div>
            `;
        } else if (state.generationError) {
            rightColumnHtml = `
                <div class="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                    <i class="ph ph-warning-circle text-4xl text-red-500 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Generation Failed</h3>
                    <p class="text-gray-600 mb-6 text-sm max-w-md">${state.generationError}</p>
                    <button id="generateAiBtn" class="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm">
                        Try Again
                    </button>
                </div>
            `;
        } else if (!plan.aiData) {
            rightColumnHtml = `
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                    <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                        <i class="ph ph-magic-wand text-3xl text-primary"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-900 mb-2">Ready to Plan</h3>
                    <p class="text-gray-500 max-w-md mx-auto mb-8 text-sm">
                        Click below to generate your personalized checklist, schedule, task allocation, and resources using AI.
                    </p>
                    <button id="generateAiBtn" class="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-xl font-semibold text-md transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                        <i class="ph ph-sparkle"></i> Generate AI Plan
                    </button>
                </div>
            `;
        } else {
            // AI Data is present
            const data = plan.aiData;
            
            // Check if plan is completed
            const isCompleted = plan.progress === 100;
            const completedBannerHtml = isCompleted ? `
                <div class="bg-green-50 border border-green-200 text-green-800 rounded-xl p-5 mb-6 flex items-center gap-4 fade-in">
                    <div class="bg-green-100 p-2 rounded-full text-green-600">
                        <i class="ph ph-check-circle text-2xl"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg">Plan completed 🎉</h3>
                        <p class="text-sm text-green-700 mt-0.5">Great job! You have completed all checklist items for this plan.</p>
                    </div>
                </div>
            ` : '';

            rightColumnHtml = `
                ${completedBannerHtml}
                <div class="mb-6 flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-900">Your Action Plan</h2>
                    <button id="generateAiBtn" class="bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:text-primary hover:border-indigo-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
                        <i class="ph ph-arrows-clockwise"></i> Regenerate
                    </button>
                </div>
                
                ${data.summary ? `<div class="bg-indigo-50 text-indigo-900 p-5 rounded-xl mb-6 text-sm border border-indigo-100 leading-relaxed shadow-sm"><i class="ph ph-info text-indigo-500 mr-1 text-lg align-text-bottom"></i> ${data.summary}</div>` : ''}
                
                ${data.priorities && data.priorities.length > 0 ? `
                    <div class="mb-6">
                        <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Top Priorities</h3>
                        <div class="flex flex-wrap gap-2">
                            ${data.priorities.map(p => `<span class="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-100 flex items-center gap-1.5"><i class="ph ph-warning-circle"></i> ${p}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${this.renderChecklist(data.checklist, plan.id)}
                ${this.renderSchedule(data.schedule)}
                ${this.renderTasks(data.tasks)}
                ${this.renderResources(data.resources)}
                ${this.renderBudget(data.budget)}
                ${this.renderRecommendations(data.recommendations)}

                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
                    <h3 class="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <i class="ph ph-magic-wand text-primary"></i> Refine with AI
                    </h3>
                    <p class="text-xs text-gray-500 mb-4">Ask AI to modify your plan (e.g. "Make the schedule less intense", "Reduce budget to $300").</p>
                    <form id="refineForm" class="flex gap-2">
                        <input type="text" id="refineInput" placeholder="How should we adjust this?" class="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                        <button type="submit" class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Refine
                        </button>
                    </form>
                </div>
            `;
        }

        return `
            <div class="fade-in max-w-6xl mx-auto w-full px-4 sm:px-6 py-10">
                <button onclick="window.Store.navigate('dashboard')" class="text-gray-500 hover:text-primary flex items-center gap-1.5 mb-6 transition-colors text-sm font-medium">
                    <i class="ph ph-arrow-left text-lg"></i>
                    Back to Dashboard
                </button>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Left Column: User Input Summary -->
                    <div class="lg:col-span-1 space-y-6">
                        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <div class="mb-4">
                                <span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-primary mb-3">
                                    ${plan.type}
                                </span>
                                <h2 class="text-xl font-bold text-gray-900 break-words">${plan.name}</h2>
                                <div class="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                                    <i class="ph ph-calendar-blank"></i>
                                    <span>${plan.date}</span>
                                </div>
                            </div>
                            
                            ${optionalFields.length > 0 ? `
                                <div class="border-t border-gray-100 pt-4 space-y-3">
                                    ${optionalFields.map(f => `
                                        <div>
                                            <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">${f.label}</p>
                                            <p class="text-sm text-gray-800 mt-0.5 break-words">${f.value}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Right Column: AI Output -->
                    <div class="lg:col-span-2">
                        ${rightColumnHtml}
                    </div>
                </div>
            </div>
        `;
    }
};
