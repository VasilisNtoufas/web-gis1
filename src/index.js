import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import shp from 'shpjs';
import 'bootstrap';
import 'leaflet';
import 'ol/ol.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';

import { GeoJsonService } from './geojson.service';

const documentFile = document.querySelector('#shpFile');

const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM()
        })
    ],
    view: new View({
        center: [0, 0],
        zoom: 0
    })
});

documentFile.addEventListener('input', () => {
    console.log(documentFile.files);

    if (documentFile.files.length > 0) {
        const file = documentFile.files[0];
        console.log(file.type);
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
            new GeoJsonService().data(reader.result);
        }
    };
    reader.readAsArrayBuffer(file);
}
