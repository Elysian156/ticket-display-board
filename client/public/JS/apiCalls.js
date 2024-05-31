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
    } catch (error) {
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
            if (response.status === 500) {
                console.log('Abort fetchUserDataByCPF: Server error');
                return null; // Abort fetching and return null
            } else {
                throw new Error('Network response was not ok');
            }
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
            if (response.status === 500) {
                console.log('Abort fetchUserDataById: Server error');
                return null; 
            } else {
                console.log('Network response was not ok');
            }
        }

        console.log('FetchUserDataById(Status): %cSuccess', 'color: green');
        return response.json();
    } catch (error) {
        console.log(`%cFetchUserDataById(Error): ${error.message}`, 'color: red');
        throw error;
    }
}

export async function registerQueue(data) {
    try {
        const response = await fetch('http://localhost:5000/api/passwords/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log('registerQueue(Status): %cSuccess', 'color: green');
        return response.json();
    } catch (error) {
        console.log(`%cregisterQueue(Error): ${error.message}`, 'color: red');
        throw error;
    }
}

export async function fetchNextQueue() {
    try {
        const response = await fetch('http://localhost:5000/api/passwords/next', {
            method: 'GET',
        });

        if (!response.ok) {
            if (response.status === 500) {
                console.log('Abort fetchNextQueue: Server error');
                return null; // Abort fetching and return null
            } else {
                throw new Error('Network response was not ok');
            }
        }

        console.log('FetchNextQueue(Status): %cSuccess', 'color: green');
        return response; 
    } catch (error) {
        console.log(`%cFetchNextQueue(Error): ${error.message}`, 'color: red');
        throw error;
    }
}

export async function checkoutPassword(password) {
    try {
        const response = await fetch(`http://localhost:5000/api/passwords/checkout/${password}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log('checkoutPassword(Status): %cSuccess', 'color: green');
        return await response.json();
    } catch (error) {
        console.log(`%ccheckoutPassword(Error): ${error.message}`, 'color: red');
        throw error;
    }
}

export async function fetchAllPasswords() {
    try {
        const response = await fetch('http://localhost:5000/api/passwords', {
            method: 'GET',
        });

        if (!response.ok) {
            if (response.status === 500) {
                console.log('Abort fetchAllPasswords: Server error');
                return null; // Abort fetching and return null
            } else {
                throw new Error('Network response was not ok');
            }
        }

        console.log('fetchAllPasswords(Status): %cSuccess', 'color: green');
        return response.json();
    } catch (error) {
        console.log(`%cfetchAllPasswords(Error): ${error.message}`, 'color: red');
        throw error;
    }
}

export async function peekNextPassword() {
    try {
        const response = await fetch('http://localhost:5000/api/passwords/peek', {
            method: 'GET',
        });

        if (!response.ok) {
            if (response.status === 500) {
                console.log('Abort peekNextPassword: Server error');
                return null; // Abort fetching and return null
            } else {
                throw new Error('Network response was not ok');
            }
        }

        console.log('peekNextPassword(Status): %cSuccess', 'color: green');
        return response.json();
    } catch (error) {
        console.log(`%cpeekNextPassword(Error): ${error.message}`, 'color: red');
        throw error;
    }
}
