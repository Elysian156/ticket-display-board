import { registerUser, fetchUserDataByCPF, registerQueue, fetchNextQueue, checkoutPassword } from './apiCalls.js';

const appointmentNumber = document.querySelector(".current-appointment-number");
const receptionNumber = document.querySelector(".current-reception-number");
const alertCondition = document.querySelector(".alert-condition");

const form = document.querySelector(".patient-registration-form");
const inputCpf = document.querySelector("#cpf");
const submitQueueButton = document.querySelector("#submit-queue");
const submitPatientButton = document.querySelector("#submit-patient");

inputCpf.addEventListener('input', handleCpfInput);
form.addEventListener('submit', handleFormSubmit);

function initializeQueueActions() {
    const callQueueButton = document.querySelector('.modal-options button:nth-child(1)');
    const checkoutQueueButton = document.querySelector('.modal-options button:nth-child(2)');
    const endServiceButton = document.querySelector('.modal-options button:nth-child(3)');
    const CustomizeButton = document.querySelector('.modal-options button:nth-child(4)');

    callQueueButton.addEventListener('click', function() {
        fetchQueueDataAndApply();
    });

    checkoutQueueButton.addEventListener('click', function() {
        const oldestCalls = getOldestCall();
        if (oldestCalls.oldestNormalCall || oldestCalls.oldestPreferredCall) {
            if (oldestCalls.oldestNormalCall) {
                alert('Senha normal mais antiga: ' + oldestCalls.oldestNormalCall.appointment_number);
                checkoutPassword(oldestCalls.oldestNormalCall.appointment_number)
                    .then(() => {
                        console.log('Senha normal checked out successfully');
                    })
                    .catch(error => {
                        console.error('Error checking out normal password:', error);
                    });
            }
            if (oldestCalls.oldestPreferredCall) {
                alert('Senha preferencial mais antiga: ' + oldestCalls.oldestPreferredCall.appointment_number);
                checkoutPassword(oldestCalls.oldestPreferredCall.appointment_number)
                    .then(() => {
                        console.log('Senha preferencial checked out successfully');
                    })
                    .catch(error => {
                        console.error('Error checking out preferred password:', error);
                    });
            }
        } else {
            console.log('No previous calls found');
        }
    });
    
    function getOldestCall() {
        const lastCalls = JSON.parse(localStorage.getItem('lastCalls')) || [];
        let oldestNormalCall = null;
        let oldestPreferredCall = null;
    
        lastCalls.forEach(call => {
            if (call.appointment_number.startsWith('N')) {
                if (!oldestNormalCall || call.timestamp < oldestNormalCall.timestamp) {
                    oldestNormalCall = call;
                }
            } else if (call.appointment_number.startsWith('P')) {
                if (!oldestPreferredCall || call.timestamp < oldestPreferredCall.timestamp) {
                    oldestPreferredCall = call;
                }
            }
        });
    
        return { oldestNormalCall, oldestPreferredCall };
    }

    endServiceButton.addEventListener('click', function() {
        localStorage.removeItem('currentCall');
        localStorage.removeItem('lastCalls');
        window.location.reload();
    });

    CustomizeButton.addEventListener('click', function() {
        window.open('./UserConfig.html')
    });
}

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
            if (data.message) {
                alert(data.message);
                console.log('Ignoring message:', data.message);
                return; 
            }

            console.log('Queue data successfully applied:', data);
            if (localStorage.getItem('currentCall')) {
                let lastCalls = JSON.parse(localStorage.getItem('lastCalls')) || [];
                lastCalls.push(JSON.parse(localStorage.getItem('currentCall')));
                localStorage.setItem('lastCalls', JSON.stringify(lastCalls));
            }

            localStorage.setItem('currentCall', JSON.stringify(data));
            // Update the current call
            currentCall = data;

            // Emit a custom event with the queue data
            const event = new CustomEvent('queueDataApplied', { detail: { currentCall: data } });
            document.dispatchEvent(event);

            styleAll(currentCall, JSON.parse(localStorage.getItem('lastCalls')));

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
    if (event.key === '+') {
        fetchQueueDataAndApply();

    }
    else if(event.key === '*'){
        console.log(JSON.parse(localStorage.getItem('currentCall')))
        console.log(JSON.parse(localStorage.getItem('lastCalls')))
    }
    if (event.key === '-') {
        localStorage.removeItem('currentCall');
        localStorage.removeItem('lastCalls');
        window.location.reload();
    }
});

function styleAll(current, previousCalls) {
    if (!current) return;

    appointmentNumber.textContent = current.appointment_number;
    receptionNumber.textContent = current.reception_number;
    alertCondition.textContent = current.eligibility_reason;   
    
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

function initializeApp() {
    initializeQueueActions();
    window.addEventListener('load', function() {
        styleAll(JSON.parse(localStorage.getItem('currentCall')), JSON.parse(localStorage.getItem('lastCalls')));
    });

}

// async function fetchAndProcess(response) {
//     try {
        
//         await new Promise(resolve => setTimeout(resolve, 1000));
        
//         console.log(response);
//     } catch (error) {
//         console.error('Ocorreu um erro:', error);
//     }
// }

initializeApp();
