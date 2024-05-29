import { registerUser, fetchUserDataByCPF, registerQueue, fetchNextQueue } from './apiCalls.js';


const appointmentNumber= document.querySelector(".current-appointment-number")
const receptionNumber = document.querySelector(".current-reception-number")
const alertCondition = document.querySelector(".alert-condition")


const form = document.querySelector(".patient-registration-form");
const inputCpf = document.querySelector("#cpf");
const submitQueueButton = document.querySelector("#submit-queue");
const submitPatientButton = document.querySelector("#submit-patient");

inputCpf.addEventListener('input', handleCpfInput);
form.addEventListener('submit', handleFormSubmit);

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
            console.log('Error fetching user data:', error);
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
    formData.set('is_especial', formData.get('eligibility_reason') !== '' ? true : false);

    const data = Object.fromEntries(formData);
    try {
        const responseData = await registerUser(data);
        console.log('User added successfully:', responseData);
        console.log('PatientRegistration(Status): %cSuccess', 'color: green');
        alert('Paciente Cadastrado')
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
            alert('Senha gerada com sucesso')
        } catch (error) {
            console.log('Error registering queue:', error);
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
                throw new Error('Could not retrieve the data');
            }
            return response.json();
        })
        .then(data => {
            console.log('Queue data successfully applied:', data);
            
            if (localStorage.getItem('currentCall')) {
                let lastCalls = JSON.parse(localStorage.getItem('lastCalls')) || [];
                lastCalls.push(JSON.parse(localStorage.getItem('currentCall')));
                localStorage.setItem('lastCalls', JSON.stringify(lastCalls));
            }

            localStorage.setItem('currentCall', JSON.stringify(data));
            // Update the current call
            currentCall = data;
            styleAll(currentCall, lastCalls)
        })
        .catch(error => {
            console.error('Error retrieving and applying data:', error);
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
    if(event.key === '+') {
        fetchQueueDataAndApply();
    }
    if(event.key === '-') {
        localStorage.removeItem('currentCall')
        localStorage.removeItem('lastCalls')
        window.location.reload();
    }
});

function styleAll(current, previousCalls){
    appointmentNumber.textContent = current.appointment_number;
    receptionNumber.textContent = current.reception_number;
    alertCondition.textContent = current.eligibility_reason;   
    
    if (previousCalls && previousCalls.length > 0) {
        const tableBody = document.querySelector('.table-body'); 

        previousCalls.forEach(call => {
            const tr = document.createElement('tr');
            
            const senhaTd = document.createElement('td');
            senhaTd.textContent = call.appointment_number; 

            const chicheTd = document.createElement('td');
            chicheTd.textContent = call.reception_number

            tr.appendChild(senhaTd);
            tr.appendChild(chicheTd);

            tableBody.appendChild(tr);
        });
    } else {
        console.log('Não há chamadas anteriores');
    }
    
    
}

window.addEventListener('load', function() {
    styleAll(JSON.parse(localStorage.getItem('currentCall')),JSON.parse(localStorage.getItem('lastCalls')))
    console.log(JSON.parse(localStorage.getItem('currentCall')))
    console.log(JSON.parse(localStorage.getItem('lastCalls')))
});

