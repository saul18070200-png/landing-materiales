document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');

    // Header shadow effect on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '0.5rem 0';
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.padding = '1rem 0';
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Category filtering logic removed for landing page version

    // Unified Reveal Animation Observer
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Elements to observe
    const elementsToReveal = document.querySelectorAll('.product-card, .section-title, .benefit-item, .reveal-stagger, .delivery-feature, .comparison-table-wrapper');
    elementsToReveal.forEach(el => revealObserver.observe(el));


    // Professional Quote Form Handler
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Collect form data
            const formData = {
                projectType: document.getElementById('projectType').value,
                constructionArea: document.getElementById('constructionArea').value,
                timeline: document.getElementById('timeline').value,
                deliveryAddress: document.getElementById('deliveryAddress').value,
                materials: document.getElementById('materials').value,
                contactName: document.getElementById('contactName').value,
                contactPhone: document.getElementById('contactPhone').value,
                contactEmail: document.getElementById('contactEmail').value,
                contactMethod: document.getElementById('contactMethod').value
            };

            // Build WhatsApp message
            const message = `🏗️ *SOLICITUD DE COTIZACIÓN PROFESIONAL*

📋 *Datos del Proyecto:*
• Tipo: ${formData.projectType}
• Área: ${formData.constructionArea} m²
• Plazo: ${formData.timeline}
• Dirección de entrega: ${formData.deliveryAddress}

🔨 *Materiales Requeridos:*
${formData.materials}

👤 *Datos de Contacto:*
• Nombre: ${formData.contactName}
• Teléfono: ${formData.contactPhone}
• Email: ${formData.contactEmail || 'No proporcionado'}
• Método preferido: ${formData.contactMethod}`;

            // Encode and redirect to WhatsApp
            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/524424253643?text=${encodedMessage}`;
            window.open(whatsappURL, '_blank');

            // Optional: Reset form
            quoteForm.reset();
        });
    }

});
