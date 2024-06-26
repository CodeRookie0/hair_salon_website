/*   -------------------------  Profile ---------------------------*/
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
        updateLoggedInUser();
		getAllUsers();
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
    hideAllSections();

    const content = document.getElementById(`${section}Content`);
	if(section==='profile'){
		content.style.display = 'flex';
	}
	else{
    content.style.display = 'block';
	}
    if (section === 'posts') {
        reloadPosts();
    }
	if(section==='users'){
		getAllUsers();
		document.querySelector('.edit-mode-message').style.display='none';
		document.querySelector('.password-section').style.display='none';
	}
}

function hideAllSections() {
	const sections = ['posts', 'users', 'profile','statistics','editPost'];
    sections.forEach(section => {
        const content = document.getElementById(`${section}Content`);
        content.style.display = 'none';
    });
}
function updateLoggedInUser() {
    if (!dbUserData) {
        console.log("UserData database is not ready.");
        return;
    }
    var userEmail = getUrlParameter('user');

    var transactionUserData = dbUserData.transaction(["user"], "readonly");
    var objectStoreUserData = transactionUserData.objectStore("user");

    var requestGetUser = objectStoreUserData.get(userEmail);

    requestGetUser.onsuccess = function (event) {
        var user = event.target.result;

        var userProfile = document.getElementById('userProfile');
        if (user) {
            userProfile.innerHTML = `
                <img src="${user.img}" alt="User Image" style="width: 50px; height: 50px; border-radius: 50%;">
                <p>${user.RegisterEmail}</p>
            `;
            var userNameParagraph = document.querySelector('.user-name p');
			var userProfileImage=document.querySelector('.user-name img');
            var bioParagraph = document.querySelector('.bio p');

            userNameParagraph.textContent = `${user.Name} ${user.Lastname}`;
			userProfileImage.src=user.img;
            bioParagraph.textContent = user.BIO;

            // Update input values
            document.getElementById('Name').value = user.Name;
            document.getElementById('Lastname').value = user.Lastname;
            document.getElementById('Email').value = user.RegisterEmail;
            document.getElementById('Telephone').value = user.Telephone;
            document.getElementById('BIO').value = user.BIO;

			var updatedImage=document.getElementById('newProfileImage');
			updatedImage.addEventListener('change', function () {
				updateProfileImagePreview(user.RegisterEmail);
			});
        } else {
            userProfile.innerHTML = '<p>User not found</p>';
        }
    };
    requestGetUser.onerror = function (event) {
        console.log("Error retrieving user from UserData database");
    };
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function enableEditMode() {
    var button = document.getElementById('editProfileBtn');
    var buttonText = button.innerText;
    if (buttonText=="Edit"){
        document.querySelectorAll('.edit-user-form input, .edit-user-form textarea').forEach(function(element) {
			if(element.id!=="Email"){
				element.removeAttribute('readonly');
				element.style.backgroundColor='white';
			}
			else{
				element.style.cursor="not-allowed";
			}
        });
        document.getElementById('editProfileBtn').innerText = 'Save';
		document.querySelector('.image-section').style.display="block";
    }
    if (buttonText=="Save"){
		if (validateProfileData()) {
			document.querySelectorAll('.edit-user-form input, .edit-user-form textarea').forEach(function(element) {
				if(element.id!=="Email"){
					element.readOnly = true;
					element.style.backgroundColor='#f8f8f8';
				}
				else{
					element.style.cursor="auto";
				}
			});
			document.querySelector('.image-section').style.display="none";
			saveProfileData();
			document.getElementById('editProfileBtn').innerText = 'Edit';
		}
    }
}
// Function to validate user data
function validateProfileData() {
    var updatedName = document.getElementById('Name').value;
    var updatedLastname = document.getElementById('Lastname').value;
    var updatedTelephone = document.getElementById('Telephone').value;

    if (!/^[a-zA-Z]{3,}$/.test(updatedName)) {
        alert("Invalid name format. Please enter a valid name (at least 3 characters long).");
        document.getElementById('Name').focus();
        return false;
    }

    if (!/^[a-zA-Z]{3,}$/.test(updatedLastname)) {
        alert("Invalid last name format. Please enter a valid last name (at least 3 characters long).");
        document.getElementById('Lastname').focus();
        return false;
    }

    if (!/^\d{9}$/.test(updatedTelephone)) {
        alert("Invalid telephone format. Please enter a valid telephone number (9 digits).");
        document.getElementById('Telephone').focus();
        return false;
    }

    return true;
}
function saveProfileData() {
	var userEmail = document.getElementById('Email').value;

	var transactionUserData = dbUserData.transaction(["user"], "readwrite");
	var objectStoreUserData = transactionUserData.objectStore("user");

	var updatedName = document.getElementById('Name').value;
	var updatedLastname = document.getElementById('Lastname').value;
	var updatedTelephone = document.getElementById('Telephone').value;
	var updatedBIO = document.getElementById('BIO').value;
	var updatedImage=document.getElementById('newProfileImage');
		
	var requestGetUser = objectStoreUserData.get(userEmail);

	requestGetUser.onsuccess = function (event) {
		var user = event.target.result;

		if (updatedImage.files && updatedImage.files[0]) {
			console.log("New profile image was selected");
		}
		else{
			if (user) {
				user.img = user.img;
			}
		}
		user.Name = updatedName;
		user.Lastname = updatedLastname;
		user.Telephone = updatedTelephone;
		user.BIO = updatedBIO;

		var requestUpdateUser = objectStoreUserData.put(user);

		requestUpdateUser.onsuccess = function () {
			alert("User data updated successfully.");
			updateLoggedInUser();
		};

		requestUpdateUser.onerror = function (event) {
			console.log("Error updating user data:", event.target.errorCode);
		};
	};

	requestGetUser.onerror = function (event) {
		console.log("Error retrieving user from UserData database");
	};
}
// Function to update the image preview
function updateProfileImagePreview(userEmail) {
	const input = document.getElementById('newProfileImage');

    if (input.files && input.files[0]) {
        const fileReader = new FileReader();

        fileReader.onload = function (e) {
            if (userEmail !== "") {
                // Also update the image value in the IndexedDB
                updateUserImageInIndexedDB(userEmail, e.target.result);
            }
        };

        fileReader.readAsDataURL(input.files[0]);
    }
}
/* -------------------------------- Posts --------------------------------------*/
const danePostow = [
	{
		id: 1,
		title: "Gift Cards at Chic Locks",
		content:
			"<p>Are you looking for the perfect gift for your loved one? 🎀✨<br> We have a great offer for you! Gift cards are now available at Chic Locks Hair Salon. This is a great way to make someone happy and allow them to choose their favorite hairdressing or beauty treatment.<br><br> 🌟  Why are Chic Locks gift cards a great gift?</p><ul><li>Let your loved ones choose from a wide range of hairdressing services.</li><li>Let them relax and feel beautiful thanks to professional treatments.</li><li>A perfect solution for everyone who appreciates luxurious hair and beauty care.</li></ul><p>📞 Contact us for more information and order your gift card today!</p>",
		image: "../images/post_gift.jpg",
	},
	{
		id: 2,
		title: "Chic Locks Celebrates 20th Birthday!",
		content:
			"<p>Dear Chic Locks Customers and Friends,<br><br> It is with great joy and pride that we announce that our salon is celebrating 20 years of existence! 🎈🎂 This is a special moment for us, full of memories, passion and beautiful moments spent with you.<br> Over the years, we have had the honor of cultivating your beauty and taking care of your hair. Thank you for your trust, inspiration and unforgettable moments! It is thanks to you that we are where we are.<br><br> Thank you for these unforgettable 20 years, and there are many more years of beauty, style and wonderful moments with you ahead of us! 🎉💇‍♀️💖</p>",
		image: "../images/post_hp.jpg",
	},
	{
		id: 3,
		title: '"Color Splash" Events!',
		content:
			'<p>Dear Chic Locks customers,<br><br> We present to you our latest initiative that will bring color and joy to your visits! 🌟 "Color Splash" Events - it\'s more than a hairstyle, it\'s a creative experience full of colors!<br><br> What\'s new waiting for you at Chic Locks:</p><ul><li>🎉 "Color Splash" Events: Unique events during which you can experiment with hair colors and discover the latest trends.</li><li>🎨 Creative Styling: Our team of hairdressers will help you create unique styles that will reflect your individuality.</li></ul><p>Let "Color Splash" Events add color to your visits to Chic Locks! 🌈💖</p>',
		image: "../images/post_news.jpg",
	},
	{
		id: 4,
		title: "Discounts on Everything!",
		content:
			"<p>Dear Chic Locks customers,<br><br> We have great news for you! We present our latest offer - \"Discounts on Everything\" at Chic Locks! Now you can enjoy attractive discounts on various hairdressing services.<br><br> What our promotion includes:</p><ul><li>💇‍♀️ <strong>Women's / Men's Haircut:</strong> 40% off any women's haircut.</li><li>💁‍♀️ <strong>Hair Styling:</strong> 20%% off any hair styling.</li><li>🧔 <strong>Beard Trim:</strong> 45% off any beard trim.</li></ul><p>Don't miss the opportunity for a perfect metamorphosis with Chic Locks! 💖💇‍♂️💇‍♀️</p>",
		image: "../images/post_sales.jpg",
	},
];

const dbName = "PostsData";
const request = indexedDB.open(dbName, 1);

request.onerror = function (event) {
	console.log("Error opening database:", event.target.errorCode);
};

request.onupgradeneeded = function (event) {
	const db = event.target.result;

	const postStore = db.createObjectStore("posts", { keyPath: "id" });

	postStore.createIndex("title", "title", { unique: false });
	postStore.createIndex("content", "content", { unique: false });
	postStore.createIndex("image", "image", { unique: false });

	const transaction = event.target.transaction;
	const store = transaction.objectStore("posts");

	danePostow.forEach((post) => {
		store.add(post);
	});
};

request.onsuccess = function (event) {
	const db = event.target.result;
	const transaction = db.transaction("posts", "readonly");
	const store = transaction.objectStore("posts");

	const getAllPosts = store.getAll();

	getAllPosts.onsuccess = function () {
		const postsData = getAllPosts.result;
		const postsContainer = document.getElementById("postsContainer");
		if (postsContainer) {
			generatePostsFromIndexedDB(postsData);
		}
	};

	getAllPosts.onerror = function (event) {
		console.log("Error retrieving data from IndexedDB:", event.target.errorCode);
	};
};
function reloadPosts() {
    const dbName = "PostsData";
    const request = indexedDB.open(dbName, 1);

    request.onerror = function (event) {
        console.log("Error opening database:", event.target.errorCode);
    };

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction("posts", "readonly");
        const store = transaction.objectStore("posts");

        const getAllPosts = store.getAll();

        getAllPosts.onsuccess = function () {
            const postsData = getAllPosts.result;
            generatePostsFromIndexedDB(postsData);
        };

        getAllPosts.onerror = function (event) {
            console.log("Error retrieving data from IndexedDB:", event.target.errorCode);
        };
    };
}
function generatePostsFromIndexedDB(postsData, limit = 5) {
	const postsContainer = document.getElementById("postsContainer");
	postsContainer.innerHTML = "";
	const loadingIndicator = document.getElementById("loadingIndicator");
	if (loadingIndicator) {
        loadingIndicator.style.display = "none";
    }
	const lastPosts = postsData.slice().reverse().slice(0, limit);
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
		editButton.addEventListener("click", () => showEditPostSection(post.id));

		postTextContainer.appendChild(postTitle);
		postTextContainer.appendChild(postContentContainer);
		postTextContainer.appendChild(editButton);

		postContainer.appendChild(postImageContainer);
		postContainer.appendChild(postTextContainer);

		postsContainer.appendChild(postContainer);
	});
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
function loadMorePosts(postsData, limit) {
	const postsContainer = document.getElementById("postsContainer");

	limit += 5;

	generatePostsFromIndexedDB(postsData, limit);
}
// Function to navigate to the edit-post.html page with the post ID in the URL
function navigateToAddPostPage() {
	showEditPostSection();
}

/* ---------------------------- Edit Post ----------------------------*/

function showEditPostSection(postId="") {

    showContent('editPost');
	
    loadPostData(postId);

    var deletePostBtn = document.getElementById('deletePostBtn');
    if(postId===""){
		deletePostBtn.style.display="none";
	}
	else{
		deletePostBtn.style.display="block";
	}

    var postImageInput = document.getElementById('newPostImage');
    if (postImageInput) {
        postImageInput.addEventListener('change', function () {
            handleFileSelect(postId);
        });
    } else {
        console.error("Element with id 'PostImage' not found.");
    }
}

const input = document.getElementById('newPostImage');
const img = document.getElementById('postImage');


function getPostIdFromUrl() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get("id");
}

// Function to load post data into the input fields
function loadPostData(postId) {
	const dbName = "PostsData";
	const request = indexedDB.open(dbName, 1);

	request.onerror = function (event) {
		console.log("Error opening database:", event.target.errorCode);
	};

	request.onsuccess = function (event) {
		const db = event.target.result;
		const transaction = db.transaction("posts", "readonly");
		const store = transaction.objectStore("posts");

		if (postId) {
			// Load existing post data
			const getPost = store.get(Number(postId));

			getPost.onsuccess = function () {
				const post = getPost.result;
				if (post) {
					// Set values in the input fields
					document.getElementById("postId").value = post.id;
					document.getElementById("postTitle").value = post.title;
					document.getElementById("postImage").src = post.image;
					document.getElementById("postContent").value = post.content;
				} else {
					console.error(`Post with ID ${postId} not found.`);
				}
			};

			getPost.onerror = function (event) {
				console.log(
					"Error retrieving post from IndexedDB:",
					event.target.errorCode
				);
			};
		} else {
			// Clear input fields for adding a new post
			document.getElementById("postId").value = "";
			document.getElementById("postTitle").value = "";
			document.getElementById("postImage").src = "";
			document.getElementById("postContent").value = "";
		}
        transaction.oncomplete = function () {
            db.close();
        };
	};
}
function saveChanges() {
	const dbName = "PostsData";
	const request = indexedDB.open(dbName, 1);

	request.onerror = function (event) {
		console.log("Error opening database:", event.target.errorCode);
	};

	const postId = document.getElementById("postId").value;
	const postTitle = document.getElementById("postTitle").value;
	const postContent = document.getElementById("postContent").value;
	const newImageInput = document.getElementById("newPostImage");

	// Validate title, content, and image
	if (postTitle.length < 10) {
		alert("Title must be at least 10 characters long.");
		return;
	}

	if (postContent.length < 30) {
		alert("Content must be at least 30 characters long.");
		return;
	}

	request.onsuccess = function (event) {
		const db = event.target.result;
		const transaction = db.transaction("posts", "readwrite");
		const store = transaction.objectStore("posts");

		if (postId) {
			// Update existing post
			const updatePost = store.get(Number(postId));

			updatePost.onsuccess = function () {
				const post = updatePost.result;
				if (post) {
					// Update post values
					post.title = postTitle;
					post.content = postContent;

					// Store the updated post back to the database
					const updateRequest = store.put(post);

					updateRequest.onsuccess = function () {
						console.log(`Post with ID ${postId} updated successfully.`);
                        
                        // Show success message
                        alert("Post updated successfully!");
                        document.getElementById("newPostImage").value = null;    
                        showContent('posts');
						
                    };

					updateRequest.onerror = function (event) {
						console.error(
							"Error updating post in IndexedDB:",
							event.target.errorCode
						);
					};
				} else {
					console.error(`Post with ID ${postId} not found.`);
				}
			};

			updatePost.onerror = function (event) {
				console.log(
					"Error retrieving post from IndexedDB:",
					event.target.errorCode
				);
			};
			transaction.oncomplete = function () {
				db.close();
				showContent('posts');
				document.getElementById("newPostImage").value = "";
			};
		} else {
			if (newImageInput.files.length === 0) {
				alert("Image is required.");
				return;
			}
			// Add new post
			const getAllPosts = store.getAll();

			getAllPosts.onsuccess = function () {
				const postsData = getAllPosts.result;
				const newPostId =
					postsData.length > 0
						? Math.max(...postsData.map((post) => post.id)) + 1
						: 1;

				const newPost = {
					id: newPostId,
					title: postTitle,
					content: postContent,
				};

				// Store the new post in the database
				const addRequest = store.add(newPost);
				document.getElementById("postId").value = newPostId;

				addRequest.onsuccess = function () {
					handleFileSelect(newPostId);
					console.log(`New post added successfully with ID ${newPostId}.`);
				};

				addRequest.onerror = function (event) {
					console.error(
						"Error adding new post to IndexedDB:",
						event.target.errorCode
					);
				};
			};

			getAllPosts.onerror = function (event) {
				console.log(
					"Error retrieving posts from IndexedDB:",
					event.target.errorCode
				);
			};
			transaction.oncomplete = function () {
				db.close();
				showContent('posts');
			};
		}
		transaction.oncomplete = function () {
			db.close();
			showContent('posts');
			document.getElementById("newPostImage").value = "";
		};
	};
}

function handleFileSelect(postId) {
	if (input.files && input.files[0]) {
			const fileReader = new FileReader();

			fileReader.onload = function (e) {
				// Update the image source in the DOM for preview
				img.src = e.target.result;

				if(postId!==""){
					// Also update the image value in the IndexedDB
					const postId = document.getElementById("postId").value;
					updatePostImageInIndexedDB(postId, e.target.result);
				}
			};

			fileReader.readAsDataURL(input.files[0]);
	}
}

function updatePostImageInIndexedDB(postId, newImage) {
	// Open or create the database
	const dbName = "PostsData";
	const request = indexedDB.open(dbName, 1);

	request.onerror = function (event) {
		console.log("Error opening the database:", event.target.errorCode);
	};

	request.onsuccess = function (event) {
		const db = event.target.result;
		const transaction = db.transaction("posts", "readwrite");
		const store = transaction.objectStore("posts");

		const updatePost = store.get(Number(postId));

		updatePost.onsuccess = function () {
			const post = updatePost.result;
			if (post) {
				// Update the image value
				post.image = newImage;

				// Store the updated post back to the database
				const updateRequest = store.put(post);

				updateRequest.onsuccess = function () {
					console.log(`Post with ID ${postId} updated with new image.`);
                };

				updateRequest.onerror = function (event) {
					console.error(
						"Error updating post in IndexedDB:",
						event.target.errorCode
					);
				};
				// Close the transaction after the updateRequest
				transaction.oncomplete = function () {
					db.close();
				};
			} else {
				console.error(`Post with ID ${postId} not found.`);
				// Close the transaction after the updateRequest
				transaction.oncomplete = function () {
					db.close();
				};
			}
		};

		updatePost.onerror = function (event) {
			console.log(
				"Error retrieving post from IndexedDB:",
				event.target.errorCode
			);
		};
		// Close the transaction when it's done
		transaction.oncomplete = function () {
			db.close();
		};
	};
}
function confirmDeletePost() {
	const postId = document.getElementById("postId").value;

	if (confirm("Are you sure you want to delete this post?")) {
		deletePost(postId);
	}
}
function deletePost(postId) {
	const dbName = "PostsData";
	const request = indexedDB.open(dbName, 1);

	request.onerror = function (event) {
		console.log("Error opening database:", event.target.errorCode);
	};

	request.onsuccess = function (event) {
		const db = event.target.result;
		const transaction = db.transaction("posts", "readwrite");
		const store = transaction.objectStore("posts");

		const deleteRequest = store.delete(Number(postId));

		deleteRequest.onsuccess = function () {
			console.log(`Removed post with ID ${postId}`);
			showContent('posts');
		};

		deleteRequest.onerror = function (event) {
			console.log(
				`Error deleting post with ID ${postId}:`,
				event.target.errorCode
			);
		};
	};
}
/*--------------------------- Users content ---------------------------------------*/
function getAllUsers() {
    if (!dbUserData) {
        console.log("UserData database is not ready.");
        return;
    }

    // Open a transaction to read data from the "user" object store
    var transactionUserData = dbUserData.transaction(["user"], "readonly");
    var objectStoreUserData = transactionUserData.objectStore("user");
	
	var usersTable = document.getElementById('users-table');
	var tbody = usersTable.querySelector('tbody');
	// Usuń wszystkie dzieci z tbody
	while (tbody.firstChild) {
		tbody.removeChild(tbody.firstChild);
	}
    // Open a cursor to iterate over all users
    var cursorRequest = objectStoreUserData.openCursor();

    cursorRequest.onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
            // Process each user and update the HTML
            addUserToTable(cursor.value);
            cursor.continue();
        }
    };

    cursorRequest.onerror = function (event) {
        console.log("Error retrieving users from UserData database:", event.target.errorCode);
    };
}

function addUserToTable(user) {
    var usersTable = document.getElementById('users-table');

    if (!usersTable) {
        console.error("Users table not found.");
        return;
    }
    // Create a table row for the user
    var userRow = document.createElement('tr');
	userRow.id = user.RegisterEmail + '-row';

	// Initialize inputFields array
    var inputFields = [];

    // Create table cells for each user attribute with editable input fields
    var imageCell = createImageCell(user.img);
    inputFields.push(imageCell.querySelector('input'));
    var imageInput = imageCell.querySelector('input');
	imageInput.addEventListener('change', function () {
		updateUserImagePreview(user.RegisterEmail);
	});
    var imagePreview = imageCell.querySelector('img');

    var nameCell = createInputCell('text', user.Name, 'Name');
    inputFields.push(nameCell.querySelector('input'));

    var lastNameCell = createInputCell('text', user.Lastname, 'Lastname');
    inputFields.push(lastNameCell.querySelector('input'));

    var emailCell = createInputCell('email', user.RegisterEmail, 'RegisterEmail');
    inputFields.push(emailCell.querySelector('input'));

    var telephoneCell = createInputCell('text', user.Telephone, 'Telephone');
    inputFields.push(telephoneCell.querySelector('input'));

    var bioCell = createInputCell('text', user.BIO, 'BIO');
    inputFields.push(bioCell.querySelector('input'));

	inputFields.forEach(function (input) {
		var fieldName = input.placeholder.replace(/\s+/g, '-');
        input.id = user.RegisterEmail + '-' + fieldName;
    });
	imagePreview.id = user.RegisterEmail + '-img';
	imageInput.id = user.RegisterEmail + '-input';

    // Add the cells to the row
    userRow.appendChild(imageCell);
    userRow.appendChild(nameCell);
    userRow.appendChild(lastNameCell);
    userRow.appendChild(emailCell);
    userRow.appendChild(telephoneCell);
    userRow.appendChild(bioCell);

    // Create a cell for buttons
    var buttonCell = document.createElement('td');
    buttonCell.className = 'buttons';

    // Create Edit button
    var editButton = document.createElement('button');
    editButton.textContent = 'Edit';
	editButton.id=user.RegisterEmail+'-'+'edit-user-button';
    editButton.className = 'edit-user-btn';
    editButton.addEventListener('click', function () {
		toggleEditMode(user.RegisterEmail);
    });

    // Create Delete button
    var deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
	deleteButton.id=user.RegisterEmail+'-'+'delete-user-button';
    deleteButton.className = 'delete-user-btn';
    deleteButton.addEventListener('click', function () {
        confirmDeleteUser(user.RegisterEmail);
    });

    // Create Save button
    var saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
	saveButton.style.display="none";
	saveButton.id=user.RegisterEmail+'-'+'save-user-button';
    saveButton.className = 'save-user-btn';
    saveButton.addEventListener('click', function () {
		saveUserData(user.RegisterEmail);
    });

	// Create Cancel button
	var cancelButton = document.createElement('button');
	cancelButton.textContent = 'Cancel';
	cancelButton.style.display='none';
	cancelButton.id=user.RegisterEmail+'-'+'cancel-user-button';
	cancelButton.className = 'cancel-user-btn';
	cancelButton.addEventListener('click', function () {
		var editModeMessage = document.querySelector('.edit-mode-message');
		var passwordSection = document.querySelector('.password-section');
		
		editModeMessage.style.display = 'none';
		passwordSection.style.display='none';
		getAllUsers();
	});

    // Add buttons to the cell
    buttonCell.appendChild(editButton);
    buttonCell.appendChild(deleteButton);
    buttonCell.appendChild(saveButton);
	buttonCell.appendChild(cancelButton);

    // Add the button cell to the row
    userRow.appendChild(buttonCell);

    // Append the row to the table
    usersTable.querySelector('tbody').appendChild(userRow);
}

// Helper function to create an input cell
function createInputCell(type, value, placeholder) {
    var cell = document.createElement('td');
    var input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.placeholder = placeholder;
    input.readOnly = true;
    cell.appendChild(input);
    return cell;
}

// Helper function to create an image cell with a preview and file input
function createImageCell(imagePath) {
    var cell = document.createElement('td');
    var imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none';
    cell.appendChild(imageInput);

    var imagePreview = document.createElement('img');
    imagePreview.src = imagePath;
    imagePreview.alt = 'Profile Image';
    imagePreview.style.maxWidth = '60px';
    imagePreview.style.display = 'block';
    cell.appendChild(imagePreview);

    return cell;
}
function toggleEditMode(email) {
	var allRows = document.querySelectorAll('#users-table tbody tr');
    allRows.forEach(function (row) {
        if (row.id !== email + '-row') {
            row.style.display = 'none';
        }
    });

    var editedRow = document.getElementById(email + '-row');
	var editModeMessage = document.querySelector('.edit-mode-message');
	var passwordSection = document.querySelector('.password-section');

    if (editedRow) {
        var inputs = editedRow.querySelectorAll('input');
        inputs.forEach(function (input) {
            if (input.tagName.toLowerCase() === 'input') {
                if (input.type.toLowerCase() === 'email' && email!=="new") {
                    input.readOnly = true;
                }
				else {
                    input.readOnly = false;
                }
            }
        });
        document.getElementById(email + '-save-user-button').style.display = 'inline-block';
        document.getElementById(email + '-cancel-user-button').style.display = 'inline-block';
        document.getElementById(email + '-edit-user-button').style.display = 'none';
        document.getElementById(email + '-delete-user-button').style.display = 'none';
		document.getElementById(email + '-input').style.display = 'block';
        document.getElementById(email + '-img').style.display = 'block';

		editModeMessage.style.display = 'block';
		if(email==='new'){
			passwordSection.style.display='flex';
		}
    } else {
		if(validateUserData(email) && checkPasswordMatch()){
		
		document.getElementById(email + '-save-user-button').style.display = 'none';
		document.getElementById(email + '-cancel-user-button').style.display = 'none';
		document.getElementById(email + '-edit-user-button').style.display = 'inline-block';
		document.getElementById(email + '-delete-user-button').style.display = 'inline-block';
		document.getElementById(email + '-input').style.display = 'none';
		document.getElementById(email + '-img').style.display = 'none';
			
		editModeMessage.style.display = 'none';
		passwordSection.style.display='none';
		}
    }
}
function validateUserData(email) {
    var nameInput = document.getElementById(email +'-Name').value;
	var lastnameInput = document.getElementById(email +'-Lastname').value;
	var emailInput = document.getElementById(email +'-RegisterEmail').value;
	var telephoneInput = document.getElementById(email +'-Telephone').value;
	var passwordInput = document.getElementById('NewPassword').value;

	if (!/^[a-zA-Z]{3,}$/.test(nameInput)) {
		alert("Invalid name format. Please enter a valid name (at least 3 characters long).");
		document.getElementById(email +'-Name').focus();
		return;
	}

	if (!/^[a-zA-Z]{3,}$/.test(lastnameInput)) {
		alert("Invalid last name format. Please enter a valid last name (at least 3 characters long).");
		document.getElementById(email +'-Lastname').focus();
		return;
	}

	if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailInput)) {
		alert("Invalid email format. Please enter a valid email address.");
		document.getElementById(email +'-RegisterEmail').focus();
		return;
	}

	if (!/^\d{9}$/.test(telephoneInput)) {
		alert("Invalid telephone format. Please enter a valid telephone number (9 digits).");
		document.getElementById(email +'-Telephone').focus();
		return;
	}
	if(email==="new"){
		if (!/.{8,}/.test(passwordInput)) {
			alert("Invalid password format. Password must be at least 8 characters long.");
			document.getElementById('NewPassword').focus();
			return;
		}
	}
    return true;
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
function checkIfEmailExists(email, callback) {
    var transaction = dbUserData.transaction(["user"], "readonly");
    var objectStore = transaction.objectStore("user");
    var request = objectStore.get(email);

    request.onsuccess = function (event) {
        var user = event.target.result;
        if (user) {
            // Email already exists
            callback(true);
        } else {
            // Email does not exist
            callback(false);
        }
    };

    request.onerror = function (event) {
        console.error("Error checking if email exists:", event.target.error);
        callback(false); // Assume email does not exist in case of an error
    };
}
function saveUserData(email) {
    var transaction = dbUserData.transaction(["user"], "readwrite");
    var objectStore = transaction.objectStore("user");
	
	if(validateUserData(email)){
		var inputs = document.querySelectorAll('[id^="' + email + '"]');
		var updatedData = { RegisterEmail: email };

		inputs.forEach(function (input) {
			if (input.tagName.toLowerCase() === 'input') {
				if (!input.id.endsWith('-img') && !input.id.endsWith('-input') && !input.id.endsWith('Password')) {
					updatedData[input.placeholder] = input.value;
				}
				if(email!=="new"){
					input.readOnly = true;
				}
			}
		});
	
        if (email === "new") {
            if (checkPasswordMatch()) {
				checkIfEmailExists(updatedData.RegisterEmail, function (emailExists) {
					if (!emailExists) {
					var transaction = dbUserData.transaction(["user"], "readwrite");
                	var objectStore = transaction.objectStore("user");
					var imageInput = document.getElementById(email + '-input');
					var imageDefault = document.getElementById(email + '-img').src;
					if (imageInput.files && imageInput.files[0]) {
						updatedData.img = imageDefault;	
					}
					else{
						updatedData.img = imageDefault;	
					}

					var newEmailInput = document.getElementById(email +'-RegisterEmail');
					var newEmail = newEmailInput.value.trim();

					if (newEmail === "") {
						console.error("Cannot add a new user without a valid email.");
						return;
					}
					updatedData.RegisterEmail = newEmail;
					Object.keys(updatedData).forEach(function (key) {
						if (updatedData[key] === "") {
							delete updatedData[key];
						}
					});

					console.log(updatedData);
					objectStore.add(updatedData).onsuccess = function (event) {
						
						var transactionLoginData = dbLoginData.transaction(["user"], "readwrite");
                        var objectStoreLoginData = transactionLoginData.objectStore("user");

                        // Add record to LoginData
                        var loginDataRecord = {
                            email: updatedData.RegisterEmail,
                            password: document.getElementById('NewPassword').value,
                        };

                        objectStoreLoginData.add(loginDataRecord).onsuccess = function (event) {
                            console.log("New user added to LoginData successfully:", loginDataRecord);
							alert("New user added successfully!");

							inputs.forEach(function (input) {
								if (input.tagName.toLowerCase() === 'input') {
										input.readOnly = true;
								}
							});

							var editModeMessage = document.querySelector('.edit-mode-message');
							var passwordSection = document.querySelector('.password-section');
							var NewPassword = document.getElementById('NewPassword');
							var confirmPassword = document.getElementById('confirmPassword');
							NewPassword.value=null;
							confirmPassword=null;
							editModeMessage.style.display = 'none';
							passwordSection.style.display='none';

							getAllUsers();
							updateLoggedInUser();
						};
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
		} else {
			var imageInput = document.getElementById(email + '-input');
			if (imageInput.files && imageInput.files[0]) {
				console.log("New profile image was selected");
			}
			else{
				var isUserExist = objectStore.get(email);
				isUserExist.onsuccess = function (event) {
						var user = isUserExist.result;
					if (user) {
						updatedData.img = user.img;
					}
				}
			}

			var existingUser = objectStore.get(email);

			existingUser.onsuccess = function (event) {
				var user = existingUser.result;

				if (user) {
					updatedData.img = user.img;
				}

				var request = objectStore.put(updatedData);

				request.onsuccess = function (event) {
					console.log("User data updated successfully:", updatedData);
					alert("User data updated successfully!");
					var editModeMessage = document.querySelector('.edit-mode-message');
					var passwordSection = document.querySelector('.password-section');
					editModeMessage.style.display = 'none';
					passwordSection.style.display='none';
					getAllUsers();
					updateLoggedInUser();
				};

				request.onerror = function (event) {
					console.log("Error updating user data:", event.target.errorCode);
				};
			};

			existingUser.onerror = function (event) {
				console.log("Error retrieving existing user data:", event.target.errorCode);
			};
		}
	}else{
		return;
	}
}
// Function to update the image preview
function updateUserImagePreview(userEmail) {
	const input = document.getElementById(userEmail+'-input');
    const img = document.getElementById(userEmail+'-img');

    if (input.files && input.files[0]) {
        const fileReader = new FileReader();

        fileReader.onload = function (e) {
            // Update the image source in the DOM for preview
            img.src = e.target.result;

            if (userEmail !== "new") {
                // Also update the image value in the IndexedDB
                updateUserImageInIndexedDB(userEmail, e.target.result);
            }
        };

        fileReader.readAsDataURL(input.files[0]);
    }
}
function updateUserImageInIndexedDB(registerEmail, newImage) {
    // Open or create the database
    const dbName = "UserData";
    const request = indexedDB.open(dbName, 1);

    request.onerror = function (event) {
        console.log("Error opening the database:", event.target.errorCode);
    };

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["user"], "readwrite");
        const store = transaction.objectStore("user");

        const updateUser = store.get(registerEmail);

        updateUser.onsuccess = function () {
            const user = updateUser.result;
            if (user) {
                // Update the image value
                user.img = newImage;

                // Store the updated user back to the database
                const updateRequest = store.put(user);

                updateRequest.onsuccess = function () {
                    console.log(`User with email ${registerEmail} updated with new image.`);
                };

                updateRequest.onerror = function (event) {
                    console.error(
                        "Error updating user in IndexedDB:",
                        event.target.errorCode
                    );
                };

                // Close the transaction after the updateRequest
                transaction.oncomplete = function () {
                    db.close();
                };
            } else {
                console.error(`User with email ${registerEmail} not found.`);

                // Close the transaction after the updateRequest
                transaction.oncomplete = function () {
                    db.close();
                };
            }
        };

        updateUser.onerror = function (event) {
            console.log(
                "Error retrieving user from IndexedDB:",
                event.target.errorCode
            );
        };

        // Close the transaction when it's done
        transaction.oncomplete = function () {
            db.close();
        };
    };
}

function confirmDeleteUser(userEmail) {
	if (confirm("Are you sure you want to delete this user?")) {
		deleteUser(userEmail);
	}
}
function deleteUser(userEmail) {
	const dbName = "UserData";
    const request = indexedDB.open(dbName, 1);

	request.onerror = function (event) {
		console.log("Error opening database:", event.target.errorCode);
	};

	request.onsuccess = function (event) {
		const db = event.target.result;
		const transaction = db.transaction("user", "readwrite");
        const store = transaction.objectStore("user");

        const deleteRequest = store.delete(userEmail);

		deleteRequest.onsuccess = function () {
			const dbName = "LoginData";
			const request = indexedDB.open(dbName, 1);

			request.onerror = function (event) {
				console.log("Error opening LoginData database:", event.target.errorCode);
			};

			request.onsuccess = function (event) {
				const db = event.target.result;
				const transaction = db.transaction("user", "readwrite");
				const store = transaction.objectStore("user");

				const deleteRequest = store.delete(userEmail);

				deleteRequest.onsuccess = function () {
					console.log(`Removed user with email address ${userEmail} from UserData`);
					showContent('users');
				};

				deleteRequest.onerror = function (event) {
					console.log(
						`Error removing user with email ${userEmail} from LoginData:`,
						event.target.errorCode
					);
				};
			};
			
		};

		deleteRequest.onerror = function (event) {
			console.log(
				`Error deleting post with ID ${postId}:`,
				event.target.errorCode
			);
		};
	};
}
function addNewUserRow() {
    var usersTable = document.getElementById('users-table');
    var tbody = usersTable.querySelector('tbody');

    var newUser = {
        RegisterEmail: 'new',
        Name: '',
        Lastname: '',
        Telephone: '',
        BIO: '',
        img: '../images/download.png'
    };

    addUserToTable(newUser);

    toggleEditMode(newUser.RegisterEmail);
}
function logout() {
    window.location.href = "../html/index.html"; 
}