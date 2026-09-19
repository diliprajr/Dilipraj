// Simple global state management
const savedPlans = localStorage.getItem('aiStudentPlans');
const defaultPlans = [
    {
        id: 1,
        name: 'Physics Internal Test',
        type: 'Exam / Test',
        date: '2023-10-15',
        status: 'Pending AI Plan',
        progress: 0,
        topics: 'Units 1–4',
        availableTime: '2'
    },
    {
        id: 2,
        name: 'Department Symposium',
        type: 'College Event',
        date: '2023-11-20',
        status: 'Pending AI Plan',
        progress: 0,
        participants: '300',
        budget: '50000'
    },
    {
        id: 3,
        name: 'Computer Science Project',
        type: 'Project',
        date: '2023-12-05',
        status: 'Pending AI Plan',
        progress: 0,
        requirements: 'React frontend, Firebase backend'
    },
    {
        id: 4,
        name: 'College Hackathon',
        type: 'Hackathon',
        date: '2023-10-25',
        status: 'Pending AI Plan',
        progress: 0,
        participants: '4'
    }
];

window.Store = {
    state: {
        currentView: 'dashboard', // 'dashboard', 'create', 'preview'
        currentPlanData: null,
        plans: savedPlans ? JSON.parse(savedPlans) : defaultPlans,
        isGenerating: false,
        generationError: null
    },
    
    listeners: [],
    
    subscribe(listener) {
        this.listeners.push(listener);
    },
    
    notify() {
        this.listeners.forEach(listener => listener(this.state));
        localStorage.setItem('aiStudentPlans', JSON.stringify(this.state.plans));
    },
    
    navigate(view, data = null) {
        this.state.currentView = view;
        if (data) {
            this.state.currentPlanData = data;
        }
        this.notify();
    },
    
    addPlan(plan) {
        const newPlan = {
            id: Date.now(),
            status: 'Pending AI Plan',
            progress: 0,
            aiData: null, // Will hold the generated JSON
            ...plan
        };
        this.state.plans.unshift(newPlan);
        this.navigate('preview', newPlan);
    },

    updatePlanAI(planId, aiData) {
        const plan = this.state.plans.find(p => p.id === planId);
        if (plan) {
            plan.aiData = aiData;
            plan.status = 'Planned';
            this.notify();
        }
    },

    setGenerating(isGenerating, error = null) {
        this.state.isGenerating = isGenerating;
        this.state.generationError = error;
        this.notify();
    },

    toggleTaskCompletion(planId, taskId) {
        const plan = this.state.plans.find(p => p.id === planId);
        if (plan && plan.aiData && plan.aiData.checklist) {
            const task = plan.aiData.checklist.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                // Calculate progress
                const total = plan.aiData.checklist.length;
                const completed = plan.aiData.checklist.filter(t => t.completed).length;
                plan.progress = Math.round((completed / total) * 100);
                
                if (plan.progress === 100) plan.status = 'Completed';
                else plan.status = 'In Progress';
                
                this.notify();
            }
        }
    },

    deletePlan(planId) {
        if (confirm('Are you sure you want to delete this plan?')) {
            this.state.plans = this.state.plans.filter(p => p.id !== planId);
            this.notify();
        }
    }
};
