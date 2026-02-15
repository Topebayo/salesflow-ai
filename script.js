/* =============================================================================
   SALESFLOW AI - LANDING PAGE SCRIPTS
   ============================================================================= */

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// Animated counter
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 25);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Animate counters
            if (entry.target.classList.contains('hero-stats')) {
                entry.target.querySelectorAll('.stat-number').forEach(num => {
                    const target = parseInt(num.dataset.count);
                    animateCounter(num, target);
                });
            }
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.feature-card, .step-card, .pricing-card, .hero-stats').forEach(el => {
    observer.observe(el);
});

// Demo chat functionality
const demoInput = document.getElementById('demoInput');
const demoSend = document.getElementById('demoSend');
const demoMessages = document.getElementById('demoMessages');

const botResponses = [
    "Great question! 🎯 Our AI Sales Agent service starts at ₦75,000/month for the Starter plan, which includes up to 500 conversations. Would you like to know what's included?",
    "Absolutely! ✨ We train our AI specifically on YOUR business — your products, pricing, FAQs, and even your brand's tone of voice. It's like having a sales rep who knows everything about your business!",
    "We're currently in high demand! 🚀 Setup typically takes just 24 hours. We'll need your product info, pricing, and any FAQs. Want me to send you our quick onboarding form?",
    "That's a common concern! 💡 Our AI handles about 85% of conversations fully automatically. For complex queries, it can seamlessly hand off to your human team. The best of both worlds!",
    "Perfect timing! We're running a special this month — get 30% off your first 3 months when you sign up today. 🎉 Shall I set you up with a free demo first?",
    "Our clients typically see a 3x increase in response rates and 40% more conversions within the first month. 📊 The AI responds instantly, 24/7 — no lead goes cold!",
    "Yes! We support multiple WhatsApp Business numbers on our Enterprise plan. 💼 This is perfect for businesses with different product lines or regional offices.",
    "I'd love to help you get started! 🤝 Just fill out the contact form on this page, or you can reach us directly at hello@salesflowai.com. We'll have you up and running within 24 hours!"
];

let responseIndex = 0;

function addMessage(text, isBot) {
    const msg = document.createElement('div');
    msg.className = `demo-msg ${isBot ? 'bot' : 'user'}`;
    msg.innerHTML = `<p>${text}</p>`;
    demoMessages.appendChild(msg);
    demoMessages.scrollTop = demoMessages.scrollHeight;
}

function handleDemoSend() {
    const text = demoInput.value.trim();
    if (!text) return;

    addMessage(text, false);
    demoInput.value = '';

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'demo-msg bot';
    typing.innerHTML = '<p style="opacity: 0.5">Adaeze is typing...</p>';
    typing.id = 'typing';
    demoMessages.appendChild(typing);
    demoMessages.scrollTop = demoMessages.scrollHeight;

    // Respond after delay
    setTimeout(() => {
        const typingEl = document.getElementById('typing');
        if (typingEl) typingEl.remove();

        addMessage(botResponses[responseIndex % botResponses.length], true);
        responseIndex++;
    }, 1000 + Math.random() * 1000);
}

demoSend.addEventListener('click', handleDemoSend);
demoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleDemoSend();
});

// Contact form
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>✓ Thank you! We\'ll be in touch within 24 hours.</span>';
    btn.style.background = 'linear-gradient(135deg, #25D366, #1DA851)';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
        e.target.reset();
    }, 4000);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add scroll-triggered animations via CSS class
const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step-card, .pricing-card, .contact-wrapper').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    animateOnScroll.observe(el);
});

// Stagger animation for grid items
document.querySelectorAll('.features-grid .feature-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
});

document.querySelectorAll('.pricing-grid .pricing-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.15}s`;
});

console.log('⚡ SalesFlow AI - Landing Page Loaded');
