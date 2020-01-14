import shp from 'shpjs';

export class GeoJsonService {

    data(data) {
        return shp(data).catch(() => alert('Error trying to parse SHP file'));
    }

    colorize(data, property, colors) {
        data.features.sort((a, b) => a.properties[property] - b.properties[property])
            .forEach((feature, index, array) => feature.properties.customColor = colors[Math.floor(index / (array.length / colors.length))]);

        return data;
    }

}
