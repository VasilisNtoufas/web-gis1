import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';

import north from './north.png';
import { Legend } from './legend';
import { createMarkerButton, createTextButton } from './marker';

export class MapService {

    constructor() {
        this.leafletMap = L.map('map').setView([38.5698109, 23.6563387], 7);

        this.addAttribution();
        this.addScale();
        this.addNorth();
        this.addTitle();
        this.addLegend();
        this.addOnClickListener();
    }

    addAttribution() {
        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                maxZoom: 18,
                attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            }
        )
            .addTo(this.leafletMap);
    }

    addScale() {
        L.control.scale().addTo(this.leafletMap);
    }

    addLegend() {
        this.legend = new Legend(this.leafletMap);
    }

    addNorth() {
        const northControl = L.control();
        let img;

        northControl.onAdd = () => {
            img = L.DomUtil.create('img', 'float-right');
            img.style.width = '150px';
            img.setAttribute('src', north);

            return img;
        };

        northControl.addTo(this.leafletMap);
    }

    addTitle() {
        const titleControl = L.control({ position: 'topleft' });
        this.titleDiv = L.DomUtil.create('div', 'w-25 mx-auto text-center');

        titleControl.onAdd = () => this.titleDiv;
        titleControl.addTo(this.leafletMap);
        titleControl.getContainer().parentElement.classList.add('text-center', 'w-100', 'd-flex', 'align-items-start');
    }

    updateTitle({ text, size, color }) {
        this.titleDiv.innerText = text;
        this.titleDiv.style.fontSize = `${size}px`;
        this.titleDiv.style.color = color;
    }

    addOnClickListener() {
        this.leafletMap.on('click', e => {
            const popup = L.popup();
            const popupContent = L.DomUtil.create('div');
            createMarkerButton(this.leafletMap, popupContent, popup, e.latlng);
            createTextButton(this.leafletMap, popupContent, popup, e.latlng);

            popup.setLatLng(e.latlng)
                .setContent(popupContent)
                .openOn(this.leafletMap);
        });
    }

    loadGeoJson(geoJson, legend) {
        const mapGeoJson = L.geoJSON(geoJson, { style: () => ({ color: legend.color }) })
            .bindPopup(layer => `<dl>${Object.entries(layer.feature.properties)
                .map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`)}</dl>`)
            .addTo(this.leafletMap);

        this.leafletMap.fitBounds(mapGeoJson.getBounds());
        this.legend.addLegends([{
            color: legend.color,
            text: legend.text,
            type: geoJson.features[0].geometry.type,
            onClick: () => this.leafletMap.hasLayer(mapGeoJson) ? mapGeoJson.remove() : mapGeoJson.addTo(this.leafletMap)
        }]);
        mapGeoJson.setStyle({ color: legend.color })

        return mapGeoJson;
    }

}
