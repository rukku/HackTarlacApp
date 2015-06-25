var map3, featureList, Boundariesearch = [], Toursearch = [], Trailssearch = [];

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

$(document).on("mouseover", ".feature-row", function(e) {
  highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
});

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#contact-btn").click(function() {
  $("#contactModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(Boundaries.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});


$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();

  map.invalidateSize();
});

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);

  var type = layer.feature.geometry.type;

  if(type === "Point"){
    //For Point
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  }else if (type === "MultiLineString"){
    //for MultiLineString
    map.setView([layer.getBounds().getCenter().lat, layer.getBounds().getCenter().lng], 15);  
  }


  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();

/* Loop through Trails layer and add only features which are in the map bounds */
  Trails.eachLayer(function (layer) {
    if (map.hasLayer(TrailLayer)) {
      if (map.getBounds().contains(layer.getBounds().getCenter())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getBounds().getCenter().lat + '" lng="' + layer.getBounds().getCenter().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/eco.png"></td><td class="feature-name">' + layer.feature.properties.group + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });

/* Loop through Tour layer and add only features which are in the map bounds */
  Tours.eachLayer(function (layer) {
    if (map.hasLayer(TourLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/Tourism.png"></td><td class="feature-name">' + layer.feature.properties.Destination + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });


  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["otile1", "otile2", "otile3", "otile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});
var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
 subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

var Boundaries = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "#FE5A27",
      fill: false,
      opacity: 1,
      clickable: false,
      weight: 3
    };
  },
  onEachFeature: function (feature, layer) {
    Boundariesearch.push({
      name: layer.feature.properties.boroName,
      source: "Boundaries",
      id: L.stamp(layer),
      bounds: layer.getBounds()
    });
  }
});
$.getJSON("geojson_tarlac/tarlac_muni_boundaries.geojson", function (data) {
  Boundaries.addData(data);
});


/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

  /* Empty layer placeholder to add to layer control for listening when to add/remove Investments to markerClusters layer */
  var TourLayer = L.geoJson(null);
  var Tours = L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
        icon: L.icon({
          iconUrl: "assets/img/Tourism.png",
          iconSize: [24, 28],
          iconAnchor: [12, 28],
          popupAnchor: [0, -25]
        }),
        title: feature.properties.Destination,
        riseOnHover: true
      });
    },
    onEachFeature: function (feature, layer) {
      if (feature.properties) {
        var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Destination</th><td>" + feature.properties.Destination + "</td></tr>" + "<tr><th>Accommodation</th><td>" + feature.properties.Accommodation + "</td></tr>"+"<tr><th>Contact</th><td>" + feature.properties.Contact + "</td></tr>"+"<tr style="+'"'+"height:100px;"+'"'+"><th>Fees</th><td style="+'"'+"word-wrap:break-word;overflow-y:visible;"+'"'+">" + feature.properties.Fees + "</td></tr>" + "<table>";
        layer.on({
          click: function (e) {
            $("#feature-title").html(feature.properties.Destination);
            $("#feature-info").html(content);
            $("#featureModal").modal("show");
            highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
          }
        });
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/eco.png"></td><td class="feature-name">' + layer.feature.properties.name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
          Toursearch.push({
            name: layer.feature.properties.Destination,
             address: layer.feature.properties.Location,
             source: "Tours",
             id: L.stamp(layer),
             lat: layer.feature.geometry.coordinates[1],
             lng: layer.feature.geometry.coordinates[0]
       });
      }
    }
  });
  $.getJSON("geojson_tarlac/tourinfo.geojson", function (data) {
    Tours.addData(data);
    map.addLayer(TourLayer);
  });

var TrailLayer = L.geoJson(null);
var Trails = L.geoJson(null, {
  style: function (feature) {
    if (feature.properties.route_id === "0") {
      return {
        color: "#F400D9",
        weight: 3,
        opacity: 1
      };
    }
    if (feature.properties.route_id === "1") {
      return {
        color: "#F98300",
        weight: 3,
        opacity: 1
      };
    }
    if (feature.properties.route_id === "2") {
      return {
        color: "#0632FF",
        weight: 3,
        opacity: 1
      };
    }
    if (feature.properties.route_id === "3") {
      return {
        color: "#F7ED31",
        weight: 3,
        opacity: 1
      };
    }
    if (feature.properties.route_id === "4") {
      return {
        color: "#F09F2E",
        weight: 3,
        opacity: 1
      };
    }
    if (feature.properties.route_id === "5") {
      return {
        color: "#30BEFF",
        weight: 3,
        opacity: 1
      };
    }
    if (feature.properties.route_id === "6") {
      return {
        color: "#FF6BD5",
        weight: 3,
        opacity: 1
      };
    }
    if (feature.properties.route_id === "7") {
      return {
        color: "#6e6e6e",
        weight: 3,
        opacity: 1
      };
    }
    if (feature.properties.route_id === "8") {
      return {
        color: "#976900",
        weight: 3,
        opacity: 1
      };
    }
    if (feature.properties.route_id === "9") {
      return {
        color: "#969696",
        weight: 3,
        opacity: 1
      };
    }
    if (feature.properties.route_id === "10") {
      return {
        color: "#ffff00",
        weight: 3,
        opacity: 1
      };
    }
    if (feature.properties.route_id === "11") {
      return {
        color: "#131723",
        weight: 3,
        opacity: 1
      };
    }
  },
   pointToLayer: function (feature, latlng) {
    return L.marker([layer.getBounds().getCenter().lat, layer.getBounds().getCenter().lng], {
      icon: L.icon({
        iconUrl: "assets/img/eco.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.group,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Trail Name</th><td>" + feature.properties.group + "</td></tr>" + "<tr><th>Distance</th><td>" + feature.properties.length + "</td></tr>" + "<table>";
        layer.on({
          click: function (e) {
            $("#feature-title").html(feature.properties.group);
            $("#feature-info").html(content);
            $("#featureModal").modal("show");
            
            var centerIndex = Math.floor(layer.feature.geometry.coordinates[0].length / 2);

            console.log(centerIndex);

            highlight.clearLayers().addLayer(L.circleMarker([layer.feature.geometry.coordinates[0][centerIndex][1],layer.feature.geometry.coordinates[0][centerIndex][0]], highlightStyle));

          }
        });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getBounds().getCenter().lat + '" lng="' + layer.getBounds().getCenter().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/eco.png"></td><td class="feature-name">' + layer.feature.properties.group + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
           
          var centerIndex = Math.floor(layer.feature.geometry.coordinates[0].length / 2);


           Trailssearch.push({
              name: layer.feature.properties.group,
              address: layer.feature.properties.length,
              source: "Trails",
              id: L.stamp(layer),
              lat: layer.feature.geometry.coordinates[0][centerIndex][1],
              lng: layer.feature.geometry.coordinates[0][centerIndex][0]
      });
    }
  }
});
$.getJSON("geojson_tarlac/route8.geojson", function (data) {
  Trails.addData(data);
  map.addLayer(TrailLayer);
});

map = L.map("map3", {
  zoom: 10,
  center: [15.48889, 120.5986],
  layers: [mapquestOSM, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === TrailLayer) {
    markerClusters.addLayer(Trails);
    syncSidebar();
  }
  if (e.layer === TourLayer) {
    markerClusters.addLayer(Tours);
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === TrailLayer) {
    markerClusters.removeLayer(Trails);
    syncSidebar();
  }
  if (e.layer === TourLayer) {
    markerClusters.removeLayer(Tour);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": mapquestOSM,
  "Aerial Imagery": mapquestOAM,
  "Imagery with Streets": mapquestHYB
};

var groupedOverlays = {
    "Reference": {
    "Boundaries": Boundaries
  },
  "Points of Interest": {
    "<img src='assets/img/eco.png' width='24' height='28'>&nbsp;Eco Trail": TrailLayer,
    "<img src='assets/img/Tourism.png' width='24' height='28'>&nbsp;Places to See": TourLayer,
  }

};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);


  var url = 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',
            attr ='Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            service = new L.TileLayer(url, {subdomains:"1234",attribution: attr});

            var el = L.control.elevation({position: "bottomleft"});
            el.addTo(map);

            var g=new L.GPX("data/trailsgpx09.gpx", {
              async: true,
              marker_options: {
                  startIconUrl: 'assets/leaflet-gpx/pin-icon-start.png',
                  endIconUrl: 'assets/leaflet-gpx/pin-icon-end.png',
                  shadowUrl: 'assets/leaflet-gpx/pin-shadow.png'
                }
            });
            g.on('loaded', function(e) {
                  map.fitBounds(e.target.getBounds());
            });
            g.on("addline",function(e){
              el.addData(e.line);
            });
            g.addTo(map);
            map.addLayer(service);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  /* Fit map to Boundaries bounds */
  map.fitBounds(Boundaries.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var BoundariesBH = new Bloodhound({
    name: "Boundaries",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: Boundariesearch,
    limit: 10
  });

  var TrailBH = new Bloodhound({
    name: "Trails",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: Trailssearch,
    limit: 10
  });

  var TourBH = new Bloodhound({
    name: "Tours",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: Toursearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });

  TrailBH.initialize();
  TourBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Boundaries",
    displayKey: "name",
    source: BoundariesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Boundaries</h4>"
    }
  },{
    name: "Trails",
    displayKey: "name",
    source: TrailBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/eco.png' width='24' height='28'>&nbsp;Trails</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  },{
    name: "Tours",
    displayKey: "name",
    source: TourBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/Tourism.png' width='24' height='28'>&nbsp;Places to See</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  },{
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Boundaries") {
      map.fitBounds(datum.bounds);
    }
    if (datum.source === "Trails") {
      if (!map.hasLayer(TrailLayer)) {
        map.addLayer(TrailLayer);
      }
      map.setView([datum.lat, datum.lng], 15);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "Tours") {
      if (!map.hasLayer(TourLayer)) {
        map.addLayer(TourLayer);
      }
      map.setView([datum.lat, datum.lng], 15);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});
