// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

//Define function for radius size. Based this off magnitude
function markerSize(magnitude) {
return magnitude * 3;
};

var earthquakeLayer = new L.LayerGroup()

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get Response, send the data.features object to the createFeatures function
    L.geoJSON(data.features, {
        pointTolayer: function(earthquakeData, latlng) {
            return L.circleMarker(latlng, {radius: markerSize(earthquakeData.properties.mag)});
        },

        style: function (earthquakeDatastyle) {
            return{
                fillColor: magColor(earthquakeDatastyle.properties.mag),
                fillOpacity: 0.7,
                weight: 0.1,
                color: 'black'
            }
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place + 
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        }

    }).addTo(earthquakeLayer);
});// create a layer group for faultlines
var plateLayer = new L.LayerGroup();

// perform a GET request to the query URL: platesUrl
d3.json(platesUrl, function (geoJson) {
    // once we get a response, send the geoJson.features array of objects object to the L.geoJSON method
    L.geoJSON(geoJson.features, {
        style: function (geoJsonFeature) {
            return {
                weight: 1,
                color: 'brown'
            }
        },
    }).addTo(plateLayer);
});



    //Function to set circle color based on magnitude
// create a fuction to change color by magnitude
function magColor(mag) {
    return mag > 8 ? "#800026":
            mag > 7 ? "#bd0026":
            mag > 6 ? "#e31a1c":
            mag > 5 ? "#fc4e2a":
            mag > 4 ? "#fd8d3c":
            mag > 3 ? "#feb24c":
            mag > 2 ? "#fed976":
            mag > 1 ? "#ffeda0":
                      "#ffffcc";
};

function createMap() {
    //Define streetmap, darkmap, and outdoorsmap layers
    var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.satellite",
            accessToken: API_KEY
    });

    var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.light",
            accessToken: API_KEY
    });


    //Define baseMaps object to hold base layers
    var baseMaps = {
        "Outdoor Map": outdoorsmap,
        "Satellite Map": satellitemap,
        "grayscale Map": grayscalemap
    };

    //Define overlay object to hold overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakeLayer,
        "Plate Boundaries": plateLayer,
    };

    //Create map giving it the streetmap and earthquakes layers to display and load
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [outdoorsmap, earthquakeLayer]
    })

    //Create a layer control
    // Pass in our baseMaps and overlayMaps
    //Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Add legend to the map
    var legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function (map) {
    
        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [0, 1, 2, 3, 4, 5, 6, 7, 8],
            labels = [];
    
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + magColor(magnitudes[i] + 1) + '"></i> ' +
                magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
        }
        return div;
    };  
    legend.addTo(myMap);
};

createMap();