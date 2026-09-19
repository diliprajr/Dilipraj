document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');

    function renderApp(state) {
        let contentHtml = '';

        if (state.currentView === 'dashboard') {
            contentHtml = window.Dashboard.render(state);
        } else if (state.currentView === 'create') {
            contentHtml = window.CreatePlan.render(state);
        } else if (state.currentView === 'preview') {
            contentHtml = window.PlanPreview.render(state);
        }

        // Render layout
        appElement.innerHTML = `
            ${window.Header.render()}
            <main class="flex-grow bg-background flex">
                ${contentHtml}
            </main>
        `;
    }

    // Subscribe to state changes to re-render
    window.Store.subscribe(renderApp);

    // Initial render
    renderApp(window.Store.state);
});
