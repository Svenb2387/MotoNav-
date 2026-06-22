# MotoRoute PWA

Erste Web-App/PWA-Version der Motorrad-Navigation.

## Start lokal

1. Ordner entpacken
2. Im Ordner einen lokalen Server starten, z. B.:
   ```bash
   python3 -m http.server 8080
   ```
3. Im Browser öffnen:
   http://localhost:8080

## Auf dem iPhone testen

Die PWA muss über HTTPS laufen, damit Standort und Installation sauber funktionieren. Einfachste Wege:

- GitHub Pages
- Netlify
- Vercel

Danach im iPhone-Safari öffnen und wählen: Teilen → Zum Home-Bildschirm.

## Enthalten

- Leaflet/OpenStreetMap Karte
- Standortbutton
- Zwischenziele per Suche
- Streckenabschnitt-Modus: Landstraße, Autobahn, kurvig/scenic
- Demo-Routenlinie
- RainViewer Wetterradar-Overlay
- Tankstellen-/Super-Preis-Modul vorbereitet
- Zwischenstopp-Popup für Spotlights, Essen, Bars/Cafés, Sehenswürdigkeiten

## Nächste Ausbaustufe

- echtes Routing über GraphHopper, OSRM oder Mapbox
- echte Tankstellenpreise über Tankerkönig API
- echte POI-Suche über Overpass API oder Google Places
- Sprachansagen
- GPX Import/Export
