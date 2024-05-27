import { registerUser } from './apiCalls.js';
import { fetchUserDataByCPF} from './apiCalls.js'
import { registerQueue } from './apiCalls.js';

const form = document.querySelector(".patient-registration-form")
const inputcpf = document.querySelector("#cpf")
const submitQueue = document.querySelector("#submit-queue")


inputcpf.addEventListener('input', function() {
    const inputValue = inputcpf.value;

    if (inputValue.length === 14) {
        fetchUserDataByCPF(inputValue)
        .then(data => {

            if(data.id){
                const dateObject = new Date(data.date_birthday);
                const year = dateObject.getFullYear();
                const month = String(dateObject.getMonth() + 1).padStart(2, '0');
                const day = String(dateObject.getDate()).padStart(2, '0'); 
                const formattedDate = `${year}-${month}-${day}`;

                document.querySelector("#name").value = data.name
                document.querySelector("#date_birthday").value = formattedDate
                document.querySelector("#eligibility-reason").value = data.deficiency

                const inputurgency = document.querySelector('input[name="urgency"]')
                document.querySelector("#submit-patient").disabled = true;
                
                const queueData = {
                    user_id: data.id,
                    // name: data.name,
                    // deficiency: data.eligibility_reason,
                    is_priority: data.is_especial,
                    urgency_level: inputurgency.value,
                };
                console.log(queueData)
                submitQueue.classList.remove('hidden')
                submitQueue.addEventListener('click', registerQueue(queueData))
            }
        })
        .catch(error => {

            console.log('Error fetching user data:', error);
        });
    }
});

form.addEventListener('submit', async event => {
        event.preventDefault();
        const formData = new FormData(form);

    formData.set('is_especial', (formData.get('eligibility_reason') !== '') ? true : false)

    const data = Object.fromEntries(formData);

    try {
        const responseData = await registerUser(data);
        console.log('User added successfully:', responseData);
        console.log('PatientRegistration(Status): %cSuccess', 'color: green');
    } catch (error) {
        console.log(`%PatientRegistration(Error): ${error.message}`, 'color: red');
    }
})

