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
var selectInteraction;
var vectorSource = map.getLayers().item(1).getSource();

function addMarker(coordinate, name, id) {
    var marker = new ol.Feature({
        geometry: new ol.geom.Point(coordinate),
        name: name,
        id: id
    });

    marker.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: 'images/dedeedede.png',
            scale: 0.6,
            anchor: [0.5, 0.7]
        })
    }));

    vectorSource.addFeature(marker);
}

function showToast(message, type = 'info') {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: type === 'error' ? "linear-gradient(to right, #ff5f6d, #ffc371)" :
            type === 'success' ? "linear-gradient(to right, #00b09b, #96c93d)" :
                "linear-gradient(to right, #00b4db, #0083b0)",
    }).showToast();
}


document.getElementById('addPointBtn').addEventListener('click', function () {
    if (selectInteraction) {
        map.removeInteraction(selectInteraction);
    }

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
                                addMarker(coordinate, name, data.id);
                                panel.close();
                                map.removeInteraction(drawInteraction);
                                setupSelectInteraction();
                                showToast('Point added successfully', 'success');
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                showToast('Failed to add point. Check console for details.', 'error');
                            });
                    } else {
                        alert('Please enter a name for the point.');
                    }
                });
            }
        });
    });
});

function queryPoints() {
    fetch('https://localhost:7047/api/point')
        .then(response => response.json())
        .then(data => {
            vectorSource.clear();
            data.forEach(point => {
                addMarker(ol.proj.fromLonLat([point.x, point.y]), point.name, point.id);
            });
            showPointList(data);
            showToast('Points loaded successfully', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Failed to load points. Check console for details.', 'error');
        });
}

function showPointList(points) {
    let content = '<div class="point-list">';
    points.forEach(point => {
        content += `
            <div class="point-item">
                <strong>${point.name}</strong> (${point.x.toFixed(6)}, ${point.y.toFixed(6)})
                <button onclick="viewPoint(${point.id})">View</button>
                <button onclick="updatePoint(${point.id})">Update</button>
                <button onclick="deletePoint(${point.id})">Delete</button>
            </div>
        `;
    });
    content += '</div>';

    if (currentPanel) {
        // Eðer mevcut bir panel varsa, içeriðini güncelle
        currentPanel.setHeaderTitle('Point List');
        currentPanel.content.innerHTML = content;
        currentPanel.resize(400, 400);
    } else {
        // Eðer mevcut panel yoksa, yeni bir panel oluþtur
        currentPanel = jsPanel.create({
            theme: 'primary',
            headerTitle: 'Point List',
            position: 'center',
            contentSize: '400 400',
            content: content,
            onclose: function () {
                currentPanel = null;
            }
        });
    }
}

function viewPoint(id) {
    const feature = vectorSource.getFeatures().find(f => f.get('id') === id);
    if (feature) {
        const coordinate = feature.getGeometry().getCoordinates();
        map.getView().animate({
            center: coordinate,
            zoom: 15,
            duration: 1000
        });
        jsPanel.getPanels().forEach(panel => panel.close());
    }
}

let currentPanel = null;

function updatePoint(id) {
    const feature = vectorSource.getFeatures().find(f => f.get('id') === id);
    if (feature) {
        const coordinate = feature.getGeometry().getCoordinates();
        const lonLat = ol.proj.toLonLat(coordinate);
        const name = feature.get('name');

        if (currentPanel) {
            // Eðer mevcut bir panel varsa, içeriðini güncelle
            currentPanel.setHeaderTitle('Update Point');
            currentPanel.content.innerHTML = `
                <form id="updatePointForm">
                    <label for="x">X:</label>
                    <input type="text" id="x" value="${lonLat[0].toFixed(6)}"><br><br>
                    <label for="y">Y:</label>
                    <input type="text" id="y" value="${lonLat[1].toFixed(6)}"><br><br>
                    <label for="name">Name:</label>
                    <input type="text" id="name" value="${name}" required><br><br>
                    <button type="submit">Update</button>
                </form>
            `;
            setupUpdateFormListener(id, feature, currentPanel);
        } else {
            // Eðer mevcut panel yoksa, yeni bir panel oluþtur
            currentPanel = jsPanel.create({
                theme: 'primary',
                headerTitle: 'Update Point',
                position: 'center',
                contentSize: '300 240',
                content: `
                    <form id="updatePointForm">
                        <label for="x">X:</label>
                        <input type="text" id="x" value="${lonLat[0].toFixed(6)}"><br><br>
                        <label for="y">Y:</label>
                        <input type="text" id="y" value="${lonLat[1].toFixed(6)}"><br><br>
                        <label for="name">Name:</label>
                        <input type="text" id="name" value="${name}" required><br><br>
                        <button type="submit">Update</button>
                    </form>
                `,
                callback: function (panel) {
                    setupUpdateFormListener(id, feature, panel);
                },
                onclose: function () {
                    currentPanel = null;
                }
            });
        }
    }
}

function setupUpdateFormListener(id, feature, panel) {
    document.getElementById('updatePointForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var newX = parseFloat(document.getElementById('x').value);
        var newY = parseFloat(document.getElementById('y').value);
        var newName = document.getElementById('name').value.trim();

        updatePointData(id, newX, newY, newName, feature, panel);
    });
}


function updatePointData(id, newX, newY, newName, feature, panel) {
    fetch(`https://localhost:7047/api/point/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            x: newX,
            y: newY,
            name: newName
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(text => {
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.log('Response is not JSON:', text);
                data = { message: 'Update successful' };
            }
            console.log('Updated:', data);
            feature.getGeometry().setCoordinates(ol.proj.fromLonLat([newX, newY]));
            feature.set('name', newName);
            showToast('Point updated successfully', 'success');
            queryPoints();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Failed to update point. Check console for details.', 'error');
        });
}

function deletePoint(id) {
    if (confirm('Are you sure you want to delete this point?')) {
        fetch(`https://localhost:7047/api/point/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                console.log('Deleted:', text);
                const feature = vectorSource.getFeatures().find(f => f.get('id') === id);
                if (feature) {
                    vectorSource.removeFeature(feature);
                }
                showToast('Point deleted successfully', 'success');
                queryPoints();
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Failed to delete point. Check console for details.', 'error');
            });
    }
}

document.getElementById('queryBtn').addEventListener('click', queryPoints);

function setupSelectInteraction() {
    if (selectInteraction) {
        map.removeInteraction(selectInteraction);
    }

    selectInteraction = new ol.interaction.Select({
        layers: [map.getLayers().item(1)],
        style: new ol.style.Style({
            image: new ol.style.Icon({
                src: 'images/dedeedede.png',
                scale: 0.8,
                anchor: [0.5, 1]
            })
        })
    });

    map.addInteraction(selectInteraction);

    selectInteraction.on('select', function (event) {
        var feature = event.selected[0];
        if (feature) {
            var coordinate = feature.getGeometry().getCoordinates();
            var lonLat = ol.proj.toLonLat(coordinate);
            var name = feature.get('name');
            var id = feature.get('id');

            jsPanel.create({
                theme: 'primary',
                headerTitle: 'Point Details',
                position: 'center',
                contentSize: '300 240',
                content: `
                    <form id="updatePointForm">
                        <label for="x">X:</label>
                        <input type="text" id="x" value="${lonLat[0].toFixed(6)}"><br><br>
                        <label for="y">Y:</label>
                        <input type="text" id="y" value="${lonLat[1].toFixed(6)}"><br><br>
                        <label for="name">Name:</label>
                        <input type="text" id="name" value="${name}" required><br><br>
                        <button type="submit">Update</button>
                        <button type="button" id="dragToUpdateBtn">Drag to Update</button>
                        <button type="button" id="deleteBtn">Delete</button>
                    </form>
                `,
                callback: function (panel) {
                    document.getElementById('updatePointForm').addEventListener('submit', function (e) {
                        e.preventDefault();
                        var newX = parseFloat(document.getElementById('x').value);
                        var newY = parseFloat(document.getElementById('y').value);
                        var newName = document.getElementById('name').value.trim();

                        updatePointData(id, newX, newY, newName, feature, panel);
                    });

                    document.getElementById('dragToUpdateBtn').addEventListener('click', function () {
                        panel.close();

                        var translateInteraction = new ol.interaction.Translate({
                            features: new ol.Collection([feature])
                        });

                        map.addInteraction(translateInteraction);

                        translateInteraction.on('translateend', function (event) {
                            var newCoordinates = event.features.item(0).getGeometry().getCoordinates();
                            var newLonLat = ol.proj.toLonLat(newCoordinates);

                            updatePointData(id, newLonLat[0], newLonLat[1], name, feature);
                            map.removeInteraction(translateInteraction);
                            setupSelectInteraction();
                        });
                    });

                    document.getElementById('deleteBtn').addEventListener('click', function () {
                        deletePoint(id, feature, panel);
                    });
                },
                onclosed: function () {
                    selectInteraction.getFeatures().clear();
                    setupSelectInteraction();
                }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    queryPoints();
    setupSelectInteraction();
});

window.addEventListener('resize', function () {
    map.updateSize();
});