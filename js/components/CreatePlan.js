window.CreatePlan = {
    // Dynamic fields logic
    getFieldsForType(type) {
        const academic = ['Exam / Test', 'Assignment', 'Lab / Practical'];
        const project = ['Project', 'Presentation'];
        const event = ['College Event', 'Hackathon', 'Competition', 'Workshop', 'Club Activity', 'Trip'];
        
        let html = '';

        if (academic.includes(type)) {
            html += `
                <div class="space-y-4 fade-in">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Subjects / Topics</label>
                        <input type="text" name="topics" placeholder="e.g. Thermodynamics, Optics" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Available study hours per day</label>
                        <input type="number" name="availableTime" min="1" max="24" placeholder="e.g. 2" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow">
                    </div>
                </div>
            `;
        } else if (project.includes(type)) {
            html += `
                <div class="space-y-4 fade-in">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Project Requirements / Tech Stack</label>
                        <input type="text" name="requirements" placeholder="e.g. React, Node.js, 10 pages report" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Team Members (Optional)</label>
                        <input type="text" name="participants" placeholder="e.g. John, Sarah" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow">
                    </div>
                </div>
            `;
        } else if (event.includes(type)) {
            html += `
                <div class="space-y-4 fade-in">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Expected Participants / Team Size</label>
                        <input type="number" name="participants" placeholder="e.g. 50" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Budget (Optional)</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input type="number" name="budget" placeholder="0.00" class="w-full pl-7 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Venue (Optional)</label>
                        <input type="text" name="venue" placeholder="e.g. Main Auditorium" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow">
                    </div>
                </div>
            `;
        }

        return html;
    },

    attachEvents() {
        const typeSelect = document.getElementById('planType');
        const dynamicFieldsContainer = document.getElementById('dynamicFields');
        const form = document.getElementById('createPlanForm');
        const errorMsg = document.getElementById('errorMsg');

        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                dynamicFieldsContainer.innerHTML = this.getFieldsForType(e.target.value);
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Basic Validation
                if (!data.name || !data.type || !data.date) {
                    errorMsg.classList.remove('hidden');
                    return;
                }
                
                errorMsg.classList.add('hidden');
                window.Store.addPlan(data);
            });
        }
    },

    render() {
        // We will call attachEvents from app.js after rendering
        setTimeout(() => this.attachEvents(), 0);

        const types = [
            'Exam / Test', 'Assignment', 'Project', 'Presentation', 
            'Lab / Practical', 'College Event', 'Competition', 
            'Hackathon', 'Workshop', 'Club Activity', 'Trip', 'Other'
        ];

        return `
            <div class="fade-in max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
                <button onclick="window.Store.navigate('dashboard')" class="text-gray-500 hover:text-primary flex items-center gap-1.5 mb-6 transition-colors text-sm font-medium">
                    <i class="ph ph-arrow-left text-lg"></i>
                    Back to Dashboard
                </button>

                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    <div class="mb-8 border-b border-gray-100 pb-6">
                        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <i class="ph ph-magic-wand text-primary"></i>
                            Create New Plan
                        </h1>
                        <p class="text-gray-500 mt-2 text-sm">Tell us what's coming up, and let the AI generate a structured plan for you.</p>
                    </div>

                    <form id="createPlanForm" class="space-y-6">
                        <div id="errorMsg" class="hidden bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                            <i class="ph ph-warning-circle text-lg"></i>
                            Please fill in all required fields (Name, Type, Date).
                        </div>

                        <!-- Core Fields -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                                <input type="text" name="name" required placeholder="e.g. Physics Final Exam" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow">
                            </div>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Plan Type *</label>
                                    <select id="planType" name="type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow bg-white">
                                        <option value="" disabled selected>Select a type...</option>
                                        ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
                                    </select>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Date / Deadline *</label>
                                    <input type="date" name="date" required min="${new Date().toISOString().split('T')[0]}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow">
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea name="description" rows="3" placeholder="Add any details here..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"></textarea>
                            </div>
                        </div>

                        <!-- Dynamic Fields injected here -->
                        <div id="dynamicFields"></div>

                        <div class="pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <button type="button" onclick="window.Store.navigate('dashboard')" class="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" class="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm flex items-center gap-2">
                                <span>Generate AI Plan</span>
                                <i class="ph ph-sparkle"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
};
