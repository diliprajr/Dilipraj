window.Header = {
    render() {
        return `
            <header class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div class="flex items-center gap-2 cursor-pointer" onclick="window.Store.navigate('dashboard')">
                        <div class="bg-primary text-white p-1.5 rounded-lg">
                            <i class="ph ph-calendar-check text-xl"></i>
                        </div>
                        <span class="font-bold text-xl text-gray-900 tracking-tight">AI Student Planner</span>
                    </div>
                    <nav class="flex gap-4">
                        <button onclick="window.Store.navigate('dashboard')" class="text-gray-600 hover:text-primary font-medium text-sm transition-colors">
                            Dashboard
                        </button>
                        <button onclick="window.Store.navigate('create')" class="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm flex items-center gap-1.5">
                            <i class="ph ph-plus-circle text-lg"></i>
                            <span>Create Plan</span>
                        </button>
                    </nav>
                </div>
            </header>
        `;
    }
};
