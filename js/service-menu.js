// Support for scroll buttons
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.scroll-menu');
  const leftButton = document.getElementById('left-scroll-btn');
  const rightButton = document.getElementById('right-scroll-btn');

  leftButton.onclick = () => {
      menu.scrollLeft -= 150;
  };

  rightButton.onclick = () => {
      menu.scrollLeft += 150;
  };

  const checkScrollButtons = () => {
      leftButton.disabled = menu.scrollLeft <= 0;
      rightButton.disabled = menu.scrollLeft + menu.offsetWidth >= menu.scrollWidth;
  };

  menu.addEventListener('scroll', checkScrollButtons);
  window.addEventListener('load', checkScrollButtons);
});

// Update sub-header height
const subHeader = document.querySelector('.sub-header');
const menu = document.querySelector('.menu');
const scrollMenuWrapper = document.querySelector('.scroll-menu-wrapper');

const subHeaderHeight = subHeader.offsetHeight;
const menuOffsetTop = menu.offsetTop;

function updateSubHeaderHeight() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop >= menuOffsetTop - subHeaderHeight) {
      subHeader.style.height = `${subHeaderHeight + 40}px`;
      subHeader.appendChild(scrollMenuWrapper);
      
      subHeader.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
  } else {
      subHeader.style.height = `${subHeaderHeight}px`;

      if (scrollMenuWrapper.parentNode === subHeader) {
          subHeader.removeChild(scrollMenuWrapper);
          const h2 = menu.querySelector('h2');
          menu.insertBefore(scrollMenuWrapper, h2.nextSibling);
      }
      subHeader.style.boxShadow = '';
  }
}

window.addEventListener('load', updateSubHeaderHeight);
window.addEventListener('scroll', updateSubHeaderHeight);
window.addEventListener('scroll', navHighlighter);

// Highlight the current section in the menu
const sections = document.querySelectorAll('.section-service-menu');
function navHighlighter() {
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

// Scroll to a section after clicking a link in the menu
const scrollMenuLinks = document.querySelectorAll('.scroll-menu a');
scrollMenuLinks.forEach(link => {
  link.addEventListener('click', event => {
      event.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
          const targetPosition = targetSection.offsetTop - 150;
          window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
          });
      }
  });
});

