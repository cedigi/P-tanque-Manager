// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Video modal functionality
function openVideoModal(videoId) {
    const modal = document.getElementById('videoModal');
    modal.classList.add('active');
    
    // Here you would typically load the actual video
    // For now, we'll just show the placeholder
    console.log('Opening video:', videoId);
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    modal.classList.remove('active');
}

// Purchase version functionality
function purchaseVersion(versionType) {
    const versionPrices = {
        'tete-a-tete': '29€',
        'doublette': '29€',
        'triplette': '29€',
        'melee': '39€',
        'complet': '49€'
    };
    
    const versionNames = {
        'tete-a-tete': 'Pétanque Manager Tête-à-Tête',
        'doublette': 'Pétanque Manager Doublette',
        'triplette': 'Pétanque Manager Triplette',
        'melee': 'Pétanque Manager Mêlée',
        'complet': 'Pétanque Manager Complet'
    };
    
    alert(`Vous avez sélectionné ${versionNames[versionType]} (${versionPrices[versionType]}). Redirection vers le système de paiement...`);
    // Here you would redirect to your payment processor
    // window.location.href = `https://your-payment-processor.com/checkout?product=${versionType}`;
}

// Purchase license functionality
function purchaseLicense(licenseType) {
    // This would typically integrate with a payment processor
    // For now, we'll show an alert
    const prices = {
        individual: '29-49€',
        club: '99€',
        federation: '199€'
    };
    
    const licenseNames = {
        individual: 'Licence Individuelle',
        club: 'Licence Club',
        federation: 'Licence Fédération'
    };
    
    if (licenseType === 'federation') {
        alert('Merci de votre intérêt pour la Licence Fédération. Notre équipe commerciale vous contactera sous 24h pour discuter de vos besoins spécifiques.');
        scrollToSection('contact');
    } else if (licenseType === 'individual') {
        scrollToSection('versions');
    } else {
        alert(`Vous avez sélectionné la ${licenseNames[licenseType]} (${prices[licenseType]}). Redirection vers le système de paiement...`);
        // Here you would redirect to your payment processor
        // window.location.href = `https://your-payment-processor.com/checkout?product=${licenseType}`;
    }
}

// Contact form submission
function submitContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    // Here you would typically send the data to your server
    console.log('Contact form submitted:', data);
    
    // Show success message
    alert('Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.');
    
    // Reset form
    event.target.reset();
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.15)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.1)';
    }
});

// Add click handlers for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all cards for animation
    const cards = document.querySelectorAll('.feature-card, .version-card, .demo-card, .testimonial-card, .pricing-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effect to version cards
    const versionCards = document.querySelectorAll('.version-card');
    versionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 20px 60px rgba(59, 130, 246, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });
    
    // Add hover effect to pricing cards
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 20px 60px rgba(59, 130, 246, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });
    
    // Add parallax effect to hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });
});

// Add floating animation to petanque balls
document.addEventListener('DOMContentLoaded', function() {
    const balls = document.querySelectorAll('.petanque-ball');
    balls.forEach((ball, index) => {
        // Add random delay to each ball
        ball.style.animationDelay = `${-Math.random() * 30}s`;
        
        // Add random size variation
        const size = 55 + Math.random() * 25;
        ball.style.width = `${size}px`;
        ball.style.height = `${size}px`;
    });
});

// Add click tracking for analytics (placeholder)
function trackEvent(category, action, label) {
    // This would integrate with your analytics service
    console.log('Event tracked:', { category, action, label });
    
    // Example: Google Analytics
    // gtag('event', action, {
    //     event_category: category,
    //     event_label: label
    // });
}

// Track button clicks
document.addEventListener('click', function(e) {
    if (e.target.matches('.cta-button, .primary-button')) {
        trackEvent('Button', 'Click', 'CTA');
    }
    
    if (e.target.matches('.version-button')) {
        trackEvent('Purchase', 'Click', e.target.closest('.version-card').querySelector('.version-title').textContent);
    }
    
    if (e.target.matches('.pricing-button')) {
        trackEvent('Purchase', 'Click', e.target.closest('.pricing-card').querySelector('.pricing-title').textContent);
    }
    
    if (e.target.matches('.feature-demo, .play-button')) {
        trackEvent('Video', 'Play', 'Demo');
    }
});

// Version comparison table interactivity
document.addEventListener('DOMContentLoaded', function() {
    const table = document.querySelector('.comparison-table table');
    if (table) {
        // Add hover effects to table rows
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });
    }
});

// Add smooth reveal animation for sections
function revealOnScroll() {
    const sections = document.querySelectorAll('section');
    const windowHeight = window.innerHeight;
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const revealPoint = 150;
        
        if (sectionTop < windowHeight - revealPoint) {
            section.classList.add('revealed');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

// Initialize reveal on page load
document.addEventListener('DOMContentLoaded', function() {
    revealOnScroll();
    
    // Add CSS for reveal animation
    const style = document.createElement('style');
    style.textContent = `
        section {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        section.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        .hero {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});

// Add dynamic pricing calculator (placeholder)
function calculateCustomPrice(features) {
    // This would calculate custom pricing based on selected features
    let basePrice = 29;
    
    if (features.includes('multi-format')) basePrice += 20;
    if (features.includes('unlimited-teams')) basePrice += 10;
    if (features.includes('cloud-sync')) basePrice += 15;
    if (features.includes('advanced-stats')) basePrice += 10;
    
    return basePrice;
}

// Add version recommendation system
function recommendVersion(userNeeds) {
    const recommendations = {
        'individual-simple': 'tete-a-tete',
        'individual-varied': 'complet',
        'club-small': 'doublette',
        'club-large': 'complet',
        'tournament-organizer': 'complet',
        'federation': 'complet'
    };
    
    return recommendations[userNeeds] || 'complet';
}

// Add feature comparison highlighting
document.addEventListener('DOMContentLoaded', function() {
    const versionCards = document.querySelectorAll('.version-card');
    
    versionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const versionType = this.querySelector('.version-title').textContent.toLowerCase();
            
            // Highlight corresponding column in comparison table
            const table = document.querySelector('.comparison-table table');
            if (table) {
                const headers = table.querySelectorAll('th');
                headers.forEach((header, index) => {
                    if (header.textContent.toLowerCase().includes(versionType.split(' ').pop())) {
                        header.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
                        
                        // Highlight corresponding column cells
                        const rows = table.querySelectorAll('tbody tr');
                        rows.forEach(row => {
                            const cell = row.children[index];
                            if (cell) {
                                cell.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                            }
                        });
                    }
                });
            }
        });
        
        card.addEventListener('mouseleave', function() {
            // Remove highlighting
            const table = document.querySelector('.comparison-table table');
            if (table) {
                const allCells = table.querySelectorAll('th, td');
                allCells.forEach(cell => {
                    cell.style.backgroundColor = '';
                });
            }
        });
    });
});