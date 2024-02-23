const urlParams = new URLSearchParams(window.location.search);
const serviceId = urlParams.get('service');

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

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
        optionsList.style.display = isVisible ? 'none' : 'block';
        selectedOptionContainer.style.border = isVisible ? '1px solid #ccc' : '1px solid #f44336';
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
        const serviceStore  = transactionServices.objectStore('Services');
        const serviceRequest  = serviceStore.get(serviceId);

        serviceRequest .onerror = function(event) {
            console.error('Błąd podczas pobierania danych usługi:', event.target.error);
        };

        serviceRequest .onsuccess = function(event) {
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
        const getAllEmployeesRequest  = employeesStore.getAll();

        // Obsłuż wyniki zapytania
        getAllEmployeesRequest .onsuccess = function(event) {
            const employees = event.target.result;
            console.log('Pobrano pracowników:', employees);

            displayEmployees(employees);
        };

        // Obsługa błędów zapytania
        getAllEmployeesRequest .onerror = function(event) {
            console.error('Błąd podczas pobierania pracowników:', event.target.error);
        };
    };
}
function displayServiceInfo(service) {
    document.querySelectorAll('.service-name').forEach(element => {
        element.textContent = service.name;
    });
    document.querySelector('.service-name-staff').textContent = `Select staff for ${service.name}`;
    
    const priceRange = service.max_price !== null ? `${service.min_price} - ${service.max_price} PLN` : `${service.min_price} PLN`;
    document.querySelector('.service-duration-price').innerHTML = `${service.duration} <span class="separator">&bull;</span> ${priceRange}`;
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
        const employeeServicesStore  = transactionEmployeeServices.objectStore('EmployeeServices');
        const index = employeeServicesStore .index('service_id');
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
                    
                    const staffOption = createStaffOption(employee, employeeServices);
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
function createStaffOption(employee,employeeServices){
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
        // Wywołanie funkcji do utworzenia kalendarza na podstawie aktualnego roku i miesiąca
        createCalendar(currentYear, currentMonth);

        const today = new Date();
        const days = document.querySelectorAll('.day');

        for (const day of days) {
            if (parseInt(day.textContent) === today.getDate()) {
                day.click();
                break; // Przerywamy iterację po znalezieniu pierwszego pasującego elementu
            }
        }
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
    return staffOption;
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

        // Wywołanie funkcji do utworzenia kalendarza na podstawie aktualnego roku i miesiąca
        createCalendar(currentYear, currentMonth);

        const today = new Date();
        const days = document.querySelectorAll('.day');

        for (const day of days) {
            if (parseInt(day.textContent) === today.getDate()) {
                day.click();
                console.log('Button naciśnięty dla dzisiejszej daty:', today.getDate());
                break; // Przerywamy iterację po znalezieniu pierwszego pasującego elementu
            }
        }
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
    const daysContainer = document.getElementById('daysContainer');
    const monthYear = document.getElementById('monthYear');
    daysContainer.innerHTML = '';
    const today = new Date();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = i;
        dayElement.classList.add('day');
        dayElement.addEventListener('click', function() {
            // Usunięcie klasy 'selected' z poprzednio wybranego dnia
            const previouslySelectedDay  = document.querySelector('.selected');
            if (previouslySelectedDay ) {
                previouslySelectedDay.classList.remove('selected');
            }
            // Dodanie klasy 'selected' do wybranego dnia
            this.classList.add('selected');
            const clickedDate = new Date(year, month, i);
            const selectedDateTitleElement = document.getElementById('selected-day');
            selectedDateTitleElement.textContent=clickedDate.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            fetchAndDisplayAvailableHours(clickedDate);
        });
        daysContainer.appendChild(dayElement);
    }
    // Wywołanie funkcji do aktualizacji tekstu miesiąca i roku w nagłówku
    updateMonthYearText();
}

// Funkcja do wyświetlenia dostępnych godzin
function fetchAndDisplayAvailableHours(selectedDate) {
    // Sprawdź, czy wybrany przez użytkownika dzień jest wcześniejszy niż dzisiejszy
    const today = new Date();
    const selectedDateTime = new Date(selectedDate);
    const differenceInDays = (selectedDateTime.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (differenceInDays <= -1 || differenceInDays > 182) {
        displayNoAppointmentsInAllColumns();
        return; // Zakończ funkcję, nie pobieraj godzin pracy pracowników
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const employeeIdString = urlParams.get('staff');
    const employeeId = parseInt(employeeIdString, 10);
    const serviceId = urlParams.get('service');

    const request = indexedDB.open('ServiceDB', 1);

    request.onerror = function(event) {
        console.error('Nie udało się otworzyć bazy danych:', event.target.error);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['Employees'], 'readonly');
        const objectStore = transaction.objectStore('Employees');
        if (employeeId !== -1) {
            getEmployeeAndCalculate(objectStore,employeeId,selectedDate);
        } else {
            getAllEmployeeAndCalculate(serviceId, selectedDate);
        }
    };
};
function displayNoAppointmentsInAllColumns() {
    const allColumns = document.querySelectorAll('.morning-hours-column, .afternoon-hours-column, .evening-hours-column');
    allColumns.forEach(column => {
        const elementsToRemove = column.querySelectorAll('.hour-container, .no-appointments');
        elementsToRemove.forEach(element => {
            element.remove();
        });
        const noAppointmentsParagraph = document.createElement('span');
        noAppointmentsParagraph.textContent = 'Not available';
        noAppointmentsParagraph.classList.add("no-appointments");
        column.appendChild(noAppointmentsParagraph);
    });
}
function getEmployeeAndCalculate(objectStore,employeeId,selectedDate){
    const request = objectStore.get(employeeId);

    request.onerror = function(event) {
        console.error('Błąd podczas pobierania godzin pracy pracownika:', event.target.error);
    };

    request.onsuccess = function(event) {
        const employee = event.target.result;
        if (employee) {
            const workingHours = employee.working_hours;
                
            const serviceDurationElement = document.getElementById('appointmentDuration');
            const serviceDuration = serviceDurationElement.textContent;

            calculateAvailableHours(workingHours, serviceDuration, selectedDate, employeeId, function(availableHours) {
                displayAvailableHours(availableHours);
            });
        }
    };
} 
function getAllEmployeeAndCalculate(serviceId,selectedDate){
    const request = indexedDB.open('ServiceDB', 1);

    request.onerror = function (event) {
        console.error('Błąd podczas pobierania godzin pracy pracownika:', event.target.error);
    };
    
    request.onsuccess = function (event) {
        const db = event.target.result;
        const transactionEmployeeServices = db.transaction(['EmployeeServices'], 'readonly');
        const objectStore = transactionEmployeeServices.objectStore('EmployeeServices');
        const index = objectStore.index('service_id');
    
        const range = IDBKeyRange.only(serviceId); // Utwórz zakres dla określonego service_id
        const requestEmployees = index.getAll(range);
    
        requestEmployees.onerror = function(event) {
            console.error('Błąd podczas pobierania pracowników dla usługi:', event.target.error);
        };

        let count = 0;
        const allAvailableHoursSet = new Set();

        requestEmployees.onsuccess = function(event) {
            const employees = event.target.result;
            count = employees.length;
    
            employees.forEach(employee => {
                const employeeId = employee.employee_id;
                const transactionEmployees = db.transaction(['Employees'], 'readonly');
                const employeesStore = transactionEmployees.objectStore('Employees');
                const getRequest = employeesStore.get(employeeId);

                getRequest.onsuccess = function (event) {
                    const employeeData = event.target.result;
                    if (employeeData) {
                        const workingHours = employeeData.working_hours;
    
                        const serviceDurationElement = document.getElementById('appointmentDuration');
                        const serviceDuration = serviceDurationElement.textContent;
    
                        calculateAvailableHours(workingHours, serviceDuration, selectedDate, employeeId, function (availableHours) {
                            availableHours.forEach(hour => {
                                const exists = Array.from(allAvailableHoursSet).some(existingHour => existingHour.start === hour.start);
                                if (!exists) {
                                    allAvailableHoursSet.add(hour);
                                }
                            });

                            count--;
                            if (count === 0) {
                                const allAvailableHours = Array.from(allAvailableHoursSet);
                                console.log("wszystkie", allAvailableHours);
                                displayAvailableHours(allAvailableHours);
                            }
                        });
                    }
                };
            });
            if (count === 0) {
                const allAvailableHours = Array.from(allAvailableHoursSet);
                displayAvailableHours(allAvailableHours);
            }
        };
    };
}
function displayAvailableHours(allAvailableHours) {
    const allColumns = document.querySelectorAll('.morning-hours-column, .afternoon-hours-column, .evening-hours-column');
    allColumns.forEach(column => {
        const elementsToRemove = column.querySelectorAll('.hour-container, .no-appointments');
        elementsToRemove.forEach(element => {
            element.remove();
        });
    });
    // Dodawanie dostępnych godzin do odpowiednich kolumn
    allAvailableHours.forEach(hour => {
        const hourContainer = document.createElement('div');
        hourContainer.classList.add('hour-container');
        const timeSpan = document.createElement('span');
        const startHour = parseInt(hour.start.split(':')[0], 10);
        let startPeriod = 'am';
        if (startHour >= 12) {
            startPeriod = 'pm';
        }
        timeSpan.textContent = hour.start + ' ' + startPeriod;
        hourContainer.appendChild(timeSpan);
        let columnClass;
        if (startHour < 12) {
            columnClass = 'morning-hours-column';
        } else if (startHour >= 12 && startHour < 16) {
            columnClass = 'afternoon-hours-column';
        } else {
            columnClass = 'evening-hours-column';
        }
        const column = document.querySelector('.' + columnClass);
        column.appendChild(hourContainer);
    });
    let allAppointmentsAdded = true;
    allColumns.forEach(column => {
        const hourContainers = column.querySelectorAll('.hour-container');
        if (hourContainers.length === 0) { // Sprawdź, czy w kolumnie są jakieś elementy hour-container
            const noAppointmentsParagraph = document.createElement('span');
            noAppointmentsParagraph.textContent = 'No appointments';
            noAppointmentsParagraph.classList.add("no-appointments");
            column.appendChild(noAppointmentsParagraph);
            allAppointmentsAdded = false;
        }
    });

    // Jeśli nie dodano żadnej godziny, wyświetl komunikat "No appointments"
    if (allAppointmentsAdded) {
        console.log('Wszystkie godziny dodane.');
    } else {
        console.log('Niektóre kolumny nie miały godzin.');
    }
}
 
// Funkcja do obliczania dostępnych godzin na podstawie godzin pracy pracownika, czasu trwania usługi i wybranego dnia
function calculateAvailableHours(workingHours, serviceDuration, selectedDate,employeeId,callback) {
    // Przetwarzanie godzin pracy pracownika (np. '8:00 - 17:00')
    const [startHourStr, endHourStr] = workingHours.split(' - ');
    const [startHour, startMinute] = startHourStr.split(':').map(val => parseInt(val, 10));
    const [endHour, endMinute] = endHourStr.split(':').map(val => parseInt(val, 10));
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    // Przetwarzanie czasu trwania usługi (np. '45 min - 1 hr 30 min')
    const minDurationParts = serviceDuration.split(' - ')[0].split(' ').map(part => part.trim());
    const minToMinutes = (minDurationParts) => {
        let minutes = 0;
        for (let i = 0; i < minDurationParts.length; i += 2) {
            if (minDurationParts[i + 1] === 'hr') {
                minutes += parseInt(minDurationParts[i]) * 60;
            } else if (minDurationParts[i + 1] === 'min') {
                minutes += parseInt(minDurationParts[i]);
            }
        }
        return minutes;
    };
    const minDuration = minToMinutes(minDurationParts);

    const maxDurationParts = serviceDuration.split(' - ')[1].split(' ').map(part => part.trim());
    const maxToMinutes = (maxDurationParts) => {
        let minutes = 0;
        for (let i = 0; i < maxDurationParts.length; i += 2) {
            if (maxDurationParts[i + 1] === 'hr') {
                minutes += parseInt(maxDurationParts[i]) * 60;
            } else if (maxDurationParts[i + 1] === 'min') {
                minutes += parseInt(maxDurationParts[i]);
            }
        }
        return minutes;
    };
    const maxDuration = maxToMinutes(maxDurationParts);

    getAppointmentsForEmployee(employeeId, selectedDate, function(appointments) {
        const unavailableMinutes = appointments.map(appointment => {
            const startTime = appointment.start_time.split(':').map(val => parseInt(val, 10));
            const endTime = appointment.end_time.split(':').map(val => parseInt(val, 10));
            return {
                start: startTime[0] * 60 + startTime[1],
                end: endTime[0] * 60 + endTime[1]
            };
        });

        // Obliczanie dostępnych godzin na podstawie godzin pracy pracownika, czasu trwania usługi
        const availableHours = [];
        for (let i = startMinutes; i + minDuration <= endMinutes; i+=30) {
            let endTime = i + maxDuration;
            let isAvailable = true;
            for (const appointment of unavailableMinutes) {
                if (!((i >= appointment.end || endTime <= appointment.start))) {
                    isAvailable = false;
                    break;
                }
            }
            if (isAvailable) {
                availableHours.push({
                    start: Math.floor(i / 60) + ':' + (i % 60).toString().padStart(2, '0'),
                    end: Math.floor(endTime / 60) + ':' + (endTime % 60).toString().padStart(2, '0')
                });
            }
        }
        callback(availableHours);
    });
}
function getAppointmentsForEmployee(employeeId, selectedDate,callback) {
    const request = window.indexedDB.open('ServiceDB');
    
    request.onerror = function(event) {
        console.error("IndexedDB error:", event.target.errorCode);
    };
    
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['Appointments'], 'readonly');
        const objectStore = transaction.objectStore('Appointments');
        const getAppointments = objectStore.getAll();

        getAppointments.onsuccess = function(event) {
            const appointments = [];
            const result = event.target.result;
            for (let i = 0; i < result.length; i++) {
                const appointment = result[i];
                if (appointment.employee_id === employeeId && appointment.appointment_date.toDateString() === new Date(selectedDate).toDateString()) {
                    appointments.push(appointment);
                }
            }
            callback(appointments);
        };

        getAppointments.onerror = function(event) {
            console.error("Error getting appointments:", event.target.errorCode);
        };
    };

    request.onupgradeneeded = function(event) {
        console.log("IndexedDB upgrade needed");
    };
}
    
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
