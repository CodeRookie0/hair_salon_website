// Support for scroll buttons
document.addEventListener('DOMContentLoaded', () => {
  const servicesMenu  = document.querySelector('.scroll-menu');
  const scrollLeftButton  = document.getElementById('left-scroll-btn');
  const scrollRightButton  = document.getElementById('right-scroll-btn');

  scrollLeftButton .onclick = () => {
    servicesMenu .scrollLeft -= 150;
  };

  scrollRightButton .onclick = () => {
    servicesMenu .scrollLeft += 150;
  };

  const checkScrollButtons = () => {
    scrollLeftButton .disabled = servicesMenu .scrollLeft <= 0;
    scrollRightButton .disabled = servicesMenu .scrollLeft + servicesMenu .offsetWidth >= servicesMenu .scrollWidth;
  };

  servicesMenu .addEventListener('scroll', checkScrollButtons);
  window.addEventListener('load', checkScrollButtons);
});

// Update sub-header height
const subHeader = document.querySelector('.sub-header');
const servicesNavigation  = document.querySelector('.services-navigation');
const scrollMenuWrapper = document.querySelector('.scroll-menu-wrapper');

const subHeaderHeight = subHeader.offsetHeight;
const servicesNavigationOffsetTop  = servicesNavigation .offsetTop;

function updateSubHeaderHeight() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop >= servicesNavigationOffsetTop  - subHeaderHeight) {
      subHeader.style.height = `${subHeaderHeight + 40}px`;
      subHeader.appendChild(scrollMenuWrapper);
      
      subHeader.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
  } else {
      subHeader.style.height = `${subHeaderHeight}px`;

      if (scrollMenuWrapper.parentNode === subHeader) {
          subHeader.removeChild(scrollMenuWrapper);
          const h2 = servicesNavigation .querySelector('h2');
          servicesNavigation .insertBefore(scrollMenuWrapper, h2.nextSibling);
      }
      subHeader.style.boxShadow = '';
  }
}

window.addEventListener('load', updateSubHeaderHeight);
window.addEventListener('scroll', updateSubHeaderHeight);
window.addEventListener('scroll', navHighlighter);


function navHighlighter() {
  // Highlight the current section in the menu
  const sections = document.querySelectorAll('.service-category');
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 220;
      const sectionId = section.getAttribute('id');
      const currentSection = document.querySelector(`.scroll-menu a[href*=${sectionId}]`);

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSection.style.position = 'relative';
          const line = currentSection.querySelector('.line');
          line.style.display = 'block';
      } else {
          const line = currentSection.querySelector('.line');
          line.style.display = 'none';
      }
  });
}



//<!--------------------------------------------------------------------------->
// Funkcja inicjalizująca bazę danych
function initializeDatabase() {
  // Otwórz lub utwórz bazę danych z nazwą "ServiceDB" i wersją 1
  const request = indexedDB.open('ServiceDB', 1);

  // Obsługa błędów podczas otwierania bazy danych
  request.onerror = function(event) {
      console.error('Nie udało się otworzyć bazy danych:', event.target.error);
  };

  // Obsługa sukcesu otwierania lub tworzenia bazy danych
  request.onsuccess = function(event) {
      console.log('Baza danych otwarta pomyślnie.');
      const db = event.target.result;
      // Sprawdź, czy tabele są puste przed dodaniem danych
      const categoriesStore = db.transaction('ServiceCategories').objectStore('ServiceCategories');
      const servicesStore = db.transaction('Services').objectStore('Services');
      const employeesStore = db.transaction('Employees').objectStore('Employees');

      categoriesStore.count().onsuccess = function(event) {
        const categoriesCount = event.target.result;
        if (categoriesCount === 0) {
          addCategoriesToDatabase(db);
          location.reload();
        }
      };

      servicesStore.count().onsuccess = function(event) {
        const servicesCount = event.target.result;
        if (servicesCount === 0) {
          addServicesToDatabase(db);
          location.reload();
        }
      };

      employeesStore.count().onsuccess = function(event) {
        const employeesCount = event.target.result;
        if (employeesCount === 0) {
          addEmployeesToDatabase(db);
          location.reload();
        }
      };
  };

  // Obsługa aktualizacji wersji bazy danych
  request.onupgradeneeded = function(event) {
      const db = event.target.result;

      // Utwórz tabelę Services
      const servicesStore = db.createObjectStore('Services', { keyPath: 'service_id' });
      servicesStore.createIndex('name', 'name', { unique: false });
      servicesStore.createIndex('duration', 'duration', { unique: false });
      servicesStore.createIndex('min_price', 'min_price', { unique: false });
      servicesStore.createIndex('max_price', 'max_price', { unique: false });
      servicesStore.createIndex('description', 'description', { unique: false });
      servicesStore.createIndex('categoryId', 'categoryId', { unique: false });

      // Utwórz tabelę Employees
      const employeesStore = db.createObjectStore('Employees', { keyPath: 'employee_id', autoIncrement: true });
      employeesStore.createIndex('first_name', 'first_name', { unique: false });
      employeesStore.createIndex('last_name', 'last_name', { unique: false });
      employeesStore.createIndex('service_id', 'service_id', { unique: false });
      employeesStore.createIndex('price', 'price', { unique: false });
      employeesStore.createIndex('working_hours', 'working_hours', { unique: false });
      employeesStore.createIndex('created_at', 'created_at', { unique: false });

      // Utwórz tabelę Appointments
      const appointmentsStore = db.createObjectStore('Appointments', { keyPath: 'appointment_id' });
      appointmentsStore.createIndex('service_id', 'service_id', { unique: false });
      appointmentsStore.createIndex('employee_id', 'employee_id', { unique: false });
      appointmentsStore.createIndex('customer_id', 'customer_id', { unique: false });
      appointmentsStore.createIndex('appointment_date', 'appointment_date', { unique: false });
      appointmentsStore.createIndex('start_time', 'start_time', { unique: false });
      appointmentsStore.createIndex('end_time', 'end_time', { unique: false });
      appointmentsStore.createIndex('created_at', 'created_at', { unique: false });
  
      const categoriesStore = db.createObjectStore('ServiceCategories', { keyPath: 'category_id' });
      categoriesStore.createIndex('name', 'name', { unique: false });
    };
}

// Wywołaj funkcję inicjalizującą bazę danych po załadowaniu strony
window.addEventListener('DOMContentLoaded', () => {
  const loadingIndicator = document.getElementById('loadingIndicator');
  loadingIndicator.style.display = 'block';

  initializeDatabase();
  const request = indexedDB.open('ServiceDB', 1);

  request.onerror = function(event) {
    console.error('Nie udało się otworzyć bazy danych:', event.target.error);
  };

  request.onsuccess = function(event) {
    console.log('Baza danych otwarta pomyślnie.');
    const db = event.target.result;

    const categoryStore = db.transaction(['ServiceCategories']).objectStore('ServiceCategories');

    categoryStore.getAll().onsuccess = function(event) {
      const categories = event.target.result;
      categories.forEach(category => {
        const categoryLink = document.createElement('a');
            categoryLink.href = `#${category.category_id}`;
            categoryLink.textContent = category.name;

            const lineDiv = document.createElement('div');
            lineDiv.classList.add('line');

            categoryLink.appendChild(lineDiv);
            const scrollMenu = document.querySelector('.scroll-menu');
            scrollMenu.appendChild(categoryLink);

        // Scroll to a section after clicking a link in the menu
        document.querySelectorAll('.scroll-menu a').forEach(link => {
          link.addEventListener('click', event => {
              event.preventDefault();
              const targetId = link.getAttribute('href').substring(1);
              const targetSection = document.getElementById(targetId);
              console.log(targetSection);
              if (targetSection) {
                  const targetPosition = targetSection.offsetTop - 150;
                  window.scrollTo({
                      top: targetPosition,
                      behavior: 'smooth'
                  });
              }
          });
        });

        generateServicesForCategory(db, category.category_id, category.name);
      });
    };
    loadingIndicator.style.display = 'none';
  };
});
function addCategoriesToDatabase(db) {
  // Pobranie obiektu sklepu kategorii z bazy danych
  const categoriesStore = db.transaction(['ServiceCategories'], 'readwrite').objectStore('ServiceCategories');

  const categories = [
      'Women\'s Hair Services',
      'Men\'s Grooming Services',
      'Beard and Shaving Services',
      'Children\'s Haircuts',
      'Special Occasion Hairdos',
      'Permanent Waves and Curls'
  ];

  categories.forEach((category, index) => {
      const prefix = category.split(' ').map(word => word[0]).join(''); // Generowanie prefiksu na podstawie pierwszych liter słów w nazwie
      const categoryData = { category_id: prefix, name: category};
      const request = categoriesStore.add(categoryData);
      request.onsuccess = function() {
          console.log(`Dodano kategorię: ${category}`);
      };
      request.onerror = function() {
          console.error(`Błąd podczas dodawania kategorii: ${category}`);
      };
  });
}

const servicesData = [
  {
      name: "Cutting medium and long hair",
      duration: "45 min - 1 hr",
      min_price: 70,
      max_price: 120,
      description: "Looking for a stylish update? Our experts will sculpt your medium or long locks into a fresh new look tailored just for you.",
      categoryId: "WHS"
  },
  {
      name: "Cutting short hair",
      duration: "30 min - 45 min",
      min_price: 60,
      max_price: 60,
      description: "Short hair, don't care! Our skilled stylists will craft a precise and chic cut that perfectly suits your style and personality.",
      categoryId: "WHS"
  },
  {
      name: "Coloring",
      duration: "1 hr - 2 hr",
      min_price: 220,
      max_price: null,
      description: "Ready for a vibrant change? Let our color specialists transform your locks with a stunning hue that complements your skin tone and personal style.",
      categoryId: "WHS"
  },
  {
      name: "Color toning",
      duration: "45 min - 1 hr",
      min_price: 110,
      max_price: null,
      description: "Enhance your natural color with subtle toning that adds depth and dimension to your locks, leaving you with a radiant and polished look.",
      categoryId: "WHS"
  },
  {
      name: "Dyeing roots",
      duration: "1 hr - 1 hr 30 min",
      min_price: 160,
      max_price: null,
      description: "Say goodbye to pesky roots! Our expert colorists will seamlessly blend your roots with your existing color for a flawless and refreshed appearance.",
      categoryId: "WHS"
  },
  {
      name: "Men's haircut for medium and long hair",
      duration: "30 min - 1 hr",
      min_price: 60,
      max_price: 70,
      description: "From classic cuts to modern styles, our skilled barbers will deliver a tailored haircut that suits your lifestyle and reflects your unique personality.",
      categoryId: "MGS"
  },
  {
      name: "Men's haircut for short hair",
      duration: "20 min - 30 min",
      min_price: 50,
      max_price: null,
      description: "Keep it sharp and stylish with a precision haircut designed to enhance your features and elevate your look.",
      categoryId: "MGS"
  },
  {
      name: "Avant-garde men's haircut",
      duration: "45 min - 1 hr",
      min_price: 60,
      max_price: 80,
      description: "Ready to make a statement? Let our innovative stylists create a cutting-edge haircut that pushes boundaries and showcases your individuality.",
      categoryId: "MGS"
  },
  {
      name: "Men's highlights",
      duration: "1 hr - 2 hr",
      min_price: 100,
      max_price: null,
      description: "Add dimension and depth to your hair with subtle highlights that create a natural and sun-kissed effect, perfect for the modern gentleman.",
      categoryId: "MGS"
  },
  {
    name: "Coloring",
    duration: "1 hr - 1 hr 30 min",
    min_price: 180,
    max_price: 200,
    description: "Whether you're covering gray or craving a new look, our expert colorists will customize a color treatment that enhances your style and complements your skin tone.",
    categoryId: "MGS"
  },
  {
      name: "Concealing gray on the beard",
      duration: "30 min - 45 min",
      min_price: 65,
      max_price: null,
      description: "Say goodbye to gray with our beard coloring service, expertly applied to seamlessly blend away any signs of aging for a youthful and polished appearance.",
      categoryId: "BaSS"
  },
  {
      name: "Mustache adjustment",
      duration: "15 min - 30 min",
      min_price: 30,
      max_price: null,
      description: "Keep your mustache looking sharp and defined with our precision grooming service, ensuring every strand is perfectly trimmed and shaped.",
      categoryId: "BaSS"
  },
  {
      name: "Beard contouring",
      duration: "30 min - 45 min",
      min_price: 50,
      max_price: null,
      description: "Define your jawline and enhance your facial features with our beard contouring service, tailored to sculpt and shape your beard for a refined and masculine look.",
      categoryId: "BaSS"
  },
  {
      name: "Full beard shave with a razor",
      duration: "30 min - 45 min",
      min_price: 50,
      max_price: null,
      description: "Experience the ultimate grooming luxury with our traditional razor shave, expertly executed to provide a smooth and close shave for a dapper and sophisticated appearance.",
      categoryId: "BaSS"
  },
  {
      name: "Beard cutting with scissors and razor",
      duration: "45 min - 1 hr",
      min_price: 80,
      max_price: null,
      description: "Achieve a tailored and polished beard with our precise cutting and shaping service, combining scissors and razor techniques for a flawless finish.",
      categoryId: "BaSS"
  },
  {
      name: "Boys' haircut",
      duration: "20 min - 30 min",
      min_price: 35,
      max_price: null,
      description: "Keep your little man looking sharp with our boys' haircut service, delivered with care and patience to ensure a comfortable and enjoyable experience.",
      categoryId: "CH"
  },
  {
      name: "Girls' haircut",
      duration: "30 min - 45 min",
      min_price: 40,
      max_price: null,
      description: "Treat your little princess to a stylish and adorable haircut that reflects her personality and individuality, leaving her feeling confident and fabulous.",
      categoryId: "CH"
  },
  {
      name: "Cutting bangs",
      duration: "15 min - 30 min",
      min_price: 20,
      max_price: null,
      description: "Keep those bangs looking neat and tidy with our expert cutting service, ensuring they frame the face perfectly and enhance your child's natural beauty.",
      categoryId: "CH"
  },
  {
      name: "Updo",
      duration: "1 hr - 2 hr",
      min_price: 100,
      max_price: 300,
      description: "Elevate your look for that special occasion with an elegant updo, expertly crafted to complement your outfit and leave you feeling glamorous and confident.",
      categoryId: "SOH"
  },
  {
      name: "Test updo",
      duration: "1 hr - 2 hr",
      min_price: 150,
      max_price: 300,
      description: "Perfect your look with a test updo session, allowing our skilled stylists to experiment with different styles and techniques until we find the perfect one for you.",
      categoryId: "SOH"
  },
  {
      name: "Wedding updo",
      duration: "1 hr - 2 hr",
      min_price: 150,
      max_price: 300,
      description: "Look picture-perfect on your special day with a romantic and timeless wedding updo, customized to complement your bridal gown and overall wedding theme.",
      categoryId: "SOH"
  },
  {
      name: "Hair thickening – 100 highlights",
      duration: "2 hr - 3 hr",
      min_price: 1000,
      max_price: null,
      description: "Add volume and dimension to your hair with our hair thickening service, featuring 100 highlights strategically placed to create the illusion of thicker and fuller locks.",
      categoryId: "SOH"
  },
  {
      name: "Keratin hair straightening",
      duration: "2 hr - 4 hr",
      min_price: 400,
      max_price: null,
      description: "Say goodbye to frizz and hello to sleek, smooth hair with our keratin hair straightening treatment, designed to transform unruly locks into silky and manageable strands.",
      categoryId: "SOH"
  },
  {
      name: "Permanent wave for long hair",
      duration: "2 hr - 3 hr",
      min_price: 170,
      max_price: null,
      description: "Add texture and movement to your long locks with our permanent wave service, creating soft and natural-looking curls that enhance your overall style.",
      categoryId: "PWaC"
  },
  {
      name: "Permanent wave for medium hair",
      duration: "1 hr 30 min - 2 hr",
      min_price: 150,
      max_price: null,
      description: "Embrace effortless waves with our permanent wave treatment for medium-length hair, delivering relaxed and tousled curls that exude casual elegance.",
      categoryId: "PWaC"
  },
  {
      name: "Permanent wave for short hair",
      duration: "1 hr - 1 hr 30 min",
      min_price: 120,
      max_price: null,
      description: "Enhance your short hairstyle with our permanent wave service, adding volume and texture for a playful and dynamic look that suits your personality.",
      categoryId: "PWaC"
  },
  {
      name: "Men's permanent wave",
      duration: "1 hr - 1 hr 30 min",
      min_price: 120,
      max_price: null,
      description: "Elevate your style with our men's permanent wave treatment, delivering subtle waves and texture for a relaxed and effortlessly cool vibe that lasts.",
      categoryId: "PWaC"
  }
];
function addServicesToDatabase(db) {
  const servicesStore = db.transaction(['Services'], 'readwrite').objectStore('Services');

  servicesData.forEach(service => {
    const categoryId = service.categoryId;
    const servicePrefix = service.name.split(' ').map(word => word[0]).join('');
    const serviceId = categoryId + servicePrefix;

    const serviceData = { ...service, service_id: serviceId };

    const addRequest = servicesStore.add(serviceData);
    
    addRequest.onsuccess = function() {
      console.log(`Dodano usługę: ${service.name}`);
    };
    
    addRequest.onerror = function() {
      console.error(`Błąd podczas dodawania usługi: ${service.name}`);
    };
  });
}
const employees = [
  { 
    first_name: 'John', 
    last_name: 'Doe', 
    service_ids: ['WHSCmalh', 'SMMCohh', 'CMChc', 'PWaC', 'ECaC'], 
    price: 120, 
    working_hours: '8:00 - 17:00' 
  },
  { 
    first_name: 'Jane', 
    last_name: 'Smith', 
    service_ids: ['WHSCmalh', 'SMMCohh', 'CMChc', 'PWaC', 'ECaC'], 
    price: 110, 
    working_hours: '9:00 - 18:00' 
  },
  { 
    first_name: 'Michael', 
    last_name: 'Johnson', 
    service_ids: ['WHSCmalh', 'SMMCohh', 'CMChc', 'PWaC', 'ECaC'], 
    price: 115, 
    working_hours: '7:00 - 16:00' 
  },
  { 
    first_name: 'Emily', 
    last_name: 'Brown', 
    service_ids: ['WHSCmalh', 'SMMCohh', 'CMChc', 'PWaC', 'ECaC'], 
    price: 100, 
    working_hours: '10:00 - 19:00' 
  },
  { 
    first_name: 'Daniel', 
    last_name: 'Davis', 
    service_ids: ['WHSCmalh', 'SMMCohh', 'CMChc', 'PWaC', 'ECaC'], 
    price: 105, 
    working_hours: '8:30 - 17:30' 
  },
  { 
    first_name: 'Olivia', 
    last_name: 'Martinez', 
    service_ids: ['WHSCmalh', 'SMMCohh', 'CMChc', 'PWaC', 'ECaC'], 
    price: 95, 
    working_hours: '9:30 - 18:30' 
  },
  { 
    first_name: 'James', 
    last_name: 'Garcia', 
    service_ids: ['WHSCmalh', 'SMMCohh', 'CMChc', 'PWaC', 'ECaC'], 
    price: 130, 
    working_hours: '7:30 - 16:30' 
  },
  { 
    first_name: 'Sophia', 
    last_name: 'Wilson', 
    service_ids: ['WHSCmalh', 'SMMCohh', 'CMChc', 'PWaC', 'ECaC'], 
    price: 125, 
    working_hours: '8:00 - 17:00' 
  },
  { 
    first_name: 'William', 
    last_name: 'Anderson', 
    service_ids: ['WHSCmalh', 'SMMCohh', 'CMChc', 'PWaC', 'ECaC'], 
    price: 135, 
    working_hours: '9:00 - 18:00' 
  },
  { 
    first_name: 'Isabella', 
    last_name: 'Taylor', 
    service_ids: ['WHSCmalh', 'SMMCohh', 'CMChc', 'PWaC', 'ECaC'], 
    price: 140, 
    working_hours: '8:30 - 17:30' 
  }
];
function addEmployeesToDatabase(db) {
  const employeesStore = db.transaction(['Employees'], 'readwrite').objectStore('Employees');
  
  employees.forEach(employee => {
    const addRequest = employeesStore.add(employee);

    addRequest.onsuccess = function() {
      console.log(`Dodano pracownika: ${employee.first_name} ${employee.last_name}`);
    };
    
    addRequest.onerror = function() {
      console.error(`Błąd podczas dodawania pracownika: ${employee.first_name} ${employee.last_name}`);
    };
  });
}
function generateServicesForCategory(db, categoryId) {
  const categoryDiv = document.querySelector('.service-section');

  if (!categoryDiv) {
    categoryDiv = document.createElement('div');
    categoryDiv.classList.add('service-section');
    document.body.appendChild(categoryDiv);
  }

  getCategoryNameById(db, categoryId, function(categoryName) {
    const serviceCategoryDiv = document.createElement('div');
    serviceCategoryDiv.classList.add('service-category');
    serviceCategoryDiv.id = categoryId;

    // Utwórz nagłówek dla kategorii
    const categoryTitle = document.createElement('h1');
    categoryTitle.classList.add('service-category-title');
    categoryTitle.textContent = categoryName;

    // Dodaj nagłówek do diva service-category
    serviceCategoryDiv.appendChild(categoryTitle);

    // Utwórz div service-category-row
    const categoryRow = document.createElement('div');
    categoryRow.classList.add('service-category-row');

    const servicesStore = db.transaction(['Services']).objectStore('Services');

    servicesStore.index('categoryId').getAll(categoryId).onsuccess = function(event) {
      const services = event.target.result;
      let currentRow;

      services.forEach((service, index) => {
        // Tworzenie nowego wiersza co dwie usługi lub w przypadku pierwszej usługi
        if (index % 2 === 0 || index === 0) {
          currentRow = document.createElement('div');
          currentRow.classList.add('service-category-row');
          categoryDiv.appendChild(currentRow);
        }

        const serviceOption = document.createElement('div');
        serviceOption.classList.add('service-option');

        const serviceName = document.createElement('h4');
        serviceName.textContent = service.name;

        const serviceDuration = document.createElement('p');
        serviceDuration.textContent = `${service.duration} • ${service.min_price} PLN - ${service.max_price ? service.max_price + ' PLN' : 'from ' + service.min_price + ' PLN'}`;

        const serviceDescription = document.createElement('p');
        serviceDescription.textContent = service.description;

        const bookLink = document.createElement('a');
        bookLink.href = `book-service.html?service=${service.service_id}`;
        bookLink.classList.add('service-book-btn');
        bookLink.textContent = 'Book';

        // Dodanie elementów do diva usługi
        serviceOption.appendChild(serviceName);
        serviceOption.appendChild(serviceDuration);
        serviceOption.appendChild(serviceDescription);
        serviceOption.appendChild(bookLink);

        // Dodanie diva usługi do wiersza kategorii
        currentRow.appendChild(serviceOption);
        serviceCategoryDiv.appendChild(currentRow);
      });
    };

    categoryDiv.appendChild(serviceCategoryDiv);
  });
}
function getCategoryNameById(db, categoryId, callback) {
  const categoryStore = db.transaction(['ServiceCategories']).objectStore('ServiceCategories');
  
  // Użyj identyfikatora kategorii jako klucza w funkcji get
  const request = categoryStore.get(categoryId);

  request.onsuccess = function(event) {
    // Pobierz nazwę kategorii z wyniku zapytania
    const category = event.target.result;
    if (category) {
      callback(category.name);
    } else {
      console.error('Nie znaleziono kategorii o podanym identyfikatorze');
    }
  };

  request.onerror = function(event) {
    console.error('Błąd podczas pobierania nazwy kategorii:', event.target.error);
  };
}
