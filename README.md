# RutaVIVA

Sitio web responsivo (móvil y laptop) para ayudar a coordinar la respuesta comunitaria
después de un desastre natural: la gente registra lo que necesita, consulta la
disponibilidad en centros de acopio y sigue las rutas de entrega activas.

Es HTML + CSS + JavaScript puro, sin frameworks ni proceso de build, así que puedes
subirlo directo a GitHub Pages.

## Estructura

```
rutaviva/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── images/
│   └── despues-terremoto/
└── README.md
```

## Qué es funcional y qué es demo

- **Registrar necesidades**: funciona en el navegador con `localStorage`. Cada
  solicitud queda guardada en el dispositivo de quien la llena. Para que las
  solicitudes lleguen realmente a una base de datos central, conecta el formulario
  (en `js/script.js`, función `formNecesidad.addEventListener('submit', ...)`) a tu
  propio backend o a un servicio como Google Sheets, Airtable o Formspree.
- **Centros de acopio**: la lista y el mapa usan 5 coordenadas de ejemplo en
  Medellín (arreglo `CENTROS` en `js/script.js`). Reemplázalas por tus centros
  reales (nombre, dirección, latitud, longitud).
- **Rutas activas**: igual que arriba, son datos de ejemplo (arreglo `RUTAS`).
  Para rutas en vivo necesitarías una fuente de datos (GPS de los vehículos) que
  actualice ese arreglo, por ejemplo vía una API.
- **Mapas**: usan Leaflet + OpenStreetMap (gratis, sin necesidad de API key).
- **"Usar mi ubicación"**: usa la geolocalización del navegador para calcular el
  centro de acopio más cercano.

