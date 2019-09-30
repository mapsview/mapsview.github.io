var mymap = L.map('map').setView([49.1249712, 8.5844108], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {
    foo: 'bar'
}).addTo(mymap);

var current;
var clickPop;
var bike;
var bikeAmount;

var latlngcur;

function getLocation() {
    var redIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var blueIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    navigator.geolocation.getCurrentPosition(function(location) {
        latlngcur = new L.LatLng(location.coords.latitude, location.coords.longitude);

        current = L.marker(latlngcur, {
            icon: redIcon
        }).addTo(mymap);
        current.bindPopup("Aktuelle Position:" + latlngcur).openPopup();

        mymap.setView(latlngcur);

        EasterEgg();
        ServerRequest();
    })
}

function onMapClick(e) {
    var greenIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    clickPop = L.marker(e.latlng, {
        icon: greenIcon
    }).addTo(mymap);
    clickPop.bindPopup("Position: " + e.latlng + " .<a id='popbtn' href='https://www.theuselessweb.com'>Route</a>");

    var control = L.Routing.control({
        waypoints: [
            L.latLng(latlngcur),
            L.latLng(e.latlng)
        ],
        routeWhileDragging: true
    }).addTo(mymap);
    //control.route({costring: "pedestrian"});
}
mymap.on('click', onMapClick);

function EasterEgg() {
    var blackIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    var httf = L.marker([48.7994019, 9.8045704], {
        icon: blackIcon
    }).addTo(mymap);
    httf.bindPopup("<a href='https://www.hacktothefuture.de/de/startseite/httf-schwaebisch-gmuend' target='_blank'>Hack To The Future</a>").openPopup();
}

function ServerRequest() {
    console.log("ServerRequest called");
    $.getJSON("http://10.10.11.99:7000/data?key=ucuyic", function(data) {
        bikeAmount = data.data;
        console.log(bikeAmount);
        bike = new L.marker([49.0068901, 8.4036527]).addTo(mymap);
        console.log(bikeAmount);
        if (bikeAmount != 0) {
            bike.bindPopup("Fahrradstation | Übrige: " + bikeAmount + " | <a id='reservebtn' onclick='RentRequest();'>Reservieren</a>");
        } else {
            bike.bindPopup("Fahrradstationen | Keine verfügbaren Fahrräder (" + bikeAmount + ")");
        }
    });
}

function updateBikePopup() {
    if (bikeAmount != 0) {
        bike.bindPopup("Fahrradstation | Übrige: " + bikeAmount + " | <a id='reservebtn' onclick='RentRequest();'>Reservieren</a>")
    } else {
        bike.bindPopup("Fahrradstationen | Keine verfügbaren Fahrräder (" + bikeAmount + ")");
    }
}

function RentRequest() {
    console.log("RentRequest called");
    $.ajax({
        url: 'http://10.10.11.99:7000/rentbike',
        type: 'PUT',
        success: function(data) {
            if (data.data == -1) // ERROR
                console.log("ERROR");
            else {
                //SUCCESS 
                console.log("SUCCESS");
                updateBikePopup();
                alert("Fahrrad wurde reserviert");
            }
        }
    });
}