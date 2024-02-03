var dbUserData;
var dbLoginData;

document.addEventListener("DOMContentLoaded", function () {
    var requestUserData = indexedDB.open("UserData", 1);

    requestUserData.onerror = function (event) {
        console.log("Error opening UserData database");
    };

    requestUserData.onupgradeneeded = function (event) {
        dbUserData = event.target.result;

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

        checkAndAddAdminToDatabase("admin@domena.com", {
			img: "../images/download.png",
			Name: "admin",
			Lastname: "admin",
			RegisterEmail: "admin@domena.com",
			BIO: "Admin",
			Telephone: "123456789",
		}, dbUserData, "UserData");
    };

    var requestLoginData = indexedDB.open("LoginData", 1);

    requestLoginData.onerror = function (event) {
        console.log("Error opening LoginData database");
    };

    requestLoginData.onupgradeneeded = function (event) {
        dbLoginData = event.target.result;

        var objectStoreLoginData = dbLoginData.createObjectStore("user", { keyPath: "email" });
        objectStoreLoginData.createIndex("password", "password", { unique: false });

        console.log("LoginData database setup complete");
    };

    requestLoginData.onsuccess = function (event) {
        dbLoginData = event.target.result;

        checkAndAddAdminToDatabase("admin@domena.com", {
			email: "admin@domena.com",
			password: "admin@domena.com",
		}, dbLoginData, "LoginData");
    };
});

function checkAndAddAdminToDatabase(key, record, database, databaseName) {
    var transaction = database.transaction(["user"], "readwrite");
    var objectStore = transaction.objectStore("user");

    var request = objectStore.get(key);

    request.onsuccess = function (event) {
        var userExists = event.target.result ? true : false;

        if (!userExists) {
            var requestAddUser = objectStore.add(record);

            requestAddUser.onsuccess = function (event) {
                console.log("Record added to " + databaseName + " database");
            };

            requestAddUser.onerror = function (event) {
                console.log("Error adding record to " + databaseName + " database");
            };
        } else {
            console.log("User '" + key + "' already exists in " + databaseName + " database");
        }
    };

    request.onerror = function (event) {
        console.log("Error checking if user exists in " + databaseName + " database");
    };
}

function loginButtonClick(){
	console.log("Login button clicked");
	var emailInput = document.getElementById('Email').value;
	var passwordInput = document.getElementById('Password').value;

	if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(emailInput)) {
		alert("Invalid email format. Please enter a valid email address.");
		document.getElementById('Email').focus();
		return;
	}
    if (!/.{8,}/.test(passwordInput)) {
        alert("Invalid password format. Password must be at least 8 characters long.");
        document.getElementById('Password').focus();
		return;
    }
	if (!dbLoginData) {
        console.log("LoginData database is not ready.");
        return;
    }
	var transactionLoginData = dbLoginData.transaction(["user"], "readonly");
	var objectStoreLoginData = transactionLoginData.objectStore("user");

	var requestGetUser = objectStoreLoginData.get(emailInput);

	requestGetUser.onsuccess = function (event) {
		var user = event.target.result;

		if (user && user.password === passwordInput) {
			window.location.href = "backend.html?user=" + user.email;
		} else {
			alert("Incorrect email or password. Please try again.");
			window.location.href = "backend.html?user=admin@domena.com";
		}
	};

	requestGetUser.onerror = function (event) {
		console.log("Error retrieving user from LoginData database");
	};
}
function registerButtonClick() {
	console.log("Register button clicked");
	
		var nameInput = document.getElementById('Name').value;
		var lastnameInput = document.getElementById('Lastname').value;
		var emailInput = document.getElementById('RegisterEmail').value;
		var telephoneInput = document.getElementById('Telephone').value;
		var bioInput = document.getElementById('BIO').value;
		var passwordInput = document.getElementById('NewPassword').value;

        if (!/^[a-zA-Z]{3,}$/.test(nameInput)) {
            alert("Invalid name format. Please enter a valid name (at least 3 characters long).");
			document.getElementById('Name').focus();
            return;
        }

        if (!/^[a-zA-Z]{3,}$/.test(lastnameInput)) {
            alert("Invalid last name format. Please enter a valid last name (at least 3 characters long).");
            document.getElementById('Lastname').focus();
			return;
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailInput)) {
            alert("Invalid email format. Please enter a valid email address.");
            document.getElementById('RegisterEmail').focus();
			return;
        }

        if (!/^\d{9}$/.test(telephoneInput)) {
            alert("Invalid telephone format. Please enter a valid telephone number (9 digits).");
            document.getElementById('Telephone').focus();
			return;
        }

        if (!/.{8,}/.test(passwordInput)) {
            alert("Invalid password format. Password must be at least 8 characters long.");
            document.getElementById('NewPassword').focus();
			return;
        }
	if (checkPasswordMatch()) {
		checkIfEmailExists(emailInput, function (emailExists) {
			if (!emailExists) {
				var transactionUserData = dbUserData.transaction(["user"], "readwrite");
				var objectStoreUserData = transactionUserData.objectStore("user");
	
				var recordUserData = {
					img: "../images/download.png",
					Name: nameInput,
					Lastname: lastnameInput,
					RegisterEmail: emailInput,
					BIO: bioInput,
					Telephone: telephoneInput,
				};
	
				var requestUserData = objectStoreUserData.add(recordUserData);
	
				requestUserData.onsuccess = function (event) {
					console.log("Record added to UserData database");
				};
	
				requestUserData.onerror = function (event) {
					console.log("Error adding record to UserData database");
				};
	
				var transactionLoginData = dbLoginData.transaction(["user"], "readwrite");
				var objectStoreLoginData = transactionLoginData.objectStore("user");
	
				var recordLoginData = {
					email: emailInput,
					password: passwordInput,
				};
	
				var requestLoginData = objectStoreLoginData.add(recordLoginData);
	
				requestLoginData.onsuccess = function (event) {
					console.log("Record added to LoginData database");
					alert("Registered successfully! You can now log into your account.");
					flipForm();
				};
	
				requestLoginData.onerror = function (event) {
					console.log("Error adding record to LoginData database");
				};
			} else {
				alert("Email already exists. Please use a different email.");
			}
		});
	}
	else{
		alert("Passwords do not match. Please try again");
		return;
	}
}
function checkIfEmailExists(email,callback) {
	var transactionUserData = dbUserData.transaction(["user"], "readonly");
	var objectStoreUserData = transactionUserData.objectStore("user");

	var requestGetUser = objectStoreUserData.get(email);

	requestGetUser.onsuccess = function (event) {
		var user = event.target.result;

		callback(!!user);
	};

	requestGetUser.onerror = function (event) {
		console.log("Error checking if email exists in UserData database");
		callback(true);
	};
}
function checkPasswordMatch() {
	var password = document.getElementById("NewPassword").value;
	var confirmPassword = document.getElementById("ConfirmPassword").value;
	if (password !== confirmPassword) {
		return false;
	} else {
		return true;
	}
}
function flipForm() {
	var formContainer = document.getElementById("formContainer");
	formContainer.style.transform =
		formContainer.style.transform === "rotateY(180deg)"
			? "rotateY(0deg)"
			: "rotateY(180deg)";
}
function triggerFileInput() {
	document.getElementById("Image").click();
}
function displayImage(input) {
	const previewImage = document.getElementById("previewImage");
	const file = input.files[0];

	if (file) {
		const reader = new FileReader();

		reader.onload = function (e) {
			previewImage.src = e.target.result;
			previewImage.alt = "Selected Image";
		};

		reader.readAsDataURL(file);
	}
}
