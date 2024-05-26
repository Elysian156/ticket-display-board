document.addEventListener("DOMContentLoaded", initializeValues);

const THEME_STORAGE_KEY = "themeStorage";
const DEFAULT_THEME = {
    "background-color": "#FFFFFF",
    "text-color": "#FFFFFF",
    "primary-color": "#00B0F0",
    "secondary-color": "#262626",
    "ui-show-time": "TRUE",
    "ui-show-date": "TRUE",
};
const THEME_KEYS = ["background-color", "text-color", "primary-color", "secondary-color"];
const BOOLEAN_KEYS = ["ui-show-time", "ui-show-date"];

// Função para inicializar os valores do tema
function initializeValues() {
    try {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(DEFAULT_THEME));
            console.log('Create themeStorage(Status): %cSuccess', 'color: green');
        }
        console.log('initializeValues(Status): %cCalled', 'color: green');
        updateTheme();
    } catch (error) {
        console.error(`%cinitializeValues(Error): ${error.message}`, 'color: red');
    }
}

// Função para salvar os valores atualizados do tema no localStorage
function saveUpdatedValues() {
    try {
        const updatedTheme = getUpdatedThemeValues();
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updatedTheme));
        console.log('SaveUpdatedValues(Status): %cSuccess', 'color: green');
        updateTheme();
    } catch (error) {
        console.error(`%cSaveUpdatedValues(Error): ${error.message}`, 'color: red');
    }
}

// Função para obter os valores atualizados do tema
function getUpdatedThemeValues() {
    const updatedTheme = {};
    const allKeys = [...THEME_KEYS, ...BOOLEAN_KEYS];

    allKeys.forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            updatedTheme[key] = element.value.toUpperCase();
        }
    });

    return updatedTheme;
}

// Função para atualizar o tema com base nos valores do localStorage
function updateTheme() {
    try {
        const themeValues = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY));
        const root = document.documentElement;

        THEME_KEYS.forEach((key, index) => {
            const value = themeValues[key];
            root.style.setProperty(`--layout-${key}`, value);
            updateElementValue(key, value);
            updateSpanText(index + 1, value);
        });


        console.log('UpdateTheme(Status): %cSuccess', 'color: green');
        notifyStorageChange();
    } catch (error) {
        console.error(`%cUpdateTheme(Error): ${error.message}`, 'color: red');
    }
}

// Função para atualizar o valor do elemento
function updateElementValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
}

// Função para atualizar o texto do span
function updateSpanText(index, value) {
    const span = document.getElementById(`span${index}`);
    if (span) span.textContent = value;
}

// Função para notificar mudanças no localStorage
function notifyStorageChange() {
    try {
        const event = new Event('storageChange');
        window.dispatchEvent(event);
        console.log('NotifyStorageChange(Status): %cSuccess', 'color: green');
    } catch (error) {
        console.error(`%cNotifyStorageChange(Error): ${error.message}`, 'color: red');
    }
}

document.querySelector("#reset").addEventListener('click', (event) => {
    if (confirm("Você tem certeza?")) {
        localStorage.clear();
        location.reload();
        console.log('%cLocalStorage(Status): Cleared', 'color: green');       
    }


});

// Adiciona um ouvinte de eventos para o botão de atualizar
document.getElementById("update").addEventListener("click", saveUpdatedValues);
