document.addEventListener("DOMContentLoaded", () => {
    updateDateTime()
    updateCarrousel()
    updateTheme();
    styleAll(JSON.parse(localStorage.getItem('currentCall')), JSON.parse(localStorage.getItem('lastCalls')));
});

const ticketHighlight = document.querySelector(".ticket-highlight")


window.addEventListener('storage', (event) => {
    if (event.key === 'themeStorage') {
        updateTheme();
    } 
    if(event.key === "currentCall"){
        setTimeout(displayCurrent(JSON.parse(localStorage.getItem('currentCall'))), 1000)

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
        element.textContent =  current.reception_number;
    });
    document.querySelector(".current-pacient-name").textContent = current.name;


    const tableBody = document.querySelector('.table-body');

    if (previousCalls && previousCalls.length > 0) {
        previousCalls.reverse();

        previousCalls.forEach(call => {
            // Verificar se a chamada já existe na tabela
            if (!isCallExistsInTable(call)) {
                const tr = document.createElement('tr');

                const senhaTd = document.createElement('td');
                senhaTd.textContent = call.appointment_number;

                const guicheTd = document.createElement('td');
                guicheTd.textContent = call.reception_number;

                tr.appendChild(senhaTd);
                tr.appendChild(guicheTd);

                tableBody.insertBefore(tr, tableBody.firstChild); // Adicionar antes do primeiro elemento existente
            }
        });
    } else {
        console.log('Não há chamadas anteriores');
    }
}

// Função auxiliar para verificar se a chamada já existe na tabela
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

function displayCurrent(current){
    console.log(current.name)
    ticketHighlight.classList.add("ticket-highlight-show");
    const audio = new Audio('../Audio/72128__kizilsungur__sweetalertsound4.wav');   
    audio.play();
    setTimeout(() => {
        ticketHighlight.classList.remove("ticket-highlight-show");
    }, 5000);

}
