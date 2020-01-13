import shp from 'shpjs';

export class GeoJsonService {

    data(data) {
        return shp(data).catch(() => alert('Error trying to parse SHP file'));
    }

    colorize(data, property, colors) {
        data.features.sort((a, b) => b[property] - a[property])
            .forEach((feature, index) => feature.properties.customColor = colors[Math.floor(colors.length / index)]);

        return data;
    }

}
