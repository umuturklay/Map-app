var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        new ol.layer.Vector({
            source: new ol.source.Vector()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([35.2433, 38.9637]),
        zoom: 7
    })
});

function addMarker(coordinate, name) {
    var marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinate)),
        name: name
    });

    marker.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({ color: 'red' }),
            stroke: new ol.style.Stroke({ color: 'white', width: 2 })
        })
    }));

    var vectorSource = map.getLayers().item(1).getSource();
    vectorSource.addFeature(marker);
}

fetch('/api/point')
    .then(response => response.json())
    .then(data => {
        data.forEach(point => {
            addMarker([point.x, point.y], point.name);
        });
    })
    .catch(error => console.error('Error:', error));

document.getElementById('addPointBtn').addEventListener('click', function () {
    var coordinate = map.getView().getCenter();
    var lonLat = ol.proj.toLonLat(coordinate);
    var name = 'New Point';
    addMarker(lonLat, name);

    fetch('/api/point', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            x: lonLat[0],
            y: lonLat[1],
            name: name
        })
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
});

document.getElementById('queryBtn').addEventListener('click', function () {
    fetch('/api/point')
        .then(response => response.json())
        .then(data => {
            data.forEach(point => {
                addMarker([point.x, point.y], point.name);
            });
        })
        .catch(error => console.error('Error:', error));
});

window.addEventListener('resize', function () {
    map.updateSize();
});
