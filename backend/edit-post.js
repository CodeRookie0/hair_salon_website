document.addEventListener('DOMContentLoaded', loadPostData);

const input = document.getElementById('newImage');
const img = document.getElementById('postImage');

input.addEventListener('change', handleFileSelect);

function getPostIdFromUrl() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get("id");
}

// Function to load post data into the input fields
function loadPostData() {
	const postId = getPostIdFromUrl();

	const dbName = "PostsData";
	const request = indexedDB.open(dbName, 1);

	request.onerror = function (event) {
		console.log("Błąd otwarcia bazy danych:", event.target.errorCode);
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
	};
}
function saveChanges() {
	const dbName = "PostsData";
	const request = indexedDB.open(dbName, 1);

	request.onerror = function (event) {
		console.log("Błąd otwarcia bazy danych:", event.target.errorCode);
	};

	const postId = document.getElementById("postId").value;
	const postTitle = document.getElementById("postTitle").value;
	const postContent = document.getElementById("postContent").value;
	const newImageInput = document.getElementById("newImage");

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
				// Redirect to 'posts.html' after completing the transaction
				window.location.href = "posts.html";
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
					image: "", // Set image as needed
				};

				// Store the new post in the database
				const addRequest = store.add(newPost);
				document.getElementById("postId").value = newPostId;
				handleFileSelect();

				addRequest.onsuccess = function () {
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
				// Redirect to 'posts.html' after completing the transaction
				window.location.href = "posts.html";
			};
		}
		transaction.oncomplete = function () {
			db.close();
			// Redirect to 'posts.html' after completing the transaction
			window.location.href = "posts.html";
		};
	};
}

function handleFileSelect() {
	if (input.files && input.files[0]) {
		const fileReader = new FileReader();

		fileReader.onload = function (e) {
			// Update the image source in the DOM for preview
			img.src = e.target.result;

			// Also update the image value in the IndexedDB
			const postId = document.getElementById("postId").value;
			updateImageInIndexedDB(postId, e.target.result);
		};

		fileReader.readAsDataURL(input.files[0]);
	}
}

function updateImageInIndexedDB(postId, newImage) {
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
// Dodana funkcja do potwierdzania usuwania posta
function confirmDelete() {
	const postId = document.getElementById("postId").value;

	if (confirm("Are you sure you want to delete this post?")) {
		deletePost(postId);
	}
}
// Dodana funkcja do usuwania posta
function deletePost(postId) {
	const dbName = "PostsData";
	const request = indexedDB.open(dbName, 1);

	request.onerror = function (event) {
		console.log("Błąd otwarcia bazy danych:", event.target.errorCode);
	};

	request.onsuccess = function (event) {
		const db = event.target.result;
		const transaction = db.transaction("posts", "readwrite");
		const store = transaction.objectStore("posts");

		const deleteRequest = store.delete(Number(postId));

		deleteRequest.onsuccess = function () {
			console.log(`Usunięto post o ID ${postId}`);
			// Po usunięciu posta, przekieruj do strony posts.html
			window.location.href = "posts.html";
		};

		deleteRequest.onerror = function (event) {
			console.log(
				`Błąd podczas usuwania posta o ID ${postId}:`,
				event.target.errorCode
			);
		};
	};
}