var watchLocation = true;
var focused = true;
var focusButton;
var watchId;
var carMarker;
var routingPoints = new Array();
var searchControl;
var gLocation;

var geocodeService = L.esri.Geocoding.geocodeService();

function routeToHere(lat, lng) {
  routingPoints[0] = L.latLng([
    gLocation.coords.latitude,
    gLocation.coords.longitude,
  ]);
  routingPoints.push(L.latLng([lat, lng]));
  reRoute();
}

function gotLocation(location) {
  gLocation = location;
  if (watchLocation) {
    if (carMarker != null) {
      map.removeLayer(carMarker);
    }
    /*carMarker = L.marker([location.coords.latitude, location.coords.longitude])
      .bindPopup()
      .addTo(map);*/
    geocodeService
      .reverse()
      .latlng(L.latLng([location.coords.latitude, location.coords.longitude]))
      .run(function (error, result) {
        if (error) {
          carMarker = L.marker([
            location.coords.latitude,
            location.coords.longitude,
          ])
            .bindPopup()
            .addTo(map);
        } else {
          carMarker = L.marker(result.latlng)
            .addTo(map)
            .bindPopup("<b>Ihr Standort:</b><br>" + result.address.Match_addr);
        }
      });
    if (focused) {
      map.setView([location.coords.latitude, location.coords.longitude], 13);
      $(".easy-button-container").addClass("display-none");
      focused = true;
    } else {
      $(".easy-button-container").removeClass("display-none");
    }
  }
}

function getLocation() {
  if (navigator.geolocation) {
    if (watchLocation) {
      watchId = navigator.geolocation.watchPosition(gotLocation, null, {
        timeout: 100,
      });
    } else {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      navigator.geolocation.getCurrentPosition(gotLocation);
    }
  }
}

function reRoute() {
  for (var i = 1; i < routingPoints.length; i++) {
    L.Routing.control({
      waypoints: [routingPoints[i - 1], routingPoints[i]],
      routeWhileDragging: true,
      geocoder: L.Control.Geocoder.nominatim(),
    }).addTo(map);
  }
}

//var map = L.map("map").setView([0, 0], 13);

/*L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);*/

var normalMap = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

var satelliteMap = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

var openTopoMap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

var cycloOSM = L.tileLayer(
  "https://dev.{s}.tile.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

var map = L.map("map", {
  center: [0, 0],
});

var baseMaps = {
  OpenStreetMap: normalMap,
  "Esri Satellit": satelliteMap,
  OpenTopoMap: openTopoMap,
  CycloOSM: cycloOSM,
};

normalMap.addTo(map);

L.control.layers(baseMaps, null).addTo(map);

focusButton = L.easyButton("fas fa-crosshairs", function (btn, map) {
  focused = true;
  map.setView([gLocation.coords.latitude, gLocation.coords.longitude], 13);
  $(".easy-button-container").addClass("display-none");
}).addTo(map);

searchControl = L.Control.geocoder({
  defaultMarkGeocode: false,
}).addTo(map);

searchControl.on("markgeocode", function (e) {
  console.log(e);
  var bbox = e.geocode.bbox;
  var poly = L.polygon([
    bbox.getSouthEast(),
    bbox.getNorthEast(),
    bbox.getNorthWest(),
    bbox.getSouthWest(),
  ]).addTo(map);
  geocodeService
    .reverse()
    .latlng(e.geocode.center)
    .run(function (error, result) {
      if (error) {
        alert(error);
      } else {
        var marker = L.marker(result.latlng)
          .bindPopup(
            result.address.Match_addr +
              "<br><a href='#' onclick='routeToHere(" +
              result.latlng.lat +
              ", " +
              result.latlng.lng +
              ");'>Route nach hier</a>"
          )
          .on("popupclose", function (e) {
            map.removeLayer(marker);
            map.removeLayer(poly);
          })
          .addTo(map)
          .openPopup();
      }
    });
  map.fitBounds(poly.getBounds());
});

map.on("click", function (e) {
  geocodeService
    .reverse()
    .latlng(e.latlng)
    .run(function (error, result) {
      if (error) {
        alert("Es ist ein Fehler aufgetreten!");
      } else {
        var marker = L.marker(result.latlng)
          .bindPopup(
            result.address.Match_addr +
              "<br><a href='#' onclick='routeToHere(" +
              result.latlng.lat +
              ", " +
              result.latlng.lng +
              ");'>Route nach hier</a>"
          )
          .on("popupclose", function (e) {
            map.removeLayer(marker);
          })
          .addTo(map)
          .openPopup();
      }
    });
});

map.on("movestart", function (e) {
  focused = false;
  $(".easy-button-container").removeClass("display-none");
});

getLocation();
