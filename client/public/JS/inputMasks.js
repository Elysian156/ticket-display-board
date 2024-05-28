const maskcpf = document.querySelector(".maskcpf")

maskcpf.addEventListener('keypress', (event) => {
    const input = event.target;
    const inputValue = input.value;
    const inputKey = event.key;

    if (/^[0-9\s]+$/.test(inputKey)) {
        const inputLength = inputValue.length;

        if (inputLength === 3 || inputLength === 7) {
            input.value += '.';
        } else if (inputLength === 11) {
            input.value += '-';
        }
    } else {
        event.preventDefault();
    }
});

function allowOnlyLetters(event) {
    const inputValue = event.key;
    // Verifica se o caractere digitado é uma letra (maiúscula ou minúscula) ou espaço
    if (!/[a-zA-Z\s]/.test(inputValue)) {
        event.preventDefault();
    }
}

document.querySelectorAll(".onlyletters").forEach(element => {
    element.addEventListener('keypress', allowOnlyLetters)
});