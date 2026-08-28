/* Cotizador de losa - Prefabricados MP
   Filtra obra vs. menudeo antes de mandar el lead a WhatsApp, lo guarda en
   Firestore y reporta la conversion a Google Ads.

   Regla que manda sobre todo lo demas: el lead NUNCA se pierde. Si Firestore
   falla, si tarda, o si todavia no hay configuracion, WhatsApp se abre igual.
*/

/* ---------- Configuracion ---------- */

// El mismo numero que el resto del sitio. El brief traia 524424253643, que
// resulto ser errata: si algun dia se abre una linea aparte para los leads del
// formulario, se cambia aqui y en ningun otro lado.
const WHATSAPP = "524428201102";

// La etiqueta de conversion se define en el <head> de index.html, junto al resto
// de la configuracion de Google, para no tener el ID repartido en dos archivos.
// Mientras diga PENDIENTE no se dispara ninguna conversion.
const ADS_LABEL = window.ADS_CONVERSION || "AW-XXXXXXXXX/PENDIENTE";

// Firebase del proyecto `prefabricados-mp`: consola > Configuracion del proyecto
// > Tus apps > SDK y configuracion. Mientras apiKey diga PENDIENTE no se intenta
// escribir nada y el formulario sigue funcionando completo.
const FIREBASE = {
    apiKey: "AIzaSyBJqJ521HfEvDfsxf5i9qe1gfvLNTNmclM",
    authDomain: "prefabricados-mp.firebaseapp.com",
    projectId: "prefabricados-mp",
    storageBucket: "prefabricados-mp.firebasestorage.app",
    messagingSenderId: "220481346995",
    appId: "1:220481346995:web:5b7ba995133f18c6d2ffc6"
};

// Topes de espera. Mas vale un lead sin registrar que un cliente viendo una
// pantalla muerta con el pulgar en el boton.
const ESPERA_FIRESTORE = 3000;
const ESPERA_CONVERSION = 1200;
const DIAS_VIDA_GCLID = 90;

// Debe coincidir con la ventana de conversion configurada en Google Ads (paso 2
// de la guia). Si alla la cambias, cambiala aqui.
const DIAS_VENTANA_CONVERSION = 30;

// Claro maximo que cubre la vigueta P-20. Arriba de eso no rechazamos el lead,
// solo avisamos, igual que ya hace la calculadora del sitio.
const CLARO_MAX = 5.4;

const MUNICIPIOS = ["Querétaro", "El Marqués", "Corregidora", "San Juan del Río",
    "Tequisquiapan", "Pedro Escobedo", "Colón", "Huimilpan", "Amealco",
    "Ezequiel Montes", "Cadereyta", "Otro"];

const URGENCIAS = [
    { value: "esta_semana",    label: "Esta semana" },
    { value: "proxima_semana", label: "Próxima semana" },
    { value: "proximo_mes",    label: "Próximo mes" },
    { value: "solo_cotizando", label: "Solo estoy cotizando" }
];

// Urgencias que NO reportan conversion a Google. Al que solo anda cotizando se
// le atiende igual y se guarda igual, pero no debe entrenar al algoritmo: si
// cuenta como conversion, Google sale a buscar mas gente que solo pregunta.
const URGENCIAS_SIN_CONVERSION = ["solo_cotizando"];

const PERFILES = ["Constructora", "Arquitecto", "Contratista", "Particular"];

/* ---------- GCLID ---------- */

// Se captura desde el primer render aunque todavia no haya campana corriendo:
// Google solo conserva el gclid 90 dias y no hay forma de recuperarlo despues.
function capturarGclid() {
    const gclid = new URLSearchParams(location.search).get("gclid");
    if (!gclid) return;
    try {
        localStorage.setItem("gclid", gclid);
        localStorage.setItem("gclid_fecha", new Date().toISOString());
    } catch (e) {
        console.warn("[cotizador] No se pudo guardar el gclid:", e);
    }
}

// Dias desde que se guardo el gclid, o null si no hay ninguno.
function edadGclidDias() {
    try {
        if (!localStorage.getItem("gclid")) return null;
        const fecha = Date.parse(localStorage.getItem("gclid_fecha") || "");
        // Sin fecha legible lo tratamos como recien llegado, no como caducado.
        if (!fecha) return 0;
        return (Date.now() - fecha) / 86400000;
    } catch (e) {
        return null;
    }
}

function leerGclid() {
    // Un gclid mas viejo que la ventana de Google ya no sirve para importar
    // la conversion y solo ensuciaria el reporte.
    const edad = edadGclidDias();
    if (edad === null || edad > DIAS_VIDA_GCLID) return null;
    try {
        return localStorage.getItem("gclid");
    } catch (e) {
        return null;
    }
}

// Si el visitante llego por un anuncio y la ventana de conversion sigue abierta,
// vale la pena pedirle el formulario: ese clic ya se pago y sin formulario Google
// nunca se entera de que produjo un lead. Pasada la ventana la conversion ya no
// contaria, asi que cobrarle friccion no compraria nada.
function vieneDeAnuncio() {
    const edad = edadGclidDias();
    return edad !== null && edad <= DIAS_VENTANA_CONVERSION;
}

/* ---------- Folio ---------- */

function generarFolio() {
    // Sin I, O, 0 ni 1: este codigo se dicta por telefono y se teclea a mano.
    const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    let folio = "";
    for (const b of bytes) folio += ABC[b % ABC.length];
    return folio;
}

/* ---------- Firestore ---------- */

async function guardarLead(datos) {
    if (FIREBASE.apiKey === "PENDIENTE") {
        console.warn("[cotizador] Firebase sin configurar. Lead no guardado:", datos);
        return false;
    }
    // Import dinamico: si el CDN de Firebase no carga, el fallo queda encerrado
    // aqui adentro y no se lleva al formulario por delante.
    const cdn = "https://www.gstatic.com/firebasejs/10.12.5/";
    const [app, fs] = await Promise.all([
        import(cdn + "firebase-app.js"),
        import(cdn + "firebase-firestore.js")
    ]);
    const db = fs.getFirestore(app.initializeApp(FIREBASE));
    await fs.addDoc(fs.collection(db, "leads"), Object.assign({}, datos, {
        fecha: fs.serverTimestamp()
    }));
    return true;
}

/* ---------- Google Ads ---------- */

function reportarConversion(folio, urgencia) {
    return new Promise(resolve => {
        const cuenta = URGENCIAS_SIN_CONVERSION.indexOf(urgencia) === -1;
        if (!cuenta || typeof gtag !== "function" || ADS_LABEL.indexOf("PENDIENTE") > -1) {
            return resolve();
        }
        // event_callback + timeout: sin esto, la redireccion a WhatsApp cancela
        // el ping a medio camino y la conversion nunca llega a registrarse.
        let resuelto = false;
        const seguir = () => { if (!resuelto) { resuelto = true; resolve(); } };
        gtag("event", "conversion", {
            send_to: ADS_LABEL,
            transaction_id: folio,
            event_callback: seguir
        });
        setTimeout(seguir, ESPERA_CONVERSION);
    });
}

/* ---------- Utilidades ---------- */

function conTope(promesa, ms) {
    return Promise.race([
        promesa,
        new Promise(resolve => setTimeout(() => resolve("tope"), ms))
    ]);
}

function armarMensaje(datos, folio) {
    const urgencia = URGENCIAS.find(u => u.value === datos.urgencia);
    return "Hola, quiero cotizar losa.\n" +
        "Folio: " + folio + "\n" +
        "Metros: " + datos.metros + " m2\n" +
        "Claro: " + datos.claro + " m\n" +
        "Municipio: " + datos.municipio + "\n" +
        "Para: " + (urgencia ? urgencia.label : datos.urgencia) + "\n" +
        "Soy: " + datos.perfil;
}

function opciones(lista) {
    return lista.map(function (o) {
        return typeof o === "string"
            ? '<option value="' + o + '">' + o + '</option>'
            : '<option value="' + o.value + '">' + o.label + '</option>';
    }).join("");
}

/* ---------- Modal ---------- */

function construirModal() {
    const el = document.createElement("div");
    el.className = "modal-overlay";
    el.id = "leadModal";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
    '<div class="modal-box lead-box" role="dialog" aria-modal="true" aria-labelledby="leadTitle">' +
      '<div class="modal-header">' +
        '<div class="modal-header-top">' +
          '<span class="modal-tag">Cotizaci&oacute;n</span>' +
          '<button class="modal-close" id="leadClose" type="button" aria-label="Cerrar">&times;</button>' +
        '</div>' +
        '<h3 id="leadTitle">Cotiza tu losa</h3>' +
        '<span class="modal-company">Te contestamos por WhatsApp</span>' +
      '</div>' +
      '<div class="modal-body">' +
        '<form id="leadForm" novalidate>' +
          '<div class="lead-grid">' +
            '<div class="calc-field">' +
              '<label for="lead-metros">&iquest;Cu&aacute;ntos m&sup2; de losa?</label>' +
              '<input type="number" id="lead-metros" name="metros" min="1" step="1" inputmode="numeric" placeholder="Ej: 120" required>' +
              '<p class="lead-error" data-error="metros"></p>' +
            '</div>' +
            '<div class="calc-field">' +
              '<label for="lead-claro">&iquest;Cu&aacute;l es el claro?</label>' +
              '<input type="number" id="lead-claro" name="claro" min="0.5" step="0.1" inputmode="decimal" placeholder="Ej: 4.5" required>' +
              '<p class="lead-hint">Metros entre apoyos, de muro a muro.</p>' +
              '<p class="lead-error" data-error="claro"></p>' +
            '</div>' +
            '<div class="calc-field">' +
              '<label for="lead-municipio">Municipio de la obra</label>' +
              '<select id="lead-municipio" name="municipio" required>' +
                '<option value="">Selecciona...</option>' + opciones(MUNICIPIOS) +
              '</select>' +
              '<p class="lead-error" data-error="municipio"></p>' +
            '</div>' +
            '<div class="calc-field">' +
              '<label for="lead-urgencia">&iquest;Para cu&aacute;ndo la ocupas?</label>' +
              '<select id="lead-urgencia" name="urgencia" required>' +
                '<option value="">Selecciona...</option>' + opciones(URGENCIAS) +
              '</select>' +
              '<p class="lead-error" data-error="urgencia"></p>' +
            '</div>' +
            '<div class="calc-field">' +
              '<label for="lead-perfil">&iquest;Eres?</label>' +
              '<select id="lead-perfil" name="perfil" required>' +
                '<option value="">Selecciona...</option>' + opciones(PERFILES) +
              '</select>' +
              '<p class="lead-error" data-error="perfil"></p>' +
            '</div>' +
            '<div class="calc-field">' +
              '<label for="lead-nombre">Nombre</label>' +
              '<input type="text" id="lead-nombre" name="nombre" autocomplete="name" placeholder="&iquest;Con qui&eacute;n tenemos el gusto?" required>' +
              '<p class="lead-error" data-error="nombre"></p>' +
            '</div>' +
            '<div class="calc-field lead-full">' +
              '<label for="lead-telefono">WhatsApp</label>' +
              '<input type="tel" id="lead-telefono" name="telefono" inputmode="tel" autocomplete="tel-national" placeholder="10 d&iacute;gitos" required>' +
              '<p class="lead-error" data-error="telefono"></p>' +
            '</div>' +
          '</div>' +
          '<p class="lead-aviso" id="leadAviso" hidden></p>' +
          '<button type="submit" class="btn-primary lead-submit" id="leadSubmit">' +
            '<span class="lead-submit-txt">Enviar y abrir WhatsApp</span>' +
          '</button>' +
          '<p class="lead-pie">Te contesta Isaac Mojica. Sin costo y sin compromiso.<br>Al enviar aceptas nuestro <a href="/privacidad.html" target="_blank" rel="noopener">Aviso de Privacidad</a>.</p>' +
        '</form>' +
        '<div class="lead-ok" id="leadOk" hidden>' +
          '<div class="lead-ok-icon">' +
            '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
          '</div>' +
          '<h4>Listo, abrimos WhatsApp</h4>' +
          '<p>Tu folio es <strong id="leadFolio"></strong>. Gu&aacute;rdalo por si necesitas darle seguimiento.</p>' +
          '<a class="btn-primary" id="leadManual" href="#" target="_blank" rel="noopener">&iquest;No se abri&oacute;? Toca aqu&iacute;</a>' +
        '</div>' +
      '</div>' +
    '</div>';
    document.body.appendChild(el);
    return el;
}

/* ---------- Arranque ---------- */

capturarGclid();

document.addEventListener("DOMContentLoaded", function () {
    const modal = construirModal();
    const form = modal.querySelector("#leadForm");
    const okBox = modal.querySelector("#leadOk");
    const boton = modal.querySelector("#leadSubmit");
    const textoBoton = modal.querySelector(".lead-submit-txt");
    const aviso = modal.querySelector("#leadAviso");
    let enviando = false;
    let ultimoFoco = null;

    /* ---------- Embudo ---------- */

    // Sin esto no hay forma de distinguir "nadie quiere cotizar" de "todos abren
    // el formulario y se rajan". Cada paso se manda a GA4 por separado para poder
    // leer el embudo completo: abierto -> empezado -> enviado, y donde se cae.
    const CAMPOS = ["metros", "claro", "municipio", "urgencia", "perfil", "nombre", "telefono"];
    let embudo = null;

    function medir(evento, params) {
        if (typeof gtag !== "function") return;
        gtag("event", evento, params || {});
    }

    function camposLlenos() {
        return CAMPOS.filter(function (n) {
            const el = form.querySelector('[name="' + n + '"]');
            return el && el.value.trim() !== "";
        });
    }

    // Cerrar la pantalla de exito no es un abandono: por eso el flag `enviado`.
    function abandonar(motivo) {
        if (!embudo || embudo.enviado) return;
        const llenos = camposLlenos();
        medir("cotizador_abandonado", {
            origen: embudo.origen,
            motivo: motivo,
            campos_llenos: llenos.length,
            ultimo_campo: embudo.ultimoCampo || "ninguno",
            // El primero que falta es, casi siempre, el campo que los espanto.
            primer_faltante: CAMPOS.filter(function (c) { return llenos.indexOf(c) === -1; })[0] || "ninguno",
            segundos: Math.round((Date.now() - embudo.inicio) / 1000),
            // pagehide corre mientras la pagina ya se esta muriendo: sin beacon
            // el navegador cancela el request y el abandono mas comun de todos
            // seria justo el que nunca se alcanza a medir.
            transport_type: "beacon"
        });
        embudo = null;
    }

    // Marca avance en cuanto tocan un campo. El primer toque separa al que abrio
    // por curiosidad del que de verdad intento cotizar.
    function registrarAvance(e) {
        if (!embudo) return;
        const nombre = e.target && e.target.name;
        if (!nombre || CAMPOS.indexOf(nombre) === -1) return;
        embudo.ultimoCampo = nombre;
        if (!embudo.empezado) {
            embudo.empezado = true;
            medir("cotizador_empezado", { origen: embudo.origen, primer_campo: nombre });
        }
    }

    function abrir(origen) {
        ultimoFoco = document.activeElement;
        // Si vienen de la calculadora ya nos dieron las medidas: no se las
        // volvemos a pedir.
        if (origen === "calculadora") {
            const inClaro = document.getElementById("calc-claro");
            const inLargo = document.getElementById("calc-largo");
            const claro = inClaro ? parseFloat(inClaro.value) : NaN;
            const largo = inLargo ? parseFloat(inLargo.value) : NaN;
            if (claro > 0) modal.querySelector("#lead-claro").value = claro;
            if (claro > 0 && largo > 0) {
                modal.querySelector("#lead-metros").value = Math.round(claro * largo);
            }
        }
        form.dataset.origen = origen || "cta";
        embudo = {
            origen: form.dataset.origen,
            inicio: Date.now(),
            empezado: false,
            enviado: false,
            ultimoCampo: null
        };
        medir("cotizador_abierto", {
            origen: form.dataset.origen,
            // La pregunta que importa no es cuantos abren, sino si el que
            // llego pagado abandona mas que el organico. Sin este campo los
            // dos publicos quedan revueltos en el mismo numero.
            desde_anuncio: vieneDeAnuncio() ? "si" : "no"
        });
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        // El foco automatico en movil levanta el teclado y tapa el formulario.
        if (window.innerWidth > 720) {
            setTimeout(function () { modal.querySelector("#lead-metros").focus(); }, 320);
        }
    }

    function cerrar() {
        abandonar("cerro_modal");
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        if (ultimoFoco) ultimoFoco.focus();
    }

    // Los CTA conservan su href a WhatsApp: si este modulo no carga, el boton
    // sigue sirviendo. Solo interceptamos cuando el modal ya existe.
    //
    //   data-form="cotizar"     siempre abre el formulario
    //   data-form="si-anuncio"  solo lo abre si el visitante llego por un anuncio;
    //                           al trafico organico se le deja el paso libre
    document.querySelectorAll("[data-form]").forEach(function (cta) {
        const modo = cta.getAttribute("data-form");
        cta.addEventListener("click", function (e) {
            if (modo === "si-anuncio" && !vieneDeAnuncio()) {
                // Paso libre al organico: esto si es un contacto real por
                // WhatsApp, no una apertura de formulario. Se mide aqui porque
                // script.js ya no toca los [data-form], para no contar el mismo
                // click como contacto y como apertura a la vez.
                medir("contacto", {
                    canal: "whatsapp",
                    origen: cta.getAttribute("data-origen") || "sin-etiqueta"
                });
                // Aunque vieneDeAnuncio() dio falso, el gclid pudo perderse
                // (almacenamiento bloqueado): se manda siempre y Google decide
                // si habia clic de anuncio que atribuir.
                const etiqueta = window.ADS_CONVERSION_CONTACTO || "";
                if (etiqueta && etiqueta.indexOf("PENDIENTE") === -1) {
                    medir("conversion", { send_to: etiqueta });
                }
                return;
            }
            e.preventDefault();
            abrir(cta.getAttribute("data-origen"));
        });
    });

    // Captura en fase de captura: los select disparan change, los input disparan input.
    form.addEventListener("input", registrarAvance, true);
    form.addEventListener("change", registrarAvance, true);

    // Irse con el formulario abierto es el abandono mas comun y el que ningun
    // click reporta. pagehide es el unico evento confiable en Safari movil.
    window.addEventListener("pagehide", function () { abandonar("salio_del_sitio"); });

    modal.querySelector("#leadClose").addEventListener("click", cerrar);
    modal.addEventListener("click", function (e) { if (e.target === modal) cerrar(); });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal.classList.contains("open")) cerrar();
    });

    // Solo digitos, y solo los 10 de un movil mexicano.
    const tel = modal.querySelector("#lead-telefono");
    tel.addEventListener("input", function () {
        tel.value = tel.value.replace(/\D/g, "").slice(0, 10);
    });

    // Aviso no bloqueante: el lead entra igual, pero Isaac ya sabe que llega
    // con un claro fuera del catalogo estandar.
    const claroInput = modal.querySelector("#lead-claro");
    claroInput.addEventListener("input", function () {
        const v = parseFloat(claroInput.value);
        if (v > CLARO_MAX) {
            aviso.textContent = "Un claro de " + v + " m pasa del alcance de la vigueta P-20 (" + CLARO_MAX + " m). Lo revisamos contigo, mándalo sin problema.";
            aviso.hidden = false;
        } else {
            aviso.hidden = true;
        }
    });

    function marcarError(campo, mensaje) {
        const p = modal.querySelector('[data-error="' + campo + '"]');
        const input = modal.querySelector('[name="' + campo + '"]');
        if (p) p.textContent = mensaje || "";
        if (input) input.classList.toggle("invalido", Boolean(mensaje));
    }

    function validar() {
        const d = {
            metros: parseInt(form.metros.value, 10),
            claro: parseFloat(form.claro.value),
            municipio: form.municipio.value,
            urgencia: form.urgencia.value,
            perfil: form.perfil.value,
            nombre: form.nombre.value.trim(),
            telefono: form.telefono.value.replace(/\D/g, "")
        };
        const errores = {};
        if (!(d.metros >= 1)) errores.metros = "Dinos cuántos m² son, aunque sea aproximado.";
        if (!(d.claro >= 0.5)) errores.claro = "Falta el claro entre apoyos.";
        if (!d.municipio) errores.municipio = "Elige el municipio de la obra.";
        if (!d.urgencia) errores.urgencia = "Elige para cuándo la ocupas.";
        if (!d.perfil) errores.perfil = "Elige una opción.";
        if (d.nombre.length < 2) errores.nombre = "Escribe tu nombre.";
        if (d.telefono.length !== 10) errores.telefono = "Tu WhatsApp va a 10 dígitos.";

        ["metros", "claro", "municipio", "urgencia", "perfil", "nombre", "telefono"]
            .forEach(function (c) { marcarError(c, errores[c]); });

        const primerError = Object.keys(errores)[0];
        if (primerError) {
            modal.querySelector('[name="' + primerError + '"]').focus();
            return null;
        }
        return d;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        if (enviando) return;

        const datos = validar();
        if (!datos) {
            // Que campo trabo el envio. Si todos se atoran en el mismo, el problema
            // es ese campo, no el formulario entero.
            const fallos = CAMPOS.filter(function (n) {
                const p = modal.querySelector('[data-error="' + n + '"]');
                return p && p.textContent.trim() !== "";
            });
            medir("cotizador_error", {
                origen: form.dataset.origen || "cta",
                campos: fallos.join(",") || "desconocido"
            });
            return;
        }

        if (embudo) embudo.enviado = true;
        medir("cotizador_enviado", {
            origen: form.dataset.origen || "cta",
            urgencia: datos.urgencia,
            segundos: embudo ? Math.round((Date.now() - embudo.inicio) / 1000) : 0
        });

        enviando = true;
        boton.disabled = true;
        boton.classList.add("cargando");
        textoBoton.textContent = "Enviando...";

        const folio = generarFolio();
        const url = "https://wa.me/" + WHATSAPP + "?text=" +
            encodeURIComponent(armarMensaje(datos, folio));

        // La confirmacion se pinta ANTES de esperar a la red. Si Firestore tarda,
        // el cliente ve su folio y el boton manual, no un boton girando en vano.
        form.hidden = true;
        okBox.hidden = false;
        modal.querySelector("#leadFolio").textContent = folio;
        modal.querySelector("#leadManual").href = url;

        const registro = Object.assign({}, datos, {
            folio: folio,
            gclid: leerGclid(),
            origen: form.dataset.origen || "cta",
            estatus: "nuevo"
        });

        // El catch va sobre la promesa de guardado, NO sobre el Promise.race: si
        // Firestore rechaza despues del tope, el error igual se reporta en vez
        // de perderse como unhandled rejection.
        const guardado = guardarLead(registro)
            .then(function (ok) {
                console.log(ok
                    ? "[cotizador] Lead " + folio + " guardado en Firestore."
                    : "[cotizador] Lead " + folio + " NO guardado (falta configuracion).");
                return ok;
            })
            .catch(function (err) {
                console.error("[cotizador] Firestore rechazo el lead " + folio + ":", err);
                return false;
            });

        // Ambos con tope. Pase lo que pase, abajo se abre WhatsApp.
        try {
            await Promise.all([
                conTope(guardado, ESPERA_FIRESTORE),
                reportarConversion(folio, datos.urgencia)
            ]);
        } catch (err) {
            console.error("[cotizador] Error inesperado:", err);
        }

        if (typeof gtag === "function") {
            gtag("event", "generate_lead", {
                folio: folio,
                perfil: datos.perfil,
                urgencia: datos.urgencia,
                municipio: datos.municipio,
                metros: datos.metros
            });
        }

        window.location.href = url;
    });
});
