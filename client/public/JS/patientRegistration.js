import { registerUser } from './apiCalls.js';
import { fetchUserDataByCPF} from './apiCalls.js'
import { fetchUserDataById } from './apiCalls.js';

const form = document.querySelector(".patient-registration-form")
const inputcpf = document.querySelector("#cpf")

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
    
                console.log(data)
                document.querySelector("#name").value = data.name
                document.querySelector("#date_birthday").value = formattedDate
                document.querySelector("#eligibility-reason").value = data.deficiency

                document.querySelector("#submit-patient").disabled = true;

            }
        })
        .catch(error => {
            // Este código será executado se houver um erro no fetch
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

