addEventListener("keydown", (event) => {
    if(event.key === '+') {
        fetch('http://localhost:5000/get_numbers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayCurrent(data)
        })
        .catch(error => console.error('Error fetching the numbers:', error));
    }

});

function displayCurrent(data){
    ticketHighlight.classList.add("ticket-highlight-show");
    document.querySelectorAll('.current-reception-number').forEach(element => {
        element.textContent = data.reception_number;
    });
    document.querySelectorAll('.current-appointment-number').forEach(element => {
        element.textContent =  data.appointment_number;
    });

    const audio = new Audio('../Audio/72128__kizilsungur__sweetalertsound4.wav');
    audio.play();
    setTimeout(() => {
        ticketHighlight.classList.remove("ticket-highlight-show");
    }, 5000);
}