document.addEventListener("DOMContentLoaded", () => {
    updateDateTime()
    updateCarrousel()
    updateTheme();
    console.log(JSON.parse(localStorage.getItem('currentCall')), JSON.parse(localStorage.getItem('lastCalls')))
    styleAll(JSON.parse(localStorage.getItem('currentCall')), JSON.parse(localStorage.getItem('lastCalls')));
});

const ticketHighlight = document.querySelector(".ticket-highlight")
const audio = new Audio('../Audio/72128__kizilsungur__sweetalertsound4.wav');   

window.addEventListener('storage', (event) => {
    if (event.key === 'themeStorage') {
        updateTheme();
    } 
});

window.addEventListener('fetchqueue', styleAll());

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

    displayCurrent(current)

    if (previousCalls && previousCalls.length > 0) {
        const tableBody = document.querySelector('.table-body');
        const fragment = document.createDocumentFragment();
        
        previousCalls.reverse(); 
        
        previousCalls.forEach(call => {
            const tr = document.createElement('tr');
            
            const senhaTd = document.createElement('td');
            senhaTd.textContent = call.appointment_number; 
        
            const guicheTd = document.createElement('td');
            guicheTd.textContent = call.reception_number;
        
            tr.appendChild(senhaTd);
            tr.appendChild(guicheTd);
        
            fragment.appendChild(tr); 
        });
        
        tableBody.insertBefore(fragment, tableBody.firstChild);
    } else {
        console.log('Não há chamadas anteriores');
    }
}

function displayCurrent(current){
    const utternance = new SpeechSynthesisUtterance("Clean codo")
    ticketHighlight.classList.add("ticket-highlight-show");
    document.querySelectorAll('.current-reception-number').forEach(element => {
        element.textContent = current.appointment_number;
    });
    document.querySelectorAll('.current-appointment-number').forEach(element => {
        element.textContent =  current.reception_number;
    });

    document.querySelector(".current-pacient-name").textContent = current.name;
    audio.play();
    speechSynthesis.speak(utternance)
    setTimeout(() => {
        ticketHighlight.classList.remove("ticket-highlight-show");
    }, 5000);

}

