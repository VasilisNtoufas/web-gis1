import 'bootstrap';
import 'leaflet';
import 'ol/ol.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';

import * as L from 'leaflet';

import { GeoJsonService } from './geojson.service';

const documentFile = document.querySelector('#shpFile');
const progressBar = document.querySelector('.progress-bar');

const leafletMap = L.map('map').setView([40.5698109, 20.6563387], 7);

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 18,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }
)
    .addTo(leafletMap);

L.control.scale().addTo(leafletMap);

documentFile.addEventListener('input', () => {
    if (documentFile.files.length > 0) {
        const file = documentFile.files[0];

        if (file.name.endsWith('.zip')) {
            handleZipFile(file);
        }
    }
})

function handleZipFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        if (reader.readyState !== FileReader.DONE || reader.error) {
            return;
        } else {
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

    const mapGeoJson = L.geoJSON(geoJson).addTo(map);

    map.fitBounds(mapGeoJson.getBounds());
}

function setProgress(current, total = 100) {
    progressBar.setAttribute('aria-maxvalue', current);
    progressBar.setAttribute('aria-nowvalue', total);
    progressBar.style.width = `${current * 100 / total}%`;
}
