export async function registerUser(data) {
    try {
        const response = await fetch('http://localhost:5000/api/users/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log('registerUser(Status): %cSuccess', 'color: green');
        return response.json();
    } 
    catch (error) {
        console.log(`%cregisterUser(Error): ${error.message}`, 'color: red');
        throw error;  
    }
}


export async function fetchUserDataByCPF(cpf) {
    try {
        const response = await fetch(`http://localhost:5000/api/users/${cpf}`, {
            method: 'GET',

        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log('FetchUserDataByCPF(Status): %cSuccess', 'color: green');
        return response.json();
    } catch (error) {
        console.log(`%cFetchUserDataByCPF(Error): ${error.message}`, 'color: red');
        throw error;  
    }
}

export async function fetchUserDataById(userId) {
    try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        } 

        console.log('FetchUserDataById(Status): %cSuccess', 'color: green');
        return response.json();
    } catch (error) {
        console.log(`%cFetchUserDataById(Error): ${error.message}`, 'color: red');
        throw error;  
    }
}

export async function registerQueue(data){
    try{
        const response = await fetch('http://localhost:5000/api/passwords/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }
    catch (error) {
        console.log(`%cRegisterQueue(Error): ${error.message}`, 'color: red');
        throw error;  
    }
}