document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
        const sc = window.scrollY > 50;
        header.style.padding = sc ? "0.5rem 0" : "1rem 0";
        header.classList.toggle("scrolled", sc);
    });

    const navToggle = document.getElementById("navToggle");
    const mainnav = document.getElementById("mainnav");
    if (navToggle && mainnav) {
        navToggle.addEventListener("click", () => {
            const open = mainnav.classList.toggle("open");
            navToggle.classList.toggle("open", open);
            navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
        mainnav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
            mainnav.classList.remove("open"); navToggle.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
        }));
    }

    document.querySelectorAll("a[href^=\"#\"]").forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            if (href.length < 2) return;
            const target = document.querySelector(href);
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); }
        });
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll(".product-card, .section-title, .benefit-item, .why-item, .delivery-feature, .guarantee-card, .material-chip").forEach(el => revealObserver.observe(el));

    // Fichas tecnicas (modal)
    const specData = {
        vigueta: { tag: "P-15 y P-20", title: "Semivigueta de Alma Abierta", wa: "https://wa.me/524424253643?text=Hola,%20cotizacion%20semivigueta%20de%20alma%20abierta", rows: [
            ["Peraltes disponibles","P-15 (15 cm) y P-20 (20 cm)"],
            ["Armadura P-15","14/64 — varilla 1/4\" Gr. 60"],
            ["Armadura P-20","19/64 — varilla 1/4\" Gr. 60"],
            ["Refuerzo diagonal","Calibre #8, Grado 50"],
            ["Concreto del patín","f'c = 250 kg/cm²"],
            ["Carga útil","310 kg/m²"],
            ["Peso propio P-15","220 kg/m²"],
            ["Peso propio P-20","240 kg/m²"],
            ["Claro máx. P-15","4.80 m"],
            ["Claro máx. P-20","5.40 m"]
        ] },
        bovedilla: { tag: "Concreto y EPS", title: "Bovedilla", wa: "https://wa.me/524424253643?text=Hola,%20cotizacion%20bovedilla", rows: [["Concreto (medidas)","75x25x15 y 70x20x20 cm"],["Poliestireno","1.22 x 0.63 m"],["Peraltes en EPS","15, 20 y 25 cm"],["Funcion","Pieza aligerante de relleno"],["Ventaja EPS","Mayor aislamiento y menor peso"]] },
        caseton: { tag: "Losa Nervada", title: "Caseton de Poliestireno", wa: "https://wa.me/524424253643?text=Hola,%20cotizacion%20caseton", rows: [["Material","Poliestireno expandido (EPS)"],["Medida estandar","40 x 40 cm"],["Altura","Variable, a proyecto"],["Aplicacion","Losas nervadas 1 y 2 direcciones"],["Fabricacion","Piezas a la medida"],["Adicional","Tambien placas de poliestireno"]] }
    };
    const modal = document.getElementById("specModal");
    if (modal) {
        const mTag = document.getElementById("modalTag");
        const mTitle = document.getElementById("modalTitle");
        const mBody = document.getElementById("modalBody");
        const mCta = document.getElementById("modalCta");
        const openModal = key => {
            const d = specData[key]; if (!d) return;
            mTag.textContent = d.tag; mTitle.textContent = d.title; mCta.href = d.wa;
            mBody.innerHTML = d.rows.map(r => "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td></tr>").join("");
            modal.classList.add("open"); document.body.classList.add("modal-open");
        };
        const closeModal = () => { modal.classList.remove("open"); document.body.classList.remove("modal-open"); };
        document.querySelectorAll(".spec-btn").forEach(b => b.addEventListener("click", () => openModal(b.dataset.spec)));
        document.getElementById("modalClose").addEventListener("click", closeModal);
        modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
        document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
    }

    // Calculadora de materiales (calibrada con datos reales de Prefabricados MP)
    window.calcularLosa = function() {
        const claro = parseFloat(document.getElementById("calc-claro").value);
        const largo = parseFloat(document.getElementById("calc-largo").value);
        const peralte = document.getElementById("calc-peralte").value;
        if (!claro || claro <= 0 || !largo || largo <= 0) {
            alert("Ingresa el claro y el largo de tu losa.");
            return;
        }
        const ESPACIADO = 0.80;
        const OVERHANG = 0.20;
        const numViguetas = Math.ceil(largo / ESPACIADO);
        const longVigueta = +(claro + OVERHANG).toFixed(2);
        const m2 = claro * largo;
        const bovedillas = Math.ceil(m2 * 6);
        const claroMax = peralte === "15" ? 4.80 : 5.40;
        const warnEl = document.getElementById("calcWarning");
        if (claro > claroMax) {
            warnEl.textContent = "⚠ El claro de " + claro + " m supera el máximo para P-" + peralte + " (" + claroMax + " m). Considera usar P-20 o consulta con tu proyectista.";
            warnEl.style.display = "block";
        } else {
            warnEl.style.display = "none";
        }
        document.getElementById("calcViguetaNum").textContent = numViguetas;
        document.getElementById("calcViguetaLen").textContent = "piezas de " + longVigueta + " m";
        document.getElementById("calcBovedillas").textContent = bovedillas;
        document.getElementById("calcResultado").classList.add("active");
        const msg = "Hola, necesito cotización:\n• Losa " + claro + " m × " + largo + " m (" + m2.toFixed(1) + " m²), peralte P-" + peralte + "\n• Estimado: " + numViguetas + " viguetas de " + longVigueta + " m y " + bovedillas + " bovedillas";
        document.getElementById("calcWA").href = "https://wa.me/524424253643?text=" + encodeURIComponent(msg);
    };

    const quoteForm = document.getElementById("quoteForm");
    if (quoteForm) {
        quoteForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const val = id => { const el = document.getElementById(id); return el ? el.value : ""; };
            const productos = Array.from(document.querySelectorAll("input[name=producto]:checked")).map(c => c.value);
            if (productos.length === 0) { alert("Selecciona al menos un producto: Vigueta, Bovedilla o Caseton."); return; }
            const tipo = val("bovedillaType"), peralte = val("peralte"), area = val("constructionArea");
            const claro = val("clearSpan"), proyecto = val("projectType"), cuando = val("timeline");
            const dir = val("deliveryAddress"), nombre = val("contactName"), tel = val("contactPhone");
            const msg = "*SOLICITUD DE COTIZACION*\n\n"
                + "Productos: " + productos.join(", ") + "\n"
                + (tipo ? "Pieza aligerante: " + tipo + "\n" : "")
                + (peralte ? "Peralte: " + peralte + "\n" : "")
                + "Area de losa: " + area + " m2\n"
                + (claro ? "Claro: " + claro + " m\n" : "")
                + "Proyecto: " + proyecto + "\n" + "Cuando: " + cuando + "\n"
                + "Entrega: " + dir + "\n\n" + "Nombre: " + nombre + "\n" + "Tel: " + tel;
            window.open("https://wa.me/524424253643?text=" + encodeURIComponent(msg), "_blank");
            quoteForm.reset();
        });
    }
});