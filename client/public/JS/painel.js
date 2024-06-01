document.addEventListener("DOMContentLoaded", () => {
    updateDateTime();
    updateCarrousel();
    updateTheme();
    displayCurrent(JSON.parse(localStorage.getItem('currentCall')));
    styleAll(JSON.parse(localStorage.getItem('currentCall')), JSON.parse(localStorage.getItem('lastCalls')));
});

window.addEventListener('storage', (event) => {
    if (event.key === 'themeStorage') {
        updateTheme();
    } else if (event.key === "currentCall") {
        displayCurrent(JSON.parse(localStorage.getItem('currentCall')));
    }
});

window.addEventListener('queueDataApplied', (event) => {
    const current = event.detail.currentCall;
    const lastCalls = event.detail.lastCalls;
    styleAll(current, lastCalls);
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

function styleAll(current, previousCalls) {
    if (!current) return;

    document.querySelectorAll('.current-reception-number').forEach(element => {
        element.textContent = current.appointment_number;
    });
    document.querySelectorAll('.current-appointment-number').forEach(element => {
        element.textContent = current.reception_number;
    });
    document.querySelector(".current-pacient-name").textContent = current.name;

    const tableBody = document.querySelector('.table-body');

    if (previousCalls && previousCalls.length > 0) {
        previousCalls.reverse();
        previousCalls.forEach(call => {
            if (!isCallExistsInTable(call)) {
                const tr = document.createElement('tr');
                const senhaTd = document.createElement('td');
                senhaTd.textContent = call.appointment_number;
                const guicheTd = document.createElement('td');
                guicheTd.textContent = call.reception_number;
                tr.appendChild(senhaTd);
                tr.appendChild(guicheTd);
                tableBody.insertBefore(tr, tableBody.firstChild);
            }
        });
    } else {
        console.log('Não há chamadas anteriores');
    }
}

function isCallExistsInTable(call) {
    const tableRows = document.querySelectorAll('.table-body tr');
    for (let i = 0; i < tableRows.length; i++) {
        const row = tableRows[i];
        const senhaTd = row.querySelector('td:first-child');
        if (senhaTd && senhaTd.textContent === call.appointment_number) {
            return true;
        }
    }
    return false;
}

function displayCurrent(current) {
    if (current.called > 1) return;
    const audio = new Audio('../Audio/72128__kizilsungur__sweetalertsound4.wav');
    const utternance = new SpeechSynthesisUtterance(current.name);
    
    let gambiarra = 0;
    // Literalmente resolvendo com uma gambiarra: usando movimento do mouse para garantir interação do usuário
    window.addEventListener("mousemove", () => {
        if (gambiarra < 1) {
            audio.play();
            speechSynthesis.speak(utternance);
            gambiarra += 1;
        }
    });

    Highlightticket();
    setColorScheme(current.eligibility_reason);

    let currentCall = JSON.parse(localStorage.getItem('currentCall'));
    currentCall.called += 1;
    localStorage.setItem("currentCall", JSON.stringify(currentCall));
}

function Highlightticket() {
    const ticketHighlight = document.querySelector(".ticket-highlight");

    ticketHighlight.classList.add("ticket-highlight-show");
    setTimeout(() => {
        ticketHighlight.classList.remove("ticket-highlight-show");
    }, 5000);
}

function setColorScheme(eligibility_reason) {
    const defaultColors = {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--layout-background-color').trim(),
        primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--layout-primary-color').trim(),
        secondaryColor: getComputedStyle(document.documentElement).getPropertyValue('--layout-secondary-color').trim(),
        textColor: getComputedStyle(document.documentElement).getPropertyValue('--layout-text-color').trim(),
    };

    switch (eligibility_reason) {
        case 'protanopia':
            document.documentElement.style.setProperty('--layout-background-color', '#a6611a');
            document.documentElement.style.setProperty('--layout-primary-color', '#dfc27d');
            document.documentElement.style.setProperty('--layout-secondary-color', '#80cdc1');
            document.documentElement.style.setProperty('--layout-text-color', '#018571');
            break;

        case 'deuteranopia':
            document.documentElement.style.setProperty('--layout-background-color', '#d7191c');
            document.documentElement.style.setProperty('--layout-primary-color', '#fdae61');
            document.documentElement.style.setProperty('--layout-secondary-color', '#abd9e9');
            document.documentElement.style.setProperty('--layout-text-color', '#2c7bb6');
            break;

        case 'tritanopia':
            document.documentElement.style.setProperty('--layout-background-color', '#a6611a');
            document.documentElement.style.setProperty('--layout-primary-color', '#e66101');
            document.documentElement.style.setProperty('--layout-secondary-color', '#b2abd2');
            document.documentElement.style.setProperty('--layout-text-color', '#5e3c99');
            break;

        default:
            break;
    }

    setTimeout(() => {
        document.documentElement.style.setProperty('--layout-background-color', defaultColors.backgroundColor);
        document.documentElement.style.setProperty('--layout-primary-color', defaultColors.primaryColor);
        document.documentElement.style.setProperty('--layout-secondary-color', defaultColors.secondaryColor);
        document.documentElement.style.setProperty('--layout-text-color', defaultColors.textColor);
    }, 7400);
}

addEventListener("keydown", (event) => {
    if (event.key === '*') {
        console.log(JSON.parse(localStorage.getItem("currentCall")));
        console.log(JSON.parse(localStorage.getItem("lastCalls")));
    }
});
