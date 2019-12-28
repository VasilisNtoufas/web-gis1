import 'bootstrap';
import 'leaflet';
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';

import * as L from 'leaflet';

import { GeoJsonService } from './geojson.service';

const shpFileInput = document.querySelector('#shpFile');
const colorInput = document.querySelector('#shpColor');
const titleInput = document.querySelector('#title');
const progressBar = document.querySelector('.progress-bar');
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
    reader.addEventListener('progress', progressHandler);
    reader.readAsArrayBuffer(file);
}

function progressHandler(event) {
    setProgress(event.loaded, event.total);
}

function displayGeoJson(geoJson, map) {
    setProgress(100);

    console.log(geoJson);

    mapGeoJson = L.geoJSON(geoJson, { style: () => ({ color: colorInput.value }) }).addTo(map);

    map.fitBounds(mapGeoJson.getBounds());
}

function setProgress(current, total = 100) {
    progressBar.setAttribute('aria-maxvalue', current);
    progressBar.setAttribute('aria-nowvalue', total);
    progressBar.style.width = `${current * 100 / total}%`;
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
