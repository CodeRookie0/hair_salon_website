document.addEventListener("DOMContentLoaded", function() {
    const combobox = document.querySelector('.combobox');
    const selectedOptionContainer  = combobox.querySelector('.selected-option');
    const selectedOptionText  = combobox.querySelector('.selected-option p');
    const optionsList = combobox.querySelector('.options');
    const optionItems = optionsList.querySelectorAll('li');

    selectedOptionContainer .addEventListener('click', function(event) {
        event.stopPropagation(); // Zapobieganie propagacji zdarzeń, aby nie zamykać menu po kliknięciu na combobox

        // Sprawdzamy, czy lista opcji jest aktualnie widoczna
        const isVisible = optionsList.style.display === 'block';

        // Pokazywanie lub ukrywanie listy opcji w zależności od jej aktualnego stanu
        if (isVisible) {
            optionsList.style.display = 'none';
            selectedOptionContainer.style.border="1px solid #ccc";
        } else {
            optionsList.style.display = 'block';
            selectedOptionContainer.style.border="1px solid #f44336";
        }
    });
    optionItems.forEach(function(option) {
        option.addEventListener('click', function(event) {
            selectedOptionText .textContent = event.target.textContent ;
            optionsList.style.display = 'none'; // Zamykanie listy opcji po wybraniu jednej z nich
        });
    });
    // Zamykanie listy opcji po kliknięciu gdzie indziej na stronie
    document.addEventListener('click', function(event) {
        if (!combobox.contains(event.target)) {
            optionsList.style.display = 'none';
            selectedOptionContainer.style.border="1px solid #ccc";
        }
    });
});
function redirectToServiceMenu() {
    window.location.href = "service-menu.html";
}
// Pobierz przycisk "Continue"
const continueButton = document.querySelector('.continue-book-btn');

// Nasłuchuj kliknięcie na przycisku "Continue"
continueButton.addEventListener('click', function() {
    // Ukryj sekcję serviceInfoSelection
    document.getElementById('serviceInfoSelection').style.display = 'none';
    // Pokaż sekcję staffSelection
    document.getElementById('staffSelection').style.display = 'block';
});