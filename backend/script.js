// Function to show/hide mobile navigation
function showMenu() {
	var navLinks = document.getElementById("navLinks");
	navLinks.style.right = "0";
}

function hideMenu() {
	var navLinks = document.getElementById("navLinks");
	navLinks.style.right = "-200px";
}
function hideSpecificNavigationLinks() {
    // Ukryj wybrane elementy nawigacyjne po zalogowaniu
    var navLinks = document.querySelectorAll(".nav-links ul li");

    // Przykładowe ukrycie elementu o konkretnej nazwie
    var linkToShow  = "POSTS";
	var linkToLogout = "LOGOUT";

    for (var i = 0; i < navLinks.length; i++) {
        var link = navLinks[i].innerText.trim();
        if (link !== linkToShow && link !== linkToLogout ) {
            navLinks[i].style.display = "none";
        }
		if (link === linkToLogout) {
            navLinks[i].style.display = "inline-block";
        }
    }
}
function showSpecificNavigationLinks() {
    // Ukryj wybrane elementy nawigacyjne po zalogowaniu
    var navLinks = document.querySelectorAll(".nav-links ul li");

	var linkToLogout = "LOGOUT";

    for (var i = 0; i < navLinks.length; i++) {
		if (link === linkToLogout) {
            navLinks[i].style.display = "none";
        }
		else{
        navLinks[i].style.display = "inline-block";			
		}
    }
	window.location.href = "index.html";
}