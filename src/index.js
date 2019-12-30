import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import * as L from 'leaflet';
import * as LC from 'leaflet-defaulticon-compatibility';

import { GeoJsonService } from './geojson.service';
import { setProgress } from './progress.service';

const shpFileInput = document.querySelector('#shpFile');
const colorInput = document.querySelector('#shpColor');
const titleInput = document.querySelector('#title');
let mapGeoJson;

const leafletMap = L.map('map').setView([40.5698109, 20.6563387], 7);

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 18,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }
)
    .addTo(leafletMap);

const titleDiv = setupTitle(leafletMap);
L.control.scale().addTo(leafletMap);

leafletMap.on('click', onMapClick);


shpFileInput.addEventListener('input', () => {
    if (shpFileInput.files.length > 0 && shpFileInput.files[0].name.endsWith('.zip')) {
        handleZipFile(shpFileInput.files[0]);
        shpFileInput.classList.remove('is-invalid');
    } else {
        shpFileInput.classList.add('is-invalid');
    }
});

colorInput.addEventListener('change', () => mapGeoJson.setStyle({ color: colorInput.value }));
titleInput.addEventListener('input', () => titleDiv.innerText = titleInput.value);

function handleZipFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        if (reader.readyState === FileReader.DONE && !reader.error) {
            new GeoJsonService().data(reader.result)
                .then(geoJson => displayGeoJson(geoJson, leafletMap));
        }
    };
    reader.addEventListener('progress', event => setProgress(event.loaded, event.total));
    reader.readAsArrayBuffer(file);
}

function displayGeoJson(geoJson, map) {
    setProgress(100);

    console.log(geoJson);

    mapGeoJson = L.geoJSON(geoJson, { style: () => ({ color: colorInput.value }) }).addTo(map);

    map.fitBounds(mapGeoJson.getBounds());
}

function setupTitle(map) {
    const legend = L.control();
    let div;

    legend.onAdd = () => {
        div = L.DomUtil.create('div', 'display-4 w-25 float-none mx-auto');
        div.innerText = titleInput.value;

        return div;
    };

    legend.addTo(map);
    legend.getContainer().parentElement.classList.add('text-center', 'w-100');

    return div;
}

function onMapClick(e) {
    console.log(e.latlng);
    const popup = L.popup();
    const button = L.DomUtil.create('button', 'btn btn-primary btn-sm');
    button.textContent = 'Set marker';
    button.onclick = () => {
        const marker = L.marker(e.latlng).addTo(leafletMap);
        popup.remove();

        const deleteMarkerButton = L.DomUtil.create('button', 'btn btn-primary btn-sm');
        deleteMarkerButton.textContent = 'Remove';
        deleteMarkerButton.onclick = () => marker.remove();

        marker.bindPopup(deleteMarkerButton);
        marker.onclick = () => marker.openPopup();
    };

    popup.setLatLng(e.latlng)
        .setContent(button)
        .openOn(leafletMap);
}
