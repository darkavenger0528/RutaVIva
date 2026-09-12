/* =========================================================
   RutaVIVA — lógica de la página
   Todo funciona 100% en el navegador (localStorage), sin backend.
   Para producción real, conecta el formulario a tu propia API.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- MENÚ MÓVIL ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mobileNav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => mobileNav.classList.remove('open'))
  );

  /* ---------- TOAST ---------- */
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  /* =========================================================
     1. RECURSOS NECESITADOS
     ========================================================= */
  const RECURSOS = [
    'Alimentos no perecederos',
    'Agua potable',
    'Productos de higiene personal',
    'Productos para bebé',
    'Ropa de abrigo',
    'Medicamentos básicos',
    'Cobijas y colchonetas',
    'Linternas y pilas',
    'Kits de primeros auxilios',
    'Elementos de aseo del hogar'
  ];

  const listaRecursos = document.getElementById('listaRecursos');
  const seleccionados = new Set();
  const contadorSeleccion = document.getElementById('contadorSeleccion');

  RECURSOS.forEach(recurso => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = recurso;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      const pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!pressed));
      if (pressed) seleccionados.delete(recurso); else seleccionados.add(recurso);
      contadorSeleccion.textContent = seleccionados.size;
    });
    listaRecursos.appendChild(btn);
  });

  document.getElementById('buscarRecurso').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    [...listaRecursos.children].forEach(chip => {
      chip.classList.toggle('is-hidden', !chip.textContent.toLowerCase().includes(q));
    });
  });

  /* =========================================================
     2. CENTROS DE ACOPIO
     ========================================================= */
  // Coordenadas de ejemplo (área de Medellín). Reemplaza por datos reales.
  const CENTROS = [
    { nombre: 'Cruz Roja Colombiana – Seccional Antioquia', direccion: 'Cra 47 #26-90, Medellín', lat: 6.2296, lng: -75.5763 },
    { nombre: 'Estadio Atanasio Girardot',                  direccion: 'Cl 48 #73-100, Medellín',  lat: 6.2571, lng: -75.5903 },
    { nombre: 'Universidad de Antioquia',                   direccion: 'Cl 67 #53-108, Medellín',  lat: 6.2678, lng: -75.5686 },
    { nombre: 'Alcaldía de Medellín',                       direccion: 'Cl 44 #52-165, Medellín',  lat: 6.2447, lng: -75.5748 },
    { nombre: 'Fundación Saciar',                           direccion: 'Cra 65 #98A-67, Medellín', lat: 6.2802, lng: -75.5906 }
  ];

  const centroSelect = document.getElementById('centroCercano');
  CENTROS.forEach((c, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = c.nombre;
    centroSelect.appendChild(opt);
  });

  const listaCentros = document.getElementById('listaCentros');
  function pintarCentros(distancias){
    listaCentros.innerHTML = '';
    CENTROS.forEach((c, i) => {
      const li = document.createElement('li');
      li.className = 'center-item';
      li.dataset.nombre = c.nombre.toLowerCase();
      const dist = distancias ? `<span class="dist">${distancias[i].toFixed(1)} km</span>` : '';
      li.innerHTML = `<span>${c.nombre}<small>${c.direccion}</small></span>${dist}`;
      listaCentros.appendChild(li);
    });
  }
  pintarCentros();

  document.getElementById('buscarCentro').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    [...listaCentros.children].forEach(li => {
      li.classList.toggle('is-hidden', !li.dataset.nombre.includes(q));
    });
  });

  function distanciaKm(lat1, lng1, lat2, lng2){
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const hintUbicacion = document.getElementById('hintUbicacion');
  document.getElementById('btnUbicacion').addEventListener('click', () => {
    if (!navigator.geolocation){
      hintUbicacion.textContent = 'Tu navegador no permite compartir ubicación.';
      return;
    }
    hintUbicacion.textContent = 'Buscando tu ubicación...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distancias = CENTROS.map(c => distanciaKm(latitude, longitude, c.lat, c.lng));
        const idxCercano = distancias.indexOf(Math.min(...distancias));
        centroSelect.value = idxCercano;
        pintarCentros(distancias);
        hintUbicacion.textContent = `Centro más cercano: ${CENTROS[idxCercano].nombre} (${distancias[idxCercano].toFixed(1)} km).`;
      },
      () => { hintUbicacion.textContent = 'No pudimos acceder a tu ubicación. Elige el centro manualmente.'; }
    );
  });

  /* =========================================================
     3. FORMULARIO DE SOLICITUD (guardado local)
     ========================================================= */
  const formNecesidad = document.getElementById('formNecesidad');
  const misSolicitudes = document.getElementById('misSolicitudes');
  const listaSolicitudes = document.getElementById('listaSolicitudes');

  function cargarSolicitudes(){
    const datos = JSON.parse(localStorage.getItem('rutaviva_solicitudes') || '[]');
    listaSolicitudes.innerHTML = '';
    if (datos.length){
      misSolicitudes.hidden = false;
      datos.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${s.centro}</strong>${s.items.join(', ')} — para ${s.cantidad} persona(s)`;
        listaSolicitudes.appendChild(li);
      });
    }
  }
  cargarSolicitudes();

  formNecesidad.addEventListener('submit', (e) => {
    e.preventDefault();
    if (seleccionados.size === 0){
      showToast('Selecciona al menos un recurso que necesites.');
      return;
    }
    const cantidad = document.getElementById('cantidad').value;
    const centro = CENTROS[centroSelect.value].nombre;

    const datos = JSON.parse(localStorage.getItem('rutaviva_solicitudes') || '[]');
    datos.push({ items: [...seleccionados], cantidad, centro, fecha: new Date().toISOString() });
    localStorage.setItem('rutaviva_solicitudes', JSON.stringify(datos));

    cargarSolicitudes();
    showToast('Solicitud registrada. Preséntala en el centro de acopio elegido.');
    formNecesidad.reset();
    seleccionados.clear();
    contadorSeleccion.textContent = '0';
    [...listaRecursos.children].forEach(chip => chip.setAttribute('aria-pressed', 'false'));
  });

  /* =========================================================
     4. MAPAS (Leaflet)
     ========================================================= */
  function crearMapa(elId, puntos, iconoColor){
    const el = document.getElementById(elId);
    if (!el || typeof L === 'undefined') return;

    const map = L.map(elId, { scrollWheelZoom: false }).setView([puntos[0].lat, puntos[0].lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const bounds = [];
    puntos.forEach(p => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 9, color: iconoColor, fillColor: iconoColor, fillOpacity: 0.9, weight: 2
      }).addTo(map);
      marker.bindPopup(`<strong>${p.nombre}</strong>${p.detalle ? '<br>' + p.detalle : ''}`);
      bounds.push([p.lat, p.lng]);
    });
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30] });
  }

  crearMapa('mapaCentros', CENTROS.map(c => ({ nombre: c.nombre, detalle: c.direccion, lat: c.lat, lng: c.lng })), '#37C928');

  /* =========================================================
     5. RUTAS ACTIVAS
     ========================================================= */
  const RUTAS = [
    { nombre: 'Recorriendo por Vía Cajamarca',    hace: 'Actualizado hace 2 horas', lat: 4.4389, lng: -75.4272 },
    { nombre: 'Recorriendo por Vía 50, Chocó',    hace: 'Actualizado hace 3 horas', lat: 5.6919, lng: -76.6583 },
    { nombre: 'Recorriendo por Sabaneta, Ant.',   hace: 'Actualizado hace 3 horas', lat: 6.1500, lng: -75.6167 }
  ];

  const listaRutas = document.getElementById('listaRutas');
  RUTAS.forEach(r => {
    const li = document.createElement('li');
    li.className = 'route-item';
    li.innerHTML = `
      <span class="route-icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="9" width="14" height="8" rx="1"/><path d="M15 12h4l3 3v2h-2"/><circle cx="6" cy="19" r="1.6"/><circle cx="17.5" cy="19" r="1.6"/></svg>
      </span>
      <p>${r.nombre}<span>${r.hace}</span></p>`;
    listaRutas.appendChild(li);
  });

  crearMapa('mapaRutas', RUTAS.map(r => ({ nombre: r.nombre, detalle: r.hace, lat: r.lat, lng: r.lng })), '#5A2A16');

  /* =========================================================
     6. CARRUSEL "Así quedamos después del terremoto" (26 fotos)
     Rutas relativas: images/despues-terremoto/1.jpg ... 26.jpg
     ========================================================= */
  const TOTAL_FOTOS = 26;
  const CARPETA_FOTOS = 'images/despues-terremoto';

  const track = document.getElementById('carruselTrack');
  const dotsWrap = document.getElementById('carruselDots');
  const contadorActual = document.getElementById('carruselActual');
  let indiceActual = 0;

  for (let i = 1; i <= TOTAL_FOTOS; i++){
    const img = document.createElement('img');
    img.src = `${CARPETA_FOTOS}/${i}.jpg`;
    img.alt = `Foto ${i} del estado de la comunidad tras el terremoto`;
    img.loading = i <= 2 ? 'eager' : 'lazy';
    track.appendChild(img);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ir a la foto ${i}`);
    dot.addEventListener('click', () => irAFoto(i - 1));
    dotsWrap.appendChild(dot);
  }

  function irAFoto(indice){
    indiceActual = (indice + TOTAL_FOTOS) % TOTAL_FOTOS;
    track.style.transform = `translateX(-${indiceActual * 100}%)`;
    contadorActual.textContent = indiceActual + 1;
    [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === indiceActual));
  }

  document.getElementById('carruselPrev').addEventListener('click', () => irAFoto(indiceActual - 1));
  document.getElementById('carruselNext').addEventListener('click', () => irAFoto(indiceActual + 1));
  irAFoto(0);

  // deslizar con el dedo en móvil
  let xInicio = null;
  const carrusel = document.getElementById('carrusel');
  carrusel.addEventListener('touchstart', (e) => { xInicio = e.touches[0].clientX; }, { passive: true });
  carrusel.addEventListener('touchend', (e) => {
    if (xInicio === null) return;
    const diff = e.changedTouches[0].clientX - xInicio;
    if (Math.abs(diff) > 40) irAFoto(indiceActual + (diff < 0 ? 1 : -1));
    xInicio = null;
  });

  // autoplay suave, se detiene si el usuario interactúa
  let autoplay = setInterval(() => irAFoto(indiceActual + 1), 5000);
  ['click', 'touchstart'].forEach(evt =>
    carrusel.addEventListener(evt, () => { clearInterval(autoplay); }, { once: true })
  );

});
