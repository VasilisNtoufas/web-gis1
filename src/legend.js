export class Legend {

  constructor(map) {
    this.legendControl = L.control({ position: 'bottomright' });
    const legendContainer = L.DomUtil.create('div', 'info legend');
    legendContainer.innerHTML = '<h4>Legend</h4>';
    this.legend = L.DomUtil.create('ul', 'list-unstyled', legendContainer);
    this.legendControl.onAdd = () => legendContainer;
    this.map = map;
  }

  addLegends(legendValues) {
    legendValues.forEach(value => L.DomUtil.create('li', null, this.legend).innerHTML = `<i style="background-color: ${value.color}"></i> ${value.text}`);

    if (!this.legendControl.getContainer()) {
      this.legendControl.addTo(this.map);
    }
  }

}
