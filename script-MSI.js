document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
        header.style.padding = window.scrollY > 50 ? "0.5rem 0" : "1rem 0";
    });

    document.querySelectorAll("a[href^=\"#\"]").forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
    }, observerOptions);
    document.querySelectorAll(".product-card, .section-title, .benefit-item, .why-item, .delivery-feature, .guarantee-card, .spec-card").forEach(el => revealObserver.observe(el));

    const quoteForm = document.getElementById("quoteForm");
    if (quoteForm) {
        quoteForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const productos = Array.from(document.querySelectorAll("input[name=producto]:checked")).map(c => c.value);
            if (productos.length === 0) { alert("Selecciona al menos un producto (Vigueta, Bovedilla o Caseton)."); return; }
            const tipo = document.getElementById("bovedillaType").value;
            const peralte = document.getElementById("peralte").value;
            const area = document.getElementById("constructionArea").value;
            const claro = document.getElementById("clearSpan").value;
            const proyecto = document.getElementById("projectType").value;
            const cuando = document.getElementById("timeline").value;
            const dir = document.getElementById("deliveryAddress").value;
            const nombre = document.getElementById("contactName").value;
            const tel = document.getElementById("contactPhone").value;

            const msg = "*SOLICITUD DE COTIZACION*\n\n"
                + "Productos: " + productos.join(", ") + "\n"
                + (tipo ? "Pieza aligerante: " + tipo + "\n" : "")
                + (peralte ? "Peralte: " + peralte + "\n" : "")
                + "Area de losa: " + area + " m2\n"
                + (claro ? "Claro: " + claro + " m\n" : "")
                + "Proyecto: " + proyecto + "\n"
                + "Cuando: " + cuando + "\n"
                + "Entrega: " + dir + "\n\n"
                + "Nombre: " + nombre + "\n"
                + "Tel: " + tel;

            window.open("https://wa.me/524424253643?text=" + encodeURIComponent(msg), "_blank");
            quoteForm.reset();
        });
    }
});
