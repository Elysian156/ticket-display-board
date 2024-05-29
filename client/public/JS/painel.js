document.addEventListener("DOMContentLoaded", () => {
    updateTheme();
});

window.addEventListener('storage', (event) => {
    if (event.key === 'themeStorage') {
        updateTheme();
    }
});

function updateTheme() {
    const themeValues = JSON.parse(localStorage.getItem("themeStorage"));
    const root = document.documentElement;

    if (themeValues) {
        Object.entries(themeValues).forEach(([key, value]) => {
            root.style.setProperty(`--layout-${key}`, value);
        });
    }
}