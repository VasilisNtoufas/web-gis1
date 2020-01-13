import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import * as L from 'leaflet';
import 'leaflet-defaulticon-compatibility';
import 'leaflet.browser.print/dist/leaflet.browser.print.min';

import { Legend } from './legend';
import { createMarkerButton, createTextButton } from './marker';
import north from './north.png';

export class MapService {

    constructor() {
        this.leafletMap = L.map('map').setView([38.5698109, 23.6563387], 7);

        this.addAttribution();
        this.addScale();
        this.addNorth();
        this.addTitle();
        this.addLegend();
        this.addPrint();
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
        this.printNorthControl = L.control();
        let img;

        function onNorthAdd() {
            img = L.DomUtil.create('img', 'float-right');
            img.style.width = '150px';
            img.setAttribute('src', north);

            return img;
        };
        northControl.onAdd = onNorthAdd;
        this.printNorthControl.onAdd = onNorthAdd;

        northControl.addTo(this.leafletMap);
    }

    addPrint() {
        L.control.browserPrint().addTo(this.leafletMap);
        this.leafletMap.on('browser-print-start', e => {
            this.printNorthControl.addTo(e.printMap);
            const printLegend = new Legend(e.printMap);
            this.legend.legends.forEach(mapLegend => printLegend.addLegend(mapLegend));
            const printTitle = L.control({ position: 'topright' });
            printTitle.onAdd = () => this.titleDiv;
            printTitle.addTo(e.printMap);
            printTitle.getContainer().parentElement.classList.add('text-center', 'w-100', 'd-flex', 'align-items-start', 'justify-content-end');
            L.control.scale().addTo(e.printMap);
        });
    }

    addTitle() {
        const titleControl = L.control({ position: 'topright' });
        this.titleDiv = L.DomUtil.create('div', 'w-25 mx-auto text-center position-absolute');
        this.titleDiv.style.left = 0;
        this.titleDiv.style.top = 0;
        this.titleDiv.style.right = 0;

        titleControl.onAdd = () => this.titleDiv;
        titleControl.addTo(this.leafletMap);
        titleControl.getContainer().parentElement.classList.add('text-center', 'w-100', 'd-flex', 'align-items-start', 'justify-content-end');
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
        const mapGeoJson = L.geoJSON(geoJson, { style: feature => {
            const g = ({ color: feature.properties.customColor.color || legend.color });
            console.log(g, feature.properties.eqGroup);
            return g;
        } })
            .bindPopup(layer => `<dl>${Object.entries(layer.feature.properties)
                .map(([key, value]) => `<dt>${key}</dt><dd>${value}</dd>`)}</dl>`)
            .addTo(this.leafletMap);

        this.leafletMap.fitBounds(mapGeoJson.getBounds());
        this.legend.addLegend({
            color: legend.color,
            text: legend.text,
            type: geoJson.features[0].geometry.type,
            onClick: () => this.leafletMap.hasLayer(mapGeoJson) ? mapGeoJson.remove() : mapGeoJson.addTo(this.leafletMap)
        });
        mapGeoJson.setStyle({ color: legend.color })

        return mapGeoJson;
    }

    getColor(d) {
        return d > 5
            ? '#800026'
            : d > 4
                ? '#BD0026'
                : d > 3
                    ? '#E31A1C'
                    : d > 2
                        ? '#FC4E2A'
                        : d > 1
                            ? '#FD8D3C'
                            : d > 0 ? '#FEB24C'
                                : d > -1
                                    ? '#FED976'
                                    : '#FFEDA0';
    }

}
