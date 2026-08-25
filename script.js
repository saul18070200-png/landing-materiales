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
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    document.querySelectorAll(".product-card, .section-title, .why-item, .guarantee-card, .material-chip").forEach(el => {
        el.classList.add("reveal-init");
        revealObserver.observe(el);
    });

    // Fichas tecnicas (modal)
    const specData = {
        vigueta: {
            tag: "Ficha Técnica",
            title: "Semivigueta de Alma Abierta",
            pdf: "assets/docs/ficha-tecnica-vigueta.pdf",
            wa: "https://wa.me/524428201102?text=Hola,%20cotizacion%20semivigueta%20de%20alma%20abierta",
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
                        <div class="modal-col-row"><span>Peso del sistema</span>220 kg/m²</div>
                    </div>
                    <div class="modal-compare-col">
                        <div class="modal-col-head p20">P-20 · 20 cm</div>
                        <div class="modal-col-row"><span>Armadura</span>19/64</div>
                        <div class="modal-col-row"><span>Varilla sup.</span>1/4" Gr. 60</div>
                        <div class="modal-col-row"><span>Diagonal</span>Cal. #8 Gr. 50</div>
                        <div class="modal-col-row"><span>Peso del sistema</span>240 kg/m²</div>
                    </div>
                </div>
                <div class="modal-spec-row"><span>Peso de la semivigueta</span><strong>15 kg por metro lineal</strong></div>
                <div class="modal-note-row">El peso del sistema (220-240 kg/m²) es el de la losa terminada: vigueta, bovedilla y capa de compresión.</div>
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
            pdf: "assets/docs/ficha-tecnica-bovedilla.pdf",
            wa: "https://wa.me/524428201102?text=Hola,%20cotizacion%20bovedilla",
            html: `
                <div class="modal-section-label">Bovedilla de Concreto</div>
                <div class="modal-spec-row"><span>Medidas (L × A × H)</span><strong>75 × 25 × 15 cm</strong></div>
                <div class="modal-spec-row"><span>Medidas alternativa</span><strong>70 × 20 × 20 cm</strong></div>
                <div class="modal-spec-row"><span>Peraltes</span><strong>15 y 20 cm, según la medida</strong></div>
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
            pdf: "assets/docs/ficha-tecnica-caseton.pdf",
            wa: "https://wa.me/524428201102?text=Hola,%20cotizacion%20caseton",
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
        const mPdf = document.getElementById("modalPdf");
        const openModal = key => {
            const d = specData[key]; if (!d) return;
            mTag.textContent = d.tag; mTitle.textContent = d.title; mCta.href = d.wa;
            if (mPdf) { if (d.pdf) { mPdf.href = d.pdf; mPdf.style.display = ""; } else { mPdf.style.display = "none"; } }
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
    // Ancho = dimension de la pieza en la direccion del claro (a lo largo de la vigueta)
    const BOVEDILLAS = {
        c75: { nombre: "concreto 75×25×15 cm", ancho: 0.25 },
        c70: { nombre: "concreto 70×20×20 cm", ancho: 0.20 },
        eps: { nombre: "poliestireno 1.22×0.63 m", ancho: 1.22 }
    };
    window.calcularLosa = function() {
        const claro = parseFloat(document.getElementById("calc-claro").value);
        const ancho = parseFloat(document.getElementById("calc-largo").value);
        const peralte = document.getElementById("calc-peralte").value;
        const tipoBov = document.getElementById("calc-bovedilla").value;
        const errEl = document.getElementById("calcError");
        const resEl = document.getElementById("calcResultado");
        const fallo = function(html) {
            errEl.innerHTML = html;
            errEl.style.display = "block";
            resEl.classList.remove("active");
        };
        if (!claro || claro <= 0 || !ancho || ancho <= 0) {
            return fallo("⚠ Ingresa el claro y el ancho de tu losa para calcular.");
        }
        if (claro > 12 || ancho > 60) {
            return fallo("⚠ Revisa las medidas: parece que van en centímetros. Ingrésalas en metros.");
        }
        const claroMax = peralte === "15" ? 4.80 : 5.40;
        if (claro > claroMax) {
            const aviso = "Hola, tengo una losa con claro de " + claro + " m y ancho de " + ancho + " m. Rebasa el claro de P-" + peralte + " y necesito asesoría.";
            return fallo("⚠ Un claro de " + claro + " m rebasa el máximo de P-" + peralte + " (" + claroMax + " m). Esa losa necesita revisión estructural, por eso no estimamos piezas. " +
                "<a href=\"https://wa.me/524428201102?text=" + encodeURIComponent(aviso) + "\" target=\"_blank\" rel=\"noopener\">Escríbele a Isaac por WhatsApp</a>");
        }
        errEl.style.display = "none";
        document.getElementById("calcWarning").style.display = "none";

        const ESPACIADO = 0.80;
        const OVERHANG = 0.20;
        // La vigueta se apoya en los dos extremos: n tramos necesitan n+1 piezas
        const numViguetas = Math.ceil(ancho / ESPACIADO) + 1;
        const longVigueta = +(claro + OVERHANG).toFixed(2);
        const m2 = claro * ancho;
        // Bovedillas por hilera segun la medida elegida, no por area
        const bov = BOVEDILLAS[tipoBov] || BOVEDILLAS.c75;
        const hileras = numViguetas - 1;
        const bovedillas = hileras * Math.ceil(claro / bov.ancho);

        document.getElementById("calcViguetaNum").textContent = numViguetas;
        document.getElementById("calcViguetaLen").textContent = "piezas de " + longVigueta + " m";
        document.getElementById("calcBovedillas").textContent = bovedillas;
        document.getElementById("calcBovedillaTipo").textContent = "piezas de " + bov.nombre;
        resEl.classList.add("active");
        const msg = "Hola, necesito cotización:\n• Losa: claro " + claro + " m × ancho " + ancho + " m (" + m2.toFixed(1) + " m²)\n• Vigueta P-" + peralte + " con bovedilla de " + bov.nombre + "\n• Estimado: " + numViguetas + " viguetas de " + longVigueta + " m y " + bovedillas + " bovedillas";
        document.getElementById("calcWA").href = "https://wa.me/524428201102?text=" + encodeURIComponent(msg);
    };

});