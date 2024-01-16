var dbUserData;
var dbLoginData;

document.addEventListener("DOMContentLoaded", function () {
    // Otwarcie lub stworzenie bazy danych UserData
    var requestUserData = indexedDB.open("UserData", 1);

    requestUserData.onerror = function (event) {
        console.log("Error opening UserData database");
    };

    requestUserData.onupgradeneeded = function (event) {
        dbUserData = event.target.result;

        // Utworzenie obiektu składowego (store) z odpowiednimi polami
        var objectStoreUserData = dbUserData.createObjectStore("user", { keyPath: "RegisterEmail" });
        objectStoreUserData.createIndex("img", "img", { unique: false });
        objectStoreUserData.createIndex("Name", "Name", { unique: false });
        objectStoreUserData.createIndex("Lastname", "Lastname", { unique: false });
        objectStoreUserData.createIndex("RegisterEmail", "RegisterEmail", { unique: true });
        objectStoreUserData.createIndex("BIO", "BIO", { unique: false });
        objectStoreUserData.createIndex("Telephone", "Telephone", { unique: false });

        console.log("UserData database setup complete");
    };

    requestUserData.onsuccess = function (event) {
        dbUserData = event.target.result;
        updateLoggedInUser();
    };

    // Otwarcie lub stworzenie bazy danych LoginData
    var requestLoginData = indexedDB.open("LoginData", 1);

    requestLoginData.onerror = function (event) {
        console.log("Error opening LoginData database");
    };

    requestLoginData.onupgradeneeded = function (event) {
        dbLoginData = event.target.result;

        // Utworzenie obiektu składowego (store) z odpowiednimi polami
        var objectStoreLoginData = dbLoginData.createObjectStore("user", { keyPath: "email" });
        objectStoreLoginData.createIndex("password", "password", { unique: false });

        console.log("LoginData database setup complete");
    };

    requestLoginData.onsuccess = function (event) {
        dbLoginData = event.target.result;
    };
});
window.addEventListener('DOMContentLoaded', function() {
    var sidebarHeight = document.querySelector('.sidebar').offsetHeight;
    var userProfileHeight = document.querySelector('.userProfile').offsetHeight;
    var logoutBtnHeight = document.querySelector('.logout-btn').offsetHeight;
    var ulHeight = document.querySelector('.sidebar ul').offsetHeight;

    var spacerHeight = sidebarHeight - userProfileHeight - ulHeight - logoutBtnHeight-110;
    document.querySelector('.spacer').style.height = spacerHeight + 'px';
});

function showContent(section) {
    // Ukryj wszystkie sekcje
    hideAllSections();

    // Wyświetl tylko wybraną sekcję
    const content = document.getElementById(`${section}Content`);
    content.style.display = 'block';
}

function hideAllSections() {
    // Ukryj wszystkie sekcje
    const sections = ['posts', 'users', 'profile'];
    sections.forEach(section => {
        const content = document.getElementById(`${section}Content`);
        content.style.display = 'none';
    });
}

// Funkcja do pobierania i aktualizacji informacji o zalogowanym użytkowniku
function updateLoggedInUser() {
    if (!dbUserData) {
        console.log("UserData database is not ready.");
        return;
    }
    // Pobierz adres e-mail użytkownika z adresu URL (przy użyciu funkcji getUrlParameter)
    var userEmail = getUrlParameter('user');

    // Otwórz transakcję do odczytu danych z bazy danych "UserData"
    var transactionUserData = dbUserData.transaction(["user"], "readonly");
    var objectStoreUserData = transactionUserData.objectStore("user");

    // Pobierz informacje o użytkowniku na podstawie adresu e-mail
    var requestGetUser = objectStoreUserData.get(userEmail);

    requestGetUser.onsuccess = function (event) {
        var user = event.target.result;

        // Aktualizuj elementy HTML z informacjami o użytkowniku
        var userProfile = document.getElementById('userProfile');
        if (user) {
            userProfile.innerHTML = `
                <img src="${user.img}" alt="User Image" style="width: 50px; height: 50px; border-radius: 50%;">
                <p>${user.RegisterEmail}</p>
            `;
            // Update user-name and bio
            var userNameParagraph = document.querySelector('.user-name p');
            var bioParagraph = document.querySelector('.bio p');

            userNameParagraph.textContent = `${user.Name} ${user.Lastname}`;
            bioParagraph.textContent = user.BIO;

            // Update input values
            document.getElementById('Name').value = user.Name;
            document.getElementById('Lastname').value = user.Lastname;
            document.getElementById('RegisterEmail').value = user.RegisterEmail;
            document.getElementById('Telephone').value = user.Telephone;
            document.getElementById('BIO').value = user.BIO;
        } else {
            userProfile.innerHTML = '<p>User not found</p>';
        }
    };
    requestGetUser.onerror = function (event) {
        console.log("Error retrieving user from UserData database");
    };
}

// Funkcja pomocnicza do pobierania parametrów z adresu URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}