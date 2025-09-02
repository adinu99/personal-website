// ===== DOM ELEMENTS =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const scrollProgress = document.getElementById('scroll-progress');
const contactForm = document.getElementById('contact-form');
const skillBars = document.querySelectorAll('.skill-progress');

// ===== UTILITY FUNCTIONS =====
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// ===== NAVIGATION FUNCTIONALITY =====
class Navigation {
  constructor() {
    this.init();
  }

  init() {
    this.handleScroll();
    this.handleMobileMenu();
    this.handleSmoothScroll();
    this.handleActiveLinks();
  }

  handleScroll() {
    const handleScrollEvent = throttle(() => {
      const scrolled = window.pageYOffset > 50;
      navbar.classList.toggle('scrolled', scrolled);
      this.updateScrollProgress();
    }, 16);

    window.addEventListener('scroll', handleScrollEvent);
  }

  updateScrollProgress() {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    scrollProgress.style.width = `${scrollPercent}%`;
  }

  handleMobileMenu() {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  handleSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 70;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  handleActiveLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const updateActiveLink = throttle(() => {
      let currentSection = '';
      const scrollPosition = window.pageYOffset + 100;

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    }, 100);

    window.addEventListener('scroll', updateActiveLink);
  }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.animateSkillBars();
  }

  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible', 'animated');
        }
      });
    }, options);

    // Animate project cards
    document.querySelectorAll('.project-card').forEach(card => {
      observer.observe(card);
    });

    // Animate timeline items
    document.querySelectorAll('.timeline-item').forEach(item => {
      observer.observe(item);
    });
  }

  animateSkillBars() {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          skillBars.forEach((bar, index) => {
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
              bar.style.width = `${width}%`;
            }, index * 200);
          });
          skillsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const skillsSection = document.querySelector('.about');
    if (skillsSection) {
      skillsObserver.observe(skillsSection);
    }
  }
}

// ===== FORM VALIDATION =====
class FormValidator {
  constructor(form) {
    this.form = form;
    this.init();
  }

  init() {
    this.setupValidation();
    this.handleSubmit();
  }

  setupValidation() {
    const inputs = this.form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    this.clearError(field);

    if (!value) {
      isValid = false;
      errorMessage = `${this.getFieldLabel(fieldName)} wajib diisi`;
    }

    if (fieldName === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Format email tidak valid';
      }
    }

    if (!isValid) {
      this.showError(field, errorMessage);
    }

    return isValid;
  }

  showError(field, message) {
    const formGroup = field.parentElement;
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.add('error');
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  clearError(field) {
    const formGroup = field.parentElement;
    formGroup.classList.remove('error');
  }

  getFieldLabel(fieldName) {
    const labels = {
      name: 'Nama',
      email: 'Email',
      subject: 'Subjek',
      message: 'Pesan'
    };
    return labels[fieldName] || fieldName;
  }

  handleSubmit() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const inputs = this.form.querySelectorAll('input, textarea');
      let isValid = true;

      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isValid = false;
        }
      });

      if (isValid) {
        this.submitForm();
      }
    });
  }

  async submitForm() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.showSuccessMessage();
      this.form.reset();
    } finally {
      submitButton.classList.remove('loading');
      submitButton.disabled = false;
    }
  }

  showSuccessMessage() {
    const message = document.createElement('div');
    message.innerHTML = `
      <div style="
        background: #10b981; 
        color: white; 
        padding: 1rem 1.5rem; 
        border-radius: 0.5rem; 
        margin-bottom: 1rem;
        text-align: center;
      ">
        ✅ Pesan berhasil dikirim! Terima kasih.
      </div>
    `;
    
    this.form.insertBefore(message, this.form.firstChild);
    
    setTimeout(() => {
      message.remove();
    }, 5000);
  }
}

// ===== TYPING ANIMATION =====
class TypingAnimation {
  constructor(element, text) {
    this.element = element;
    this.text = text;
    this.currentText = '';
    this.currentIndex = 0;
    this.isDeleting = false;
    this.init();
  }

  init() {
    this.type();
  }

  type() {
    const fullText = this.text;
    
    if (this.isDeleting) {
      this.currentText = fullText.substring(0, this.currentText.length - 1);
    } else {
      this.currentText = fullText.substring(0, this.currentIndex + 1);
      this.currentIndex++;
    }

    this.element.textContent = this.currentText;

    let typeSpeed = 150;
    if (this.isDeleting) typeSpeed /= 2;

    if (!this.isDeleting && this.currentText === fullText) {
      typeSpeed = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentText === '') {
      this.isDeleting = false;
      this.currentIndex = 0;
      typeSpeed = 500;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  new Navigation();
  new ScrollAnimations();
  
  // Initialize form validation
  if (contactForm) {
    new FormValidator(contactForm);
  }
  
  // Initialize typing animation
  const typingElement = document.querySelector('.typing-text');
  if (typingElement) {
    const originalText = typingElement.textContent;
    new TypingAnimation(typingElement, originalText);
  }
  
  // Hero scroll indicator
  const scrollIndicator = document.querySelector('.hero-scroll');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  console.log('Portfolio website initialized! 🚀');
});

