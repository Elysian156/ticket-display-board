import { registerUser, fetchUserDataByCPF, registerQueue, fetchNextQueue, checkoutPassword, endProcess } from './apiCalls.js';

const appointmentNumber = document.querySelector(".current-appointment-number");
const receptionNumber = document.querySelector(".current-reception-number");
const alertCondition = document.querySelector(".alert-condition");

const form = document.querySelector(".patient-registration-form");
const inputCpf = document.querySelector("#cpf");
const submitQueueButton = document.querySelector("#submit-queue");
const submitPatientButton = document.querySelector("#submit-patient");

inputCpf.addEventListener('input', handleCpfInput);
form.addEventListener('submit', handleFormSubmit);

const callQueueButton = document.querySelector('#call-queue .modal-image');
const checkoutQueueButton = document.querySelector('#checkout-queue .modal-image');
const customizeButton = document.querySelector('#customize-painel .modal-image');
const endServiceButton = document.querySelector('#end-day .modal-image');

callQueueButton.addEventListener('click', fetchQueueDataAndApply);

endServiceButton.addEventListener('click', () => {
    localStorage.removeItem('currentCall');
    localStorage.removeItem('lastCalls');
    endProcess();
    updateDisplay();
});

customizeButton.addEventListener('click', () => {
    window.open('./UserConfig.html');
});

checkoutQueueButton.addEventListener('click', async () => {
    let lastCalls = JSON.parse(localStorage.getItem('lastCalls'));
    let foundIndex = lastCalls.findIndex(call => call.is_attended !== 1);

    if (foundIndex !== -1) {
        try {
            alert('Senha mais antiga: ' + lastCalls[foundIndex].appointment_number);

            lastCalls[foundIndex].is_attended = 1;
            localStorage.setItem('lastCalls', JSON.stringify(lastCalls));

            const response = await checkoutPassword(lastCalls[foundIndex].appointment_number);
            console.log('Senha checked out successfully', response);

        } catch (error) {
            console.error('Erro ao registrar saída da senha:', error);
        }
    } else {
        console.log('Nenhuma chamada anterior encontrada');
    }
});

function clearFormFields() {
    document.querySelector("#name").value = '';
    document.querySelector("#date_birthday").value = '';
    document.querySelector("#eligibility-reason").value = '';
}

async function handleCpfInput() {
    const inputValue = inputCpf.value;

    if (inputValue.length === 14) {
        try {
            const data = await fetchUserDataByCPF(inputValue);
            populateForm(data);
        } catch (error) {
            console.log('Erro ao buscar dados do usuário:', error);
            alert("Paciente não Cadastrado");
            clearFormFields();
        }
    } else {
        toggleSubmitButtons(false);
        clearFormFields();
    }
}

function populateForm(data) {
    if (data.id) {
        const formattedDate = formatDate(data.date_birthday);
        document.querySelector("#name").value = data.name;
        document.querySelector("#date_birthday").value = formattedDate;
        document.querySelector("#eligibility-reason").value = data.eligibility_reason;

        setupQueueButton(data.id, data.is_especial);
        toggleSubmitButtons(true);
    }
}

function formatDate(dateString) {
    const dateObject = new Date(dateString);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(form);
    formData.set('is_especial', formData.get('eligibility_reason') !== '' ? 1 : 0);

    const data = Object.fromEntries(formData);
    try {
        const responseData = await registerUser(data);
        console.log('User added successfully:', responseData);
        console.log('PatientRegistration(Status): %cSuccess', 'color: green');
        alert('Paciente Cadastrado');
        toggleSubmitButtons(true);
    } catch (error) {
        console.log(`%cPatientRegistration(Error): ${error.message}`, 'color: red');
    }
}

function setupQueueButton(id, isEspecial) {
    submitQueueButton.onclick = () => handleQueueSubmit(id, isEspecial);
}

async function handleQueueSubmit(id, isEspecial) {
    const inputUrgency = document.querySelector('input[name="urgency"]:checked');

    if (inputUrgency) {
        const queueData = {
            user_id: id,
            is_priority: isEspecial,
            urgency_level: inputUrgency.value
        };

        try {
            const response = await registerQueue(queueData);
            console.log('Queue registered successfully:');
            alert('Senha gerada com sucesso');
        } catch (error) {
            console.log('Erro ao registrar fila:', error);
        }
    } else {
        alert("Selecione o nível de urgência");
    }
}

let currentCall = null;
function fetchQueueDataAndApply() {
    fetchNextQueue()
        .then(response => {
            if (!response.ok) {
                throw new Error('Não foi possível recuperar os dados');
            }
            return response.json();
        })
        .then(data => {
            if (data.message) {
                alert(data.message);
                console.log('Ignorando mensagem:', data.message);
                return;
            }

            console.log('Dados da fila aplicados com sucesso:', data);
            data.is_attended = 0;
            if (localStorage.getItem('currentCall')) {
                let lastCalls = JSON.parse(localStorage.getItem('lastCalls')) || [];
                lastCalls.push(JSON.parse(localStorage.getItem('currentCall')));
                localStorage.setItem('lastCalls', JSON.stringify(lastCalls));
            }

            localStorage.setItem('currentCall', JSON.stringify(data));
            currentCall = data;

            updateDisplay();
        })
        .catch(error => {
            console.error('Erro ao recuperar e aplicar dados:', error);
        });
}

function toggleSubmitButtons(showQueueButton) {
    if (showQueueButton) {
        submitQueueButton.classList.remove('hidden');
        submitPatientButton.classList.add('hidden');
    } else {
        submitQueueButton.classList.add('hidden');
        submitPatientButton.classList.remove('hidden');
    }
}

addEventListener("keydown", (event) => {
    if (event.key === '+') {
        fetchQueueDataAndApply();
    } else if (event.key === '*') {
        console.log(JSON.parse(localStorage.getItem('currentCall')));
        console.log(JSON.parse(localStorage.getItem('lastCalls')));
    } else if (event.key === '-') {
        localStorage.removeItem('currentCall');
        localStorage.removeItem('lastCalls');
        updateDisplay();
    }
});

function updateDisplay() {
    styleAll(JSON.parse(localStorage.getItem('currentCall')), JSON.parse(localStorage.getItem('lastCalls')));
}

function styleAll(current, previousCalls) {
    if (!current) return;

    document.querySelector('.current-reception-number').textContent = current.reception_number; 
    document.querySelector('.current-appointment-number').textContent = current.appointment_number;
    if (current.eligibility_reason) document.querySelector('.alert-condition').textContent = "ATENÇÃO! paciente com " + current.eligibility_reason;

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

function initializeApp() {
    window.addEventListener('load', updateDisplay);
}

initializeApp();