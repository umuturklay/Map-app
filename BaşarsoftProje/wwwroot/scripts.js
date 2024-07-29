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

fetch(`https://localhost:7047/api/point`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        data.forEach(point => {
            addMarker([point.x, point.y], point.name);
        });
    })
    .catch(error => console.error('Error:', error));

var isAddingPoint = false;
var currentCoordinate = null;

// Modal elements
var modal = document.getElementById('addPointModal');
var span = document.getElementsByClassName('close')[0];
var submitPointBtn = document.getElementById('submitPoint');
var pointNameInput = document.getElementById('pointName');

// Open modal on "Add Point" button click
document.getElementById('addPointBtn').addEventListener('click', function () {
    isAddingPoint = true;
    document.getElementById('map').classList.add('cursor-crosshair');
});

// Handle map click event
map.on('click', function (event) {
    if (isAddingPoint) {
        currentCoordinate = event.coordinate;
        modal.style.display = 'block'; // Show the modal
    }
});

// Close modal when user clicks on <span> (x)
span.onclick = function () {
    modal.style.display = 'none';
    isAddingPoint = false;
    document.getElementById('map').classList.remove('cursor-crosshair');
};

// Close modal when user clicks outside of the modal
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        isAddingPoint = false;
        document.getElementById('map').classList.remove('cursor-crosshair');
    }
};

// Handle submit button click
submitPointBtn.addEventListener('click', function () {
    var name = pointNameInput.value.trim();
    if (name) {
        var lonLat = ol.proj.toLonLat(currentCoordinate);
        fetch(`https://localhost:7047/api/point`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                x: Math.round(lonLat[0]),
                y: Math.round(lonLat[1]),
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
                addMarker(lonLat, name);
                modal.style.display = 'none';
                isAddingPoint = false;
                document.getElementById('map').classList.remove('cursor-crosshair');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to add point. Check console for details.');
            });
    } else {
        alert('Please enter a name for the point.');
    }
});

document.getElementById('queryBtn').addEventListener('click', function () {
    fetch('https://localhost:7047/api/point')
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
