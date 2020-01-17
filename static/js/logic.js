// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get Response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    //Function is defined to run each feature in the features array
    //Popup describing the place and time of the earthquale is created.
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + 
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    //Define function for radius size. Based this off magnitude
    function radiusSize(magnitude) {
        return magnitude * 20000;
    }

    //Function to set circle color based on magnitude
    function circleColor(magnitude) {
        if (magnitude < 1) {
          return "white"
        }
        else if (magnitude < 2) {
          return "yellow"
        }
        else if (magnitude < 3) {
          return "green"
        }
        else if (magnitude < 4) {
          return "orange"
        }
        else if (magnitude < 5) {
          return "red"
        }
        else {
          return "gray"
        }
      }

    //Created a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        pointTolayer: function(earthquakeData, latlng) {
            return L.circle(latlng, {
                radius: radiusSize(earthquakeData.properties.mag),
                color: circleColor(earthquakeData.properties.mag),
                fillOpacity: 1
            });
        },
        onEachFeature: onEachFeature
    });

    //Send earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
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
        Earthquakes: earthquakes
    
    };

    //Create map giving it the streetmap and earthquakes layers to display and load
    var myMap = L.map("map", {
        center: [
           37.09, -95.71 
        ],
        zoom: 5,
        layers: [outdoorsmap, earthquakes]
    });

    //Create a layer control
    // Pass in our baseMaps and overlayMaps
    //Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

}

// color function to be used when creating the legend
function getColor(c) {
    return c > 5  ? 'red' :
           c > 4  ? 'orange' :
           c > 3  ? 'green' :
           c > 2  ? 'yellow' :
           c > 1  ? 'white' :
                    'gray';
  }

  // Add legend to the map
  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          mags = [0, 1, 2, 3, 4, 5],
          labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < mags.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
              mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(myMap);
