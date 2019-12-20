import shp from 'shpjs';
import colorbrewer from 'colorbrewer';

export class GeoJsonService {

    data(data) {
        return shp(data)
            .then(geoJson => (Array.isArray(geoJson) ? geoJson : [geoJson]).forEach(geo => this.json([geo, geo.fileName, true], true)))
            .catch(error => console.error('Error trying to parse SHP file', error));
    }

    color(s) {
        return colorbrewer.Spectral[11][Math.abs(JSON.stringify(s).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % 11];
    }

    makeString(buffer) {
        return new Uint8Array(buffer).map(item => String.fromCharCode(item)).join('');
    }

    json(data) {
        const name = data[1];
        const json = data.length === 2 ? JSON.parse(this.makeString(data[0])) : data[0];
        console.log(name, json);

        if (json.type === 'Topology') {
            console.log('Topology');
            // json.objects.forEach(nom => this.layer(topojson.feature(json, json.objects[nom]), nom))
        } else {
            this.layer(json, name);
        }
    }

    layer(json, name) {
        json.features.forEach(feature => feature.properties.__color__ = this.color(feature));
        // this.fire('json', [json, name]);
    }

}
