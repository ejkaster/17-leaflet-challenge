
const myMap = L.map("map").setView([45.50, -122.67], 3.5);

// Dark Layer
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/dark-v10",
  accessToken: API_KEY
}).addTo(myMap);


// Load JSON Data
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});

  
  // Legend Color Key
  function getColor(d) {
  return d > 1000? '#a50f15' :
    d > 750? '#de2d26' :
    d > 500? '#fb6a4a' :
    d > 250? '#fcae91' :
            '#fee5d9';
}

  // Create Legend
  let legend = L.control({position: "bottomright"});
  legend.onAdd = function(myMap) {
    let div = L.DomUtil.create('div', 'info legend');
    let labels = ["0-250",  "250-500", "500-750", "750-1000", "1000+"];
    let grades = [250, 251, 501, 751, 1000];
    div.innerHTML = '<div class="legend-title">EQ Significance</br><hr></div>';
    for(let i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background:" + getColor(grades[i])
      + "'>&nbsp;&nbsp;</i>" + labels[i] + '<br/>';
    }
    return div;
  }
  
  legend.addTo(myMap);
  
  // Create Time function for converting
  function toDateTime(secs) {
    var t = new Date(1970, 0, 1);
    t.setSeconds(secs);
    return t;
  }
  
  function createMarkers(response) {
    
    // Pull the "stations" property off of response.data
    const earthquakes = response.features;  
  
  // Loop through the stations array
    const earthquakesMarkers = earthquakes.map( earthquake => {
      // Assign colors to certain value ranges
      let circleColor = "";
        if (earthquake.properties.sig > 1000) {
          circleColor = '#a50f15';
        }
        else if (earthquake.properties.sig > 500) {
          circleColor = "#de2d26";
        }
        else if (earthquake.properties.sig > 250) {
          circleColor = "#fb6a4a";
        }
        else if (earthquake.properties.sig > 100) {
          circleColor = "#fcae91";
        }
        else {
          circleColor = "#fee5d9";
        }
  
      // For each station, create a marker and bind a popup with the station's name
      return L.circle(([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]]), {
        fillOpacity: 0.5,
        color: "",
        fillColor: circleColor,
        radius: ((earthquake.properties.mag)*30000)
      }).bindPopup(`<h3> Earthquake: ${earthquake.properties.place}</h3><hr>
                <h4>Time: ${earthquake.properties.time/1000}</h4><hr> 
                <h4>Magnitude:  ${earthquake.properties.mag}</h4><hr> 
                <h4>Significance: ${earthquake.properties.sig}</h4>`);
     });
  
    // Create a layer group made from the bike markers array, pass it into the createMap function
    L.layerGroup(earthquakeMarkers).addTo(myMap);
  }
  
  // Call the data and create markers function together
  d3.json(queryUrl, createMarkers);