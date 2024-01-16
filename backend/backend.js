/*   -------------------------  Profile ---------------------------*/
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

    var spacerHeight = sidebarHeight - userProfileHeight - ulHeight - logoutBtnHeight-120;
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
            document.getElementById('Email').value = user.RegisterEmail;
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

function enableEditMode() {
    var button = document.querySelector('.button-section button');
    // Sprawdź tekst przycisku za pomocą innerText
    var buttonText = button.innerText;
    if (buttonText=="Edit"){
        document.querySelectorAll('.edit-user-form input, .edit-user-form textarea').forEach(function(element) {
            element.removeAttribute('readonly');
            element.style.backgroundColor='white';
        });
        document.querySelector('.button-section button').innerText = 'Save';
    }
    if (buttonText=="Save"){
        document.querySelectorAll('.edit-user-form input, .edit-user-form textarea').forEach(function(element) {
            element.readOnly = true;
            element.style.backgroundColor='#f8f8f8';
        });
        document.querySelector('.button-section button').innerText = 'Edit';
    }
}
// Function to update the URL with the new email
function updateUrlWithNewEmail(newEmail) {
    // Get the current URL without the query parameters
    var baseUrl = window.location.href.split('?')[0];
    
    // Update the email parameter in the URL
    var newUrl = baseUrl + '?user=' + encodeURIComponent(newEmail);

    // Replace the current URL with the updated one
    window.history.replaceState({}, document.title, newUrl);
}
/* -------------------------------- Posts --------------------------------------*/
const danePostow = [
	{
		id: 1,
		title: "Gift Cards at Chic Locks",
		content:
			"<p>Are you looking for the perfect gift for your loved one? 🎀✨<br> We have a great offer for you! Gift cards are now available at Chic Locks Hair Salon. This is a great way to make someone happy and allow them to choose their favorite hairdressing or beauty treatment.<br><br> 🌟  Why are Chic Locks gift cards a great gift?</p><ul><li>Let your loved ones choose from a wide range of hairdressing services.</li><li>Let them relax and feel beautiful thanks to professional treatments.</li><li>A perfect solution for everyone who appreciates luxurious hair and beauty care.</li></ul><p>📞 Contact us for more information and order your gift card today!</p>",
		image: "images/post_gift.jpg",
	},
	{
		id: 2,
		title: "Chic Locks Celebrates 20th Birthday!",
		content:
			"<p>Dear Chic Locks Customers and Friends,<br><br> It is with great joy and pride that we announce that our salon is celebrating 20 years of existence! 🎈🎂 This is a special moment for us, full of memories, passion and beautiful moments spent with you.<br> Over the years, we have had the honor of cultivating your beauty and taking care of your hair. Thank you for your trust, inspiration and unforgettable moments! It is thanks to you that we are where we are.<br><br> Thank you for these unforgettable 20 years, and there are many more years of beauty, style and wonderful moments with you ahead of us! 🎉💇‍♀️💖</p>",
		image: "images/post_hp.jpg",
	},
	{
		id: 3,
		title: '"Color Splash" Events!',
		content:
			'<p>Dear Chic Locks customers,<br><br> We present to you our latest initiative that will bring color and joy to your visits! 🌟 "Color Splash" Events - it\'s more than a hairstyle, it\'s a creative experience full of colors!<br><br> What\'s new waiting for you at Chic Locks:</p><ul><li>🎉 "Color Splash" Events: Unique events during which you can experiment with hair colors and discover the latest trends.</li><li>🎨 Creative Styling: Our team of hairdressers will help you create unique styles that will reflect your individuality.</li></ul><p>Let "Color Splash" Events add color to your visits to Chic Locks! 🌈💖</p>',
		image: "images/post_news.jpg",
	},
	{
		id: 4,
		title: "Discounts on Everything!",
		content:
			"<p>Dear Chic Locks customers,<br><br> We have great news for you! We present our latest offer - \"Discounts on Everything\" at Chic Locks! Now you can enjoy attractive discounts on various hairdressing services.<br><br> What our promotion includes:</p><ul><li>💇‍♀️ <strong>Women's / Men's Haircut:</strong> 40% off any women's haircut.</li><li>💁‍♀️ <strong>Hair Styling:</strong> 20%% off any hair styling.</li><li>🧔 <strong>Beard Trim:</strong> 45% off any beard trim.</li></ul><p>Don't miss the opportunity for a perfect metamorphosis with Chic Locks! 💖💇‍♂️💇‍♀️</p>",
		image: "images/post_sales.jpg",
	},
];

// Otwórz lub utwórz bazę danych
const dbName = "PostsData";
const request = indexedDB.open(dbName, 1);

request.onerror = function (event) {
	console.log("Błąd otwarcia bazy danych:", event.target.errorCode);
};

request.onupgradeneeded = function (event) {
	const db = event.target.result;

	// Utwórz sklep obiektów (tabelę) dla postów
	const postStore = db.createObjectStore("posts", { keyPath: "id" });

	// Dodaj indeksy do obiektu sklepu
	postStore.createIndex("title", "title", { unique: false });
	postStore.createIndex("content", "content", { unique: false });
	postStore.createIndex("image", "image", { unique: false });

	// Dodaj dane postów do bazy danych
	const transaction = event.target.transaction;
	const store = transaction.objectStore("posts");

	danePostow.forEach((post) => {
		store.add(post);
	});
};

request.onsuccess = function (event) {
	// Po otwarciu bazy danych wykonaj operacje na niej
	const db = event.target.result;
	const transaction = db.transaction("posts", "readonly");
	const store = transaction.objectStore("posts");

	const getAllPosts = store.getAll();

	getAllPosts.onsuccess = function () {
		const postsData = getAllPosts.result;
		// Po pobraniu danych z IndexedDB, wywołaj funkcję do generowania postów
		const postsContainer = document.getElementById("postsContainer");
		if (postsContainer) {
			generatePostsFromIndexedDB(postsData);
		}
	};

	getAllPosts.onerror = function (event) {
		console.log("Błąd pobierania danych z IndexedDB:", event.target.errorCode);
	};
};

function generatePostsFromIndexedDB(postsData, limit = 5) {
	const postsContainer = document.getElementById("postsContainer");
	postsContainer.innerHTML = "";

	// Wybierz tylko ostatnie `limit` postów
	const lastPosts = postsData.slice().reverse().slice(0, limit);
	// Wywołaj funkcję do generowania postów z pobranych danych
	lastPosts.forEach((post) => {
		const postContainer = document.createElement("div");
		postContainer.classList.add("post-container");

		const postImageContainer = document.createElement("div");
		postImageContainer.classList.add("post-image");

		const postImage = document.createElement("img");
		postImage.classList.add("post-image");
		postImage.src = post.image;
		postImage.alt = post.title;

		postImageContainer.appendChild(postImage);

		const postTextContainer = document.createElement("div");
		postTextContainer.classList.add("post-text");

		const postTitle = document.createElement("h2");
		postTitle.textContent = post.title;

		const postContentContainer = document.createElement("div");

		// Check if content starts with <p>
		if (!post.content.trim().startsWith("<p>")) {
			const postContent = document.createElement("p");
			postContent.innerHTML = post.content;
			postContentContainer.appendChild(postContent);
		} else {
			postContentContainer.innerHTML = post.content;
		}

		const editButton = document.createElement("button");
		editButton.classList.add("edit-post-btn");
		editButton.textContent = "Edit";
		editButton.addEventListener("click", () => navigateToEditPage(post.id));

		postTextContainer.appendChild(postTitle);
		postTextContainer.appendChild(postContentContainer);
		postTextContainer.appendChild(editButton);

		postContainer.appendChild(postImageContainer);
		postContainer.appendChild(postTextContainer);

		postsContainer.appendChild(postContainer);
	});
	// Dodaj przycisk do wczytywania kolejnych postów
	if (postsData.length > limit) {
		const loadMoreButton = document.createElement("button");
		loadMoreButton.classList.add("load-more-btn");
		loadMoreButton.textContent = "Load More";
		loadMoreButton.addEventListener("click", () =>
			loadMorePosts(postsData, limit)
		);
		postsContainer.appendChild(loadMoreButton);
	}
}
// Funkcja do wczytywania kolejnych postów
function loadMorePosts(postsData, limit) {
	const postsContainer = document.getElementById("postsContainer");

	// Aktualizuj limit, aby wczytać kolejne posty
	limit += 5;

	// Ponownie wywołaj funkcję generującą posty z nowym limitem
	generatePostsFromIndexedDB(postsData, limit);
}
// Function to navigate to the edit-post.html page with the post ID in the URL
function navigateToEditPage(postId) {
	window.location.href = `edit-post.html?id=${postId}`;
}
function navigateToAddPostPage() {
	window.location.href = "edit-post.html";
}