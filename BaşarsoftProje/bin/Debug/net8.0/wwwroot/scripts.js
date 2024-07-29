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

var drawInteraction;
var vectorSource = map.getLayers().item(1).getSource();

function addMarker(coordinate, name) {
    var marker = new ol.Feature({
        geometry: new ol.geom.Point(coordinate),
        name: name
    });

    marker.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({ color: 'red' }),
            stroke: new ol.style.Stroke({ color: 'white', width: 2 })
        })
    }));

    vectorSource.addFeature(marker);
}

document.getElementById('addPointBtn').addEventListener('click', function () {
    if (drawInteraction) {
        map.removeInteraction(drawInteraction);
    }

    drawInteraction = new ol.interaction.Draw({
        source: vectorSource,
        type: 'Point'
    });

    map.addInteraction(drawInteraction);

    drawInteraction.on('drawend', function (event) {
        var coordinate = event.feature.getGeometry().getCoordinates();
        var lonLat = ol.proj.toLonLat(coordinate);

        jsPanel.create({
            theme: 'primary',
            headerTitle: 'Add Point',
            position: 'center',
            contentSize: '300 200',
            content: `
                <form id="pointForm">
                    <label for="x">X:</label>
                    <input type="text" id="x" value="${lonLat[0].toFixed(6)}" readonly><br><br>
                    <label for="y">Y:</label>
                    <input type="text" id="y" value="${lonLat[1].toFixed(6)}" readonly><br><br>
                    <label for="name">Name:</label>
                    <input type="text" id="name" required><br><br>
                    <button type="submit">Save</button>
                </form>
            `,
            callback: function (panel) {
                document.getElementById('pointForm').addEventListener('submit', function (e) {
                    e.preventDefault();
                    var name = document.getElementById('name').value.trim();
                    if (name) {
                        fetch('https://localhost:7047/api/point', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                x: parseFloat(lonLat[0].toFixed(6)),
                                y: parseFloat(lonLat[1].toFixed(6)),
                                name: name
                            })
                        })
                            .then(response => {
                                if (!response.ok) {
                                    return response.json().then(err => { throw err; });
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('Success:', data);
                                addMarker(coordinate, name);
                                panel.close();
                                map.removeInteraction(drawInteraction);
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                alert('Failed to add point. Check console for details.');
                            });
                    } else {
                        alert('Please enter a name for the point.');
                    }
                });
            }
        });
    });
});

document.getElementById('queryBtn').addEventListener('click', function () {
    fetch('https://localhost:7047/api/point')
        .then(response => response.json())
        .then(data => {
            data.forEach(point => {
                addMarker(ol.proj.fromLonLat([point.x, point.y]), point.name);
            });
        })
        .catch(error => console.error('Error:', error));
});

window.addEventListener('resize', function () {
    map.updateSize();
});