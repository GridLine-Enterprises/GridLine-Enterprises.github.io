// script.js - JavaScript for Gridline Digital website

document.addEventListener('DOMContentLoaded', function() {
    // Form handling
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // Simple form validation
            if (!data.name || !data.email || !data.message) {
                alert('Please fill in all required fields.');
                return;
            }

            // Here you would typically send the data to a server
            // For now, we'll just show a success message
            alert('Thank you for your message! We\'ll get back to you within 24 hours.');

            // Reset the form
            this.reset();
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Make "Learn More" buttons functional
    const learnMoreButtons = document.querySelectorAll('button');
    learnMoreButtons.forEach(button => {
        if (button.textContent.trim() === 'Learn More') {
            button.addEventListener('click', function() {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    });

    // Make "View All Services" button functional
    const viewAllServicesButton = document.querySelector('button');
    if (viewAllServicesButton && viewAllServicesButton.textContent.trim() === 'View All Services') {
        viewAllServicesButton.addEventListener('click', function() {
            const servicesSection = document.getElementById('services');
            if (servicesSection) {
                servicesSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu toggle (if needed in the future)
    // const mobileMenuButton = document.querySelector('.mobile-menu-button');
    // const mobileMenu = document.querySelector('.mobile-menu');
    // if (mobileMenuButton && mobileMenu) {
    //     mobileMenuButton.addEventListener('click', function() {
    //         mobileMenu.classList.toggle('hidden');
    //     });
    // }

    // Add any additional interactivity here
    console.log('Gridline Digital website loaded successfully!');
});