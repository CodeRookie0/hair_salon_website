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
	console.log("Błąd otwarcia bazy danych:", event.target.errorCode);
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
		console.log("Błąd pobierania danych z IndexedDB:", event.target.errorCode);
	};
};

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

		//const editButton = document.createElement("button");
		//editButton.classList.add("edit-post-btn");
		//editButton.textContent = "Edit";
		//editButton.addEventListener("click", () => navigateToEditPage(post.id));

		postTextContainer.appendChild(postTitle);
		postTextContainer.appendChild(postContentContainer);
		//postTextContainer.appendChild(editButton);

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
//function navigateToEditPage(postId) {
//	window.location.href = `edit-post.html?id=${postId}`;
//}
//function navigateToAddPostPage() {
//	window.location.href = "edit-post.html";
//} 