const urlParams = new URLSearchParams(window.location.search);
const serviceId = urlParams.get('service');

document.addEventListener("DOMContentLoaded", function() {
    if (serviceId) {
        fetchServiceData(serviceId);
    } else {
        console.error('Brak parametru "service" w adresie URL.');
    }

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
function fetchServiceData(serviceId) {
    const request = indexedDB.open('ServiceDB', 1);

    request.onerror = function(event) {
        console.error('Nie udało się otworzyć bazy danych:', event.target.error);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transactionServices = db.transaction(['Services'], 'readonly');
        const objectStore = transactionServices.objectStore('Services');
        const request = objectStore.get(serviceId);

        request.onerror = function(event) {
            console.error('Błąd podczas pobierania danych usługi:', event.target.error);
        };

        request.onsuccess = function(event) {
            const service = event.target.result;
            if (service) {
                document.getElementById('serviceName').textContent = service.name;
                document.getElementById('appointmentDuration').textContent = service.duration;
                displayServiceInfo(service);
            } else {
                console.error('Nie znaleziono usługi o podanym identyfikatorze.');
            }
        };

        const transactionEmployees = db.transaction(['Employees'], 'readonly');
        const employeesStore = transactionEmployees.objectStore('Employees');

        // Uzyskaj wszystkich pracowników z tabeli Employees
        const getAllRequest = employeesStore.getAll();

        // Obsłuż wyniki zapytania
        getAllRequest.onsuccess = function(event) {
            const employees = event.target.result;
            console.log('Pobrano pracowników:', employees);

            // Tutaj możesz wykonać operacje na pobranych pracownikach, np. wyświetlić je na stronie
            displayEmployees(employees);
        };

        // Obsługa błędów zapytania
        getAllRequest.onerror = function(event) {
            console.error('Błąd podczas pobierania pracowników:', event.target.error);
        };
    };
}
function displayServiceInfo(service) {
    document.querySelectorAll('.service-name').forEach(element => {
        element.textContent = service.name;
    });
    document.querySelector('.service-name-staff').textContent = `Select staff for ${service.name}`;
    if(service.max_price!==null){
        document.querySelector('.service-duration-price').innerHTML = `${service.duration} <span class="separator">&bull;</span> ${service.min_price} - ${service.max_price} PLN`;
    }
    else{
        document.querySelector('.service-duration-price').innerHTML = `${service.duration} <span class="separator">&bull;</span> ${service.min_price} PLN`;
    }
    document.querySelector('.service-description').textContent = service.description;
}
function displayEmployees(employees) {
    const staffSection = document.getElementById('staffSection');
    const serviceStaffContainer = staffSection.querySelector('.staff');
    
    // Otwórz połączenie z bazą danych poza pętlą forEach
    const request = indexedDB.open('ServiceDB', 1);
    request.onerror = function(event) {
        console.error('Nie udało się otworzyć bazy danych:', event.target.error);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transactionEmployeeServices = db.transaction(['EmployeeServices'], 'readonly');
        const objectStore = transactionEmployeeServices.objectStore('EmployeeServices');
        const index = objectStore.index('service_id');
        const request = index.getAll(serviceId);

        request.onerror = function(event) {
            console.error('Błąd podczas pobierania danych pracownika:', event.target.error);
        };

        request.onsuccess = function(event) {
            const employeeServices = event.target.result;
            // Pobierz unikalne ID pracowników
            const uniqueEmployeeIds = [...new Set(employeeServices.map(item => item.employee_id))];

            // Filtruj pracowników zgodnie z unikalnymi ID
            const filteredEmployees = employees.filter(employee => uniqueEmployeeIds.includes(employee.employee_id));

            if (filteredEmployees.length > 0) {
                let currentRow;
                let staffOptionCount = 0;

                filteredEmployees.forEach(employee => {
                    // Utwórz elementy HTML dla każdego pracownika
                    if (staffOptionCount === 0) {
                        currentRow = document.createElement('div');
                        currentRow.classList.add('row');
                    }
                    
                    console.log(employee.first_name);
                    const staffOption = document.createElement('div');
                    staffOption.classList.add('staff-option');

                    const imgDiv = document.createElement('div');
                    imgDiv.classList.add('img');

                    const img = document.createElement('img');
                    img.src = `../images/user1.jpg`; // Ustaw ścieżkę do obrazka
                    img.alt = `${employee.first_name}`;
                    imgDiv.appendChild(img);

                    const infoDiv = document.createElement('div');
                    infoDiv.classList.add('info');

                    const info = document.createElement('div');
                    const infoHeader = document.createElement('h2');
                    infoHeader.textContent = `${employee.first_name}`;

                    const selectBtn = document.createElement('a');
                    selectBtn.classList.add('select-staff-btn');
                    selectBtn.href = "#";
                    selectBtn.textContent = 'Select';
                    selectBtn.id = employee.employee_id;
                    selectBtn.addEventListener('click', function() {
                        // Ukryj sekcję serviceInfoSection
                        document.getElementById('staffSection').style.display = 'none';
                        // Pokaż sekcję staffSection
                        document.getElementById('scheduleSection').style.display = 'block';
                        document.getElementById('employeeName').textContent = `with ${employee.first_name}`;
                        const newUrl = new URL(window.location.href);
                        newUrl.searchParams.set('staff', selectBtn.id);
                        window.history.pushState({}, '', newUrl);
                    });
                    info.appendChild(infoHeader);
                    info.appendChild(selectBtn);

                    infoDiv.appendChild(info);

                    let infoDetails="";
                    const serviceRequest = indexedDB.open('ServiceDB', 1);
                    serviceRequest.onerror = function(event) {
                        console.error('Nie udało się otworzyć bazy danych:', event.target.error);
                    };

                    serviceRequest.onsuccess = function(event) {
                        const serviceDb = event.target.result;
                        const transactionServices = serviceDb.transaction(['Services'], 'readonly');
                        const serviceObjectStore = transactionServices.objectStore('Services');
                        const serviceRequest = serviceObjectStore.get(serviceId);

                        serviceRequest.onerror = function(event) {
                            console.error('Błąd podczas pobierania danych usługi:', event.target.error);
                        };

                        serviceRequest.onsuccess = function(event) {
                            const service = event.target.result;
                            // Znajdź odpowiedni rekord EmployeeServices dla bieżącego pracownika i usługi
                            const employeeService = employeeServices.find(item => item.employee_id === employee.employee_id);
                            if (employeeService) {
                                infoDetails = `<p>${service.duration} <span class="separator">&bull;</span> ${employeeService.price} PLN</p>
                                                  <p>${employee.description}</p>`;
                                infoDiv.insertAdjacentHTML('beforeend', infoDetails); 
                            }
                        };
                    };

                    // Dodaj elementy do drzewa DOM
                    staffOption.appendChild(imgDiv);
                    staffOption.appendChild(infoDiv);
                    currentRow.appendChild(staffOption);
                    staffOptionCount++;

                    if (staffOptionCount === 2 || staffOptionCount === filteredEmployees.length) {
                        serviceStaffContainer.appendChild(currentRow);
                        staffOptionCount = 0;
                    }
                });
            }
        };
    };
}


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

        const image =document.querySelector('.img img').src;
        document.getElementById('employeeImage').src = image;

        const name =document.querySelector('.info h2').textContent;
        document.getElementById('employeeName').textContent = `with ${name}`;

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('staff', button.id);
        window.history.pushState({}, '', newUrl);
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

const scheduleBackButtonHandler = function() {
    document.getElementById('staffSection').style.display = 'block';
    document.getElementById('scheduleSection').style.display = 'none';
    document.getElementById('serviceInfoSection').style.display = 'none';
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('staff');
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({}, '', newUrl);
};

// Przypisanie zdarzenia kliknięcia do przycisku "Back" w sekcji scheduleSection
const scheduleBackButton = document.querySelector('#scheduleSection #back-btn');
scheduleBackButton.addEventListener('click', scheduleBackButtonHandler);

// Przypisz to samo zdarzenie do elementu <a> o klasie "change-staff-btn"
const changeStaffButton = document.querySelector('.change-staff-btn');
changeStaffButton.addEventListener('click', scheduleBackButtonHandler);

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
