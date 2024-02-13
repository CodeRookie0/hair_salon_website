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
// Pobierz przycisk "Continue"
const continueButton = document.querySelector('.continue-book-btn');

// Nasłuchuj kliknięcie na przycisku "Continue"
continueButton.addEventListener('click', function() {
    // Ukryj sekcję serviceInfoSection
    document.getElementById('serviceInfoSection').style.display = 'none';
    // Pokaż sekcję staffSection
    document.getElementById('staffSection').style.display = 'block';
});
const selectStaffButtons  = document.querySelectorAll('.select-staff-btn');

selectStaffButtons.forEach(function(button) {
    button.addEventListener('click', function() {
        // Ukryj sekcję serviceInfoSection
        document.getElementById('staffSection').style.display = 'none';
        // Pokaż sekcję staffSection
        document.getElementById('scheduleSection').style.display = 'block';
    });
});
const serviceInfoBackButton = document.querySelectorAll('#serviceInfoSection #back-btn');
serviceInfoBackButton.forEach(function(button) {
    button.addEventListener('click', function() {
    window.location.href = "service-menu.html";
});
});
// Przypisanie zdarzenia kliknięcia do przycisku "Back" w sekcji staffSection
const staffBackButton = document.querySelector('#staffSection #back-btn');
staffBackButton.addEventListener('click', function() {
    document.getElementById('staffSection').style.display = 'none';
    document.getElementById('scheduleSection').style.display = 'none';
    document.getElementById('serviceInfoSection').style.display = 'block';
});

// Przypisanie zdarzenia kliknięcia do przycisku "Back" w sekcji scheduleSection
const scheduleBackButton = document.querySelector('#scheduleSection #back-btn');
scheduleBackButton.addEventListener('click', function() {
    document.getElementById('staffSection').style.display = 'block';
    document.getElementById('scheduleSection').style.display = 'none';
    document.getElementById('serviceInfoSection').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function() {
    const daysContainer = document.getElementById('daysContainer');
    const monthYear = document.getElementById('monthYear');

    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    // Funkcja do aktualizacji tekstu miesiąca i roku w nagłówku
    function updateMonthYearText() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];
        monthYear.textContent = `${months[currentMonth]} ${currentYear}`;
    }

    // Funkcja do tworzenia kalendarza na podstawie aktualnego roku i miesiąca
    function createCalendar(year, month) {
        daysContainer.innerHTML = '';
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.textContent = i;
            dayElement.classList.add('day');
            dayElement.addEventListener('click', function() {
                // Usunięcie klasy 'selected' z poprzednio wybranego dnia
                const selectedDay = document.querySelector('.selected');
                if (selectedDay) {
                    selectedDay.classList.remove('selected');
                }
                // Dodanie klasy 'selected' do wybranego dnia
                this.classList.add('selected');
            });
            daysContainer.appendChild(dayElement);
        }
        // Wywołanie funkcji do aktualizacji tekstu miesiąca i roku w nagłówku
        updateMonthYearText();
    }

    // Wywołanie funkcji do utworzenia kalendarza na podstawie aktualnego roku i miesiąca
    createCalendar(currentYear, currentMonth);

    // Przewijanie miesięcy za pomocą strzałek w lewo i prawo
    document.getElementById('prevMonthArrow').addEventListener('click', function() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        createCalendar(currentYear, currentMonth);
    });

    document.getElementById('nextMonthArrow').addEventListener('click', function() {
        document.getElementById("prevMonthArrow").style.display = "block";
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        createCalendar(currentYear, currentMonth);
    });
});
