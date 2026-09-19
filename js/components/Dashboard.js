window.Dashboard = {
    renderCard(plan) {
        const getIcon = (type) => {
            if (!type) return 'ph-calendar-blank';
            if (type.includes('Exam')) return 'ph-exam';
            if (type.includes('Project')) return 'ph-kanban';
            if (type.includes('Event')) return 'ph-confetti';
            if (type.includes('Hackathon')) return 'ph-code';
            return 'ph-calendar-blank';
        };

        const progressColor = plan.progress === 100 ? 'bg-green-500' : (plan.progress > 50 ? 'bg-indigo-400' : 'bg-primary');

        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative group">
                <button onclick="event.stopPropagation(); window.Store.deletePlan(${plan.id})" class="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1" title="Delete Plan">
                    <i class="ph ph-trash text-lg"></i>
                </button>
                <div class="cursor-pointer h-full flex flex-col" onclick="window.Store.navigate('preview', window.Store.state.plans.find(p => p.id === ${plan.id}))">
                    <div class="flex justify-between items-start mb-4 pr-6">
                        <div class="flex items-center gap-3">
                            <div class="bg-indigo-50 text-primary p-2.5 rounded-lg flex-shrink-0">
                                <i class="ph ${getIcon(plan.type)} text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="font-semibold text-gray-900 line-clamp-1">${plan.name}</h3>
                                <p class="text-xs text-gray-500 mt-0.5">${plan.type}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <div class="flex items-center justify-between text-sm text-gray-600">
                            <div class="flex items-center gap-1.5">
                                <i class="ph ph-calendar-blank text-gray-400"></i>
                                <span>${new Date(plan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${plan.status === 'Completed' ? 'bg-green-50 text-green-700' : (plan.status === 'Pending AI Plan' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700')}">
                                ${plan.status}
                            </span>
                        </div>
                    </div>

                    <div class="mt-auto pt-4 border-t border-gray-50">
                        <div class="flex justify-between text-xs text-gray-500 mb-1.5">
                            <span>Progress</span>
                            <span class="font-medium text-gray-700">${plan.progress}%</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-1.5">
                            <div class="${progressColor} h-1.5 rounded-full transition-all duration-500" style="width: ${plan.progress}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    render(state) {
        let plansContent = '';

        if (state.plans.length === 0) {
            plansContent = `
                <div class="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div class="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="ph ph-calendar-plus text-3xl"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 mb-1">No plans yet</h3>
                    <p class="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Create your first plan and let AI organize it for you with tasks, schedules, and resources.</p>
                    <button onclick="window.Store.navigate('create')" class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-2">
                        <i class="ph ph-plus"></i>
                        Create a Plan
                    </button>
                </div>
            `;
        } else {
            plansContent = `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${state.plans.map(plan => this.renderCard(plan)).join('')}
                </div>
            `;
        }

        return `
            <div class="fade-in max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
                
                <!-- Hero Section -->
                <div class="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -z-10 opacity-70"></div>
                    <div class="max-w-xl z-10">
                        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                            What's coming up? <br>
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Let AI turn it into a plan.</span>
                        </h1>
                        <p class="text-lg text-gray-600 mb-8">
                            Plan exams, projects, events, deadlines and everything in between. Get personalized checklists, schedules, and resource recommendations.
                        </p>
                        <button onclick="window.Store.navigate('create')" class="bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center">
                            <i class="ph ph-magic-wand text-xl"></i>
                            <span>Create New Plan</span>
                        </button>
                    </div>
                    <div class="hidden md:flex w-56 h-56 bg-white rounded-full items-center justify-center border-8 border-indigo-50/50 shadow-lg relative z-10">
                        <i class="ph ph-calendar-check text-primary" style="font-size: 8rem;"></i>
                    </div>
                </div>

                <!-- Your Plans Section -->
                <div>
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold text-gray-900">Your Plans</h2>
                    </div>
                    ${plansContent}
                </div>
            </div>
        `;
    }
};
