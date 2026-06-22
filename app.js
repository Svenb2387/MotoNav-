const state = {
  map: null,
  user: [50.1109, 8.6821],
  stops: [],
  markers: [],
  rainLayer: null,
  routeLine: null
};

const $ = (id) => document.getElementById(id);

function initMap() {
  state.map = L.map('map').setView(state.user, 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(state.map);
  L.marker(state.user).addTo(state.map).bindPopup('Start / Standort');
}

function locateUser() {
  if (!navigator.geolocation) return alert('Standort wird nicht unterstützt.');
  navigator.geolocation.getCurrentPosition(pos => {
    state.user = [pos.coords.latitude, pos.coords.longitude];
    state.map.setView(state.user, 13);
    L.marker(state.user).addTo(state.map).bindPopup('Dein Standort').openPopup();
  }, () => alert('Standortfreigabe wurde nicht erlaubt.'));
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  const data = await res.json();
  if (!data.length) throw new Error('Ort nicht gefunden');
  return { name: data[0].display_name, lat: Number(data[0].lat), lon: Number(data[0].lon) };
}

function renderStops() {
  $('stopList').innerHTML = state.stops.map((s, i) => `
    <li><strong>${i + 1}. ${s.label}</strong><br><span class="hint">Danach: ${modeLabel(s.mode)}</span></li>
  `).join('');
}

function modeLabel(mode) {
  return { country:'Landstraße bevorzugt', highway:'Autobahn erlaubt', curvy:'kurvig/scenic' }[mode] || mode;
}

async function addStop() {
  const query = $('stopInput').value.trim();
  if (!query) return;
  try {
    const place = await geocode(query);
    const mode = $('segmentMode').value;
    const stop = { label: query, ...place, mode };
    state.stops.push(stop);
    const marker = L.marker([stop.lat, stop.lon]).addTo(state.map).bindPopup(`${query}<br>${modeLabel(mode)}`);
    state.markers.push(marker);
    state.map.setView([stop.lat, stop.lon], 11);
    $('stopInput').value = '';
    renderStops();
  } catch (e) { alert(e.message); }
}

function buildDemoRoute() {
  const coords = [state.user, ...state.stops.map(s => [s.lat, s.lon])];
  if (coords.length < 2) return alert('Bitte mindestens ein Ziel hinzufügen.');
  if (state.routeLine) state.map.removeLayer(state.routeLine);
  state.routeLine = L.polyline(coords, { weight: 5 }).addTo(state.map);
  state.map.fitBounds(state.routeLine.getBounds(), { padding:[30,30] });
}

async function toggleRain() {
  if (state.rainLayer) {
    state.map.removeLayer(state.rainLayer);
    state.rainLayer = null;
    $('rainStatus').textContent = 'Regenradar ausgeschaltet.';
    return;
  }
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    const data = await res.json();
    const latest = data.radar.past[data.radar.past.length - 1];
    const url = `${data.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;
    state.rainLayer = L.tileLayer(url, { opacity: 0.65 }).addTo(state.map);
    $('rainStatus').textContent = 'Regenradar aktiv. Dunkle/kräftige Flächen = Regenzellen.';
  } catch { $('rainStatus').textContent = 'Regenradar konnte nicht geladen werden.'; }
}

function findFuelDemo() {
  $('fuelList').innerHTML = `
    <li><strong>Demo-Tankstelle Nord</strong><br>Super E10: API-Key nötig<br><span class="hint">Tankerkönig-Service vorbereiten.</span></li>
    <li><strong>Demo-Tankstelle Route</strong><br>Super: API-Key nötig<br><span class="hint">Später: sortiert nach Entfernung und Preis.</span></li>
  `;
}

function poiDemo(type) {
  const labels = { viewpoint:'Spotlights/Aussicht', restaurant:'Essen', bar:'Bars/Cafés', attraction:'Sehenswürdigkeiten' };
  $('poiList').innerHTML = `
    <li><strong>${labels[type]}</strong><br>POI-Suche vorbereitet.<br><span class="hint">Für echte Ergebnisse: Overpass API oder Places API anbinden.</span></li>
  `;
  document.querySelector('[data-tab="stops"]').click();
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.tab,.tabcontent').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.tab).classList.add('active');
  }));
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
}

$('locateBtn').addEventListener('click', locateUser);
$('addStopBtn').addEventListener('click', addStop);
$('buildRouteBtn').addEventListener('click', buildDemoRoute);
$('toggleRainBtn').addEventListener('click', toggleRain);
$('findFuelBtn').addEventListener('click', findFuelDemo);
$('closePopup').addEventListener('click', () => $('stopPopup').classList.add('hidden'));
document.querySelectorAll('.quickPoi').forEach(b => b.addEventListener('click', () => { $('stopPopup').classList.add('hidden'); poiDemo(b.dataset.type); }));

setupTabs(); initMap(); registerServiceWorker();
setTimeout(() => $('stopPopup').classList.remove('hidden'), 2500); // Demo für Zwischenstopp-Reiter
