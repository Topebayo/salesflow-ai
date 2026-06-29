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

const API_BASE = 'https://api.salesaiflow.online';
let chatHistory = [];

function addMessage(text, isBot) {
    const msg = document.createElement('div');
    msg.className = `demo-msg ${isBot ? 'bot' : 'user'}`;
    msg.innerHTML = `<p>${text}</p>`;
    demoMessages.appendChild(msg);
    demoMessages.scrollTop = demoMessages.scrollHeight;
}

async function handleDemoSend() {
    const text = demoInput.value.trim();
    if (!text) return;

    addMessage(text, false);
    demoInput.value = '';

    // Save user message to history
    chatHistory.push({ role: "user", content: text });
    if (chatHistory.length > 10) chatHistory.shift();

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'demo-msg bot';
    typing.innerHTML = '<p style="opacity: 0.5">SalesFlow AI is typing...</p>';
    typing.id = 'typing';
    demoMessages.appendChild(typing);
    demoMessages.scrollTop = demoMessages.scrollHeight;

    try {
        const response = await fetch(`${API_BASE}/demo/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: text,
                history: chatHistory.slice(0, -1) // Send preceding history
            })
        });

        const typingEl = document.getElementById('typing');
        if (typingEl) typingEl.remove();

        if (response.ok) {
            const data = await response.json();
            const reply = data.reply;
            addMessage(reply, true);
            chatHistory.push({ role: "assistant", content: reply });
        } else {
            addMessage("Thanks for your query! We build custom AI sales bots for WhatsApp. Fill out the contact form below and we'll get in touch with you within 24 hours!", true);
        }
    } catch (error) {
        console.error("Demo chat error:", error);
        const typingEl = document.getElementById('typing');
        if (typingEl) typingEl.remove();
        addMessage("Thanks for your query! We build custom AI sales bots for WhatsApp. Fill out the contact form below and we'll get in touch with you within 24 hours!", true);
    }
}

demoSend.addEventListener('click', handleDemoSend);
demoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleDemoSend();
});

// Contact form
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const business = document.getElementById('business').value;
    const message = document.getElementById('message').value;

    try {
        await fetch("https://formsubmit.co/ajax/topebayo113@gmail.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                Name: name,
                Email: email,
                "WhatsApp Number": phone,
                "Business Type": business,
                Message: message
            })
        });

        btn.innerHTML = '<span>✓ Thank you! We\'ll be in touch within 24 hours.</span>';
        btn.style.background = 'linear-gradient(135deg, #25D366, #1DA851)';
        e.target.reset();
    } catch (error) {
        console.error("Form submission error:", error);
        btn.innerHTML = '<span>Failed to send. Please try again.</span>';
        btn.style.background = '#ef4444';
    }

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
    }, 5000);
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

// ==================== LIGHT / DARK THEME TOGGLE ====================
function toggleTheme() {
    document.documentElement.classList.toggle('light-theme');
    document.body.classList.toggle('light-theme');
    const isLight = document.documentElement.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Sync body class with html class on load
(function() {
    if (document.documentElement.classList.contains('light-theme')) {
        document.body.classList.add('light-theme');
    }
})();

