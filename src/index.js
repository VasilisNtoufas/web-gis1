import 'bootstrap';
import 'leaflet';
import 'ol/ol.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';

import * as L from 'leaflet';

import { GeoJsonService } from './geojson.service';

const documentFile = document.querySelector('#shpFile');

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
    reader.readAsArrayBuffer(file);
}

function displayGeoJson(geoJson, map) {
    console.log(geoJson);

    const mapGeoJson = L.geoJSON(geoJson).addTo(map);

    map.fitBounds(mapGeoJson.getBounds());
}
