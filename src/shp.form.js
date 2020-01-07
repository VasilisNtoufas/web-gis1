import $ from 'jquery';

import { GeoJsonService } from './geojson.service';
import { setProgress } from './progress.service';

export class ShpForm {

    constructor(mapService) {
        this.shpForm = document.querySelector('#shpForm');
        this.shpFileInput = document.querySelector('#shpFile');
        this.shpFileNameInput = document.querySelector('#shpTitle');
        this.colorInput = document.querySelector('#shpColor');
        this.submitHandler = this.onShpFormSubmit.bind(this);
        this.shpForm.addEventListener('submit', this.submitHandler);
        this.mapService = mapService;
    }

    onShpFormSubmit(e) {
        e.preventDefault();
        const file = this.shpFileInput.files[0];

        if (file && file.name.endsWith('.zip')) {
            $('#newFileModal').modal('hide');
            this.handleZipFile(file);
            this.shpFileInput.classList.remove('is-invalid');
        } else {
            this.shpFileInput.classList.add('is-invalid');
        }

        this.shpForm.removeEventListener('submit', this.submitHandler);
    }

    handleZipFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === FileReader.DONE && !reader.error) {
                new GeoJsonService().data(reader.result)
                    .then(geoJson => geoJsonLayer = this.displayGeoJson(geoJson, this.shpFileNameInput.value || file.name.split('.')[0]));
            }
        };
        reader.addEventListener('progress', event => setProgress(event.loaded, event.total));
        reader.readAsArrayBuffer(file);
    }

    displayGeoJson(geoJson, name) {
        setProgress(100);

        console.log(geoJson);
        
        this.mapService.loadGeoJson(geoJson, {text: name, color: this.colorInput.value});
    }

}
