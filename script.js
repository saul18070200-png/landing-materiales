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
        vigueta: {
            tag: "Ficha Técnica",
            title: "Semivigueta de Alma Abierta",
            wa: "https://wa.me/524424253643?text=Hola,%20cotizacion%20semivigueta%20de%20alma%20abierta",
            html: `
                <div class="modal-kpis">
                    <div class="modal-kpi"><span class="kpi-val">310</span><span class="kpi-unit">kg/m²</span><span class="kpi-label">Carga útil</span></div>
                    <div class="modal-kpi"><span class="kpi-val">4.80</span><span class="kpi-unit">m</span><span class="kpi-label">Claro P-15</span></div>
                    <div class="modal-kpi"><span class="kpi-val">5.40</span><span class="kpi-unit">m</span><span class="kpi-label">Claro P-20</span></div>
                </div>
                <div class="modal-section-label">Acero de refuerzo</div>
                <div class="modal-compare">
                    <div class="modal-compare-col">
                        <div class="modal-col-head p15">P-15 · 15 cm</div>
                        <div class="modal-col-row"><span>Armadura</span>14/64</div>
                        <div class="modal-col-row"><span>Varilla sup.</span>1/4" Gr. 60</div>
                        <div class="modal-col-row"><span>Diagonal</span>Cal. #8 Gr. 50</div>
                        <div class="modal-col-row"><span>Peso propio</span>220 kg/m²</div>
                    </div>
                    <div class="modal-compare-col">
                        <div class="modal-col-head p20">P-20 · 20 cm</div>
                        <div class="modal-col-row"><span>Armadura</span>19/64</div>
                        <div class="modal-col-row"><span>Varilla sup.</span>1/4" Gr. 60</div>
                        <div class="modal-col-row"><span>Diagonal</span>Cal. #8 Gr. 50</div>
                        <div class="modal-col-row"><span>Peso propio</span>240 kg/m²</div>
                    </div>
                </div>
                <div class="modal-section-label">Concreto</div>
                <div class="modal-spec-row"><span>Patín prefabricado</span><strong>f'c = 250 kg/cm²</strong></div>
                <div class="modal-spec-row"><span>Capa de compresión</span><strong>f'c = 200 kg/cm² (por constructor)</strong></div>
                <div class="modal-section-label">Instalación</div>
                <div class="modal-spec-row"><span>Separación entre puntales</span><strong>máx. 1.50 m</strong></div>
                <div class="modal-spec-row"><span>Largeros transversales P-15</span><strong>cada 1.30 m</strong></div>
                <div class="modal-spec-row"><span>Largeros transversales P-20</span><strong>cada 1.20 m</strong></div>
            `
        },
        bovedilla: {
            tag: "Ficha Técnica",
            title: "Bovedilla",
            wa: "https://wa.me/524424253643?text=Hola,%20cotizacion%20bovedilla",
            html: `
                <div class="modal-section-label">Bovedilla de Concreto</div>
                <div class="modal-spec-row"><span>Medidas (L × A × H)</span><strong>75 × 25 × 15 cm</strong></div>
                <div class="modal-spec-row"><span>Medidas alternativa</span><strong>70 × 20 × 20 cm</strong></div>
                <div class="modal-spec-row"><span>Peralte</span><strong>15 cm</strong></div>
                <div class="modal-section-label">Bovedilla de Poliestireno (EPS)</div>
                <div class="modal-spec-row"><span>Medidas</span><strong>1.22 × 0.63 m</strong></div>
                <div class="modal-spec-row"><span>Peraltes disponibles</span><strong>15, 20 y 25 cm</strong></div>
                <div class="modal-spec-row"><span>Ventaja</span><strong>Mayor aislamiento térmico y acústico</strong></div>
                <div class="modal-spec-row"><span>Peso</span><strong>Más ligera que concreto</strong></div>
            `
        },
        caseton: {
            tag: "Ficha Técnica",
            title: "Casetón de Poliestireno",
            wa: "https://wa.me/524424253643?text=Hola,%20cotizacion%20caseton",
            html: `
                <div class="modal-kpis" style="grid-template-columns:1fr 1fr;">
                    <div class="modal-kpi"><span class="kpi-val">40×40</span><span class="kpi-unit">cm</span><span class="kpi-label">Medida estándar</span></div>
                    <div class="modal-kpi"><span class="kpi-val">1–2</span><span class="kpi-unit">dir.</span><span class="kpi-label">Losas nervadas</span></div>
                </div>
                <div class="modal-section-label">Especificaciones</div>
                <div class="modal-spec-row"><span>Material</span><strong>Poliestireno expandido (EPS)</strong></div>
                <div class="modal-spec-row"><span>Medida estándar</span><strong>40 × 40 cm</strong></div>
                <div class="modal-spec-row"><span>Altura</span><strong>Variable, se fabrica a proyecto</strong></div>
                <div class="modal-spec-row"><span>Aplicación</span><strong>Losas nervadas 1 y 2 direcciones</strong></div>
                <div class="modal-spec-row"><span>Fabricación</span><strong>Piezas a la medida del proyecto</strong></div>
                <div class="modal-spec-row"><span>Adicional</span><strong>También placas de poliestireno</strong></div>
            `
        }
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
            mBody.innerHTML = d.html;
            modal.classList.add("open"); document.body.classList.add("modal-open");
            modal.setAttribute("aria-hidden", "false");
        };
        const closeModal = () => {
            modal.classList.remove("open"); document.body.classList.remove("modal-open");
            modal.setAttribute("aria-hidden", "true");
        };
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