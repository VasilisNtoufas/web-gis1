import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import $ from 'jquery';
import * as L from 'leaflet';
import * as LC from 'leaflet-defaulticon-compatibility';

import { GeoJsonService } from './geojson.service';
import { Legend } from './legend';
import { createMarkerButton, createTextButton } from './marker';
import north from './north.png';
import { setProgress } from './progress.service';

const shpForm = document.querySelector('#shpForm');
const shpFileInput = document.querySelector('#shpFile');
const shpFileNameInput = document.querySelector('#shpTitle');
const colorInput = document.querySelector('#shpColor');
const titleInput = document.querySelector('#title');
const titleSizeInput = document.querySelector('#titleSize');

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
setupNorth(leafletMap);
const legend = new Legend(leafletMap);
L.control.scale().addTo(leafletMap);

leafletMap.on('click', onMapClick);

titleInput.addEventListener('input', () => titleDiv.innerText = titleInput.value);
titleSizeInput.addEventListener('input', () => titleDiv.style.fontSize = `${titleSizeInput.value}px`);
shpForm.addEventListener('submit', onShpFormSubmit);

function onShpFormSubmit(e) {
    e.preventDefault();
    $('#newFileModal').modal('hide');

    if (shpFileInput.files.length > 0 && shpFileInput.files[0].name.endsWith('.zip')) {
        handleZipFile(shpFileInput.files[0], geoJsonLayer => geoJsonLayer.setStyle({ color: colorInput.value }));
        shpFileInput.classList.remove('is-invalid');
    } else {
        shpFileInput.classList.add('is-invalid');
    }

    shpForm.removeEventListener('submit', onShpFormSubmit);
}

function handleZipFile(file, callback) {
    const reader = new FileReader();
    reader.onload = () => {
        if (reader.readyState === FileReader.DONE && !reader.error) {
            new GeoJsonService().data(reader.result)
                .then(geoJson => geoJsonLayer = displayGeoJson(geoJson, shpFileNameInput.value || file.name.split('.')[0], leafletMap))
                .then(callback);
        }
    };
    reader.addEventListener('progress', event => setProgress(event.loaded, event.total));
    reader.readAsArrayBuffer(file);
}

function displayGeoJson(geoJson, name, map) {
    setProgress(100);

    console.log(geoJson);

    const mapGeoJson = L.geoJSON(geoJson, { style: () => ({ color: colorInput.value }) })
        .bindPopup(layer => `<dl>${Object.entries(layer.feature.properties)
            .map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`)}</dl>`)
        .addTo(map);

    map.fitBounds(mapGeoJson.getBounds());

    legend.addLegends([{ color: colorInput.value, text: name }]);

    return mapGeoJson;
}

function setupTitle(map) {
    const titleControl = L.control();
    let div;

    titleControl.onAdd = () => {
        div = L.DomUtil.create('div', 'w-25 float-none mx-auto');
        div.innerText = titleInput.value;
        div.style.fontSize = `${titleSizeInput.value}px`;

        return div;
    };

    titleControl.addTo(map);
    titleControl.getContainer().parentElement.classList.add('text-center', 'w-100');

    return div;
}

function setupNorth(map) {
    const northControl = L.control();
    let img;

    northControl.onAdd = () => {
        img = L.DomUtil.create('img');
        img.style.width = '150px';
        img.setAttribute('src', north);

        return img;
    };

    northControl.addTo(map);

    return img;
}

function onMapClick(e) {
    const popup = L.popup();
    const popupContent = L.DomUtil.create('div');
    createMarkerButton(leafletMap, popupContent, popup, e.latlng);
    createTextButton(leafletMap, popupContent, popup, e.latlng);

    popup.setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(leafletMap);
}
