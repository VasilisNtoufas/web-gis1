import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import * as L from 'leaflet';
import * as LC from 'leaflet-defaulticon-compatibility';

import { GeoJsonService } from './geojson.service';
import { createMarkerButton, createTextButton } from './marker';
import { setProgress } from './progress.service';

const shpFileInput = document.querySelector('#shpFile');
const colorInput = document.querySelector('#shpColor');
const titleInput = document.querySelector('#title');
const titleSizeInput = document.querySelector('#titleSize');
let geoJsonLayer;

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
colorInput.addEventListener('input', () => geoJsonLayer.setStyle({ color: colorInput.value }));
titleInput.addEventListener('input', () => titleDiv.innerText = titleInput.value);
titleSizeInput.addEventListener('input', () => titleDiv.style.fontSize = `${titleSizeInput.value}px`);

function handleZipFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        if (reader.readyState === FileReader.DONE && !reader.error) {
            new GeoJsonService().data(reader.result)
                .then(geoJson => geoJsonLayer = displayGeoJson(geoJson, leafletMap));
        }
    };
    reader.addEventListener('progress', event => setProgress(event.loaded, event.total));
    reader.readAsArrayBuffer(file);
}

function displayGeoJson(geoJson, map) {
    setProgress(100);

    console.log(geoJson);

    const mapGeoJson = L.geoJSON(geoJson, { style: () => ({ color: colorInput.value }) })
        .bindPopup(layer => `<dl>${Object.entries(layer.feature.properties)
            .map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`)}</dl>`)
        .addTo(map);

    map.fitBounds(mapGeoJson.getBounds());

    return mapGeoJson;
}

function setupTitle(map) {
    const legend = L.control();
    let div;

    legend.onAdd = () => {
        div = L.DomUtil.create('div', 'w-25 float-none mx-auto');
        div.innerText = titleInput.value;
        div.style.fontSize = `${titleSizeInput.value}px`;

        return div;
    };

    legend.addTo(map);
    legend.getContainer().parentElement.classList.add('text-center', 'w-100');

    return div;
}

function onMapClick(e) {
    const popup = L.popup();
    const popupContent = L.DomUtil.create('div');
    createMarkerButton(leafletMap, popupContent);
    createTextButton(leafletMap, popupContent, popup, e.latlng);

    popup.setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(leafletMap);
}
