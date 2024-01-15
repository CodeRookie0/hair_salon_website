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