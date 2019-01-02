//Source: http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f

var leafletData = [];

var format = d3.format(",");

//define tooltips for countries
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function(d) {
        return "<strong>" + d.properties.name + "</strong>";
    });

//define tooltip for carrarmati
var carrarmato = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "<strong>" + d.name + "</strong>" +
            "<span class='details'>" + "<br>" +
            d.city + ", " + d.region + "<br>" +
            d.country                + "<br>" +
            d.function               +
            "</span>";
    });

//set margins
var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 910 - margin.left - margin.right, //840
    height = 600 - margin.top - margin.bottom; //575

//set up main svg container for map
var svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g')
    .attr('class', 'map');

//set up background rectangle to provide field color
svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    //.attr("fill", "#555555");
    .attr("fill", "#000000");

var projection = d3.geoMercator()
//var projection = d3.geoEquirectangular()
    .scale(145)
    .translate( [width / 2, height / 1.44]); // adjust width & height denominator for custom map fit

var path = d3.geoPath().projection(projection);

//follow target for tooltips
svg.append('circle').attr('id', 'followTarget');

//add tooltips
svg.call(tip);
svg.call(carrarmato);

//load data
//https://www.kaggle.com/ktochylin/world-countries
queue()
    .defer(d3.json, "data/countries.json")
    .defer(d3.csv, "data/data.csv")
    .defer(d3.csv, "data/circleCoords_usa_italia.csv")
    .defer(d3.csv, "data/circleCoords.csv")
    .await(ready);

//main function to load data and draw
function ready(error, data, csv, coords, leafletCoords) {

    //save data out for use in leaflet map
    leafletData = leafletCoords;
    //console.log(leafletData);

    //add countries to svg container
    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("d", path)
        //set country style format (default)
        .style("fill", '#FFC627') //EFC945
        .style("opacity",1.0)
        .style('stroke', '#555555')
        .style('stroke-width', 1.0)
        //mouse interaction with map
        .on('mousemove',function(d){

            //set up mouse target
            var followMe = d3.select('#followTarget')
                .attr('cx', d3.event.offsetX)
                .attr('cy', d3.event.offsetY - 12) //set tooltip position above mouse position
                .node();
            tip.show(d, followMe);

            //set country style format on mouseover
            d3.select(this)
                .style("opacity", 1.0)
                .style("fill", '#8c8d8e')
                .style('stroke', '#555555')
                .style("stroke-width",1.0);
        })
        .on('mouseout', function(d){
            tip.hide(d);

            //set country style format on mouseout (reset to default)
            d3.select(this)
                .style("opacity", 1.0)
                .style("fill", '#FFC627') //EFC945
                .style('stroke', '#555555')
                .style("stroke-width",1.0);
        });

    //use csv data to:
    //append and place carrarmato image
    //append custom tooltip
    svg.append("g").attr("class", "locations").selectAll("image")
        .data(csv).enter()
        .append("image").attr("xlink:href", "img/carrarmato_white.png")
        .attr('width', 25)
        .attr('height', 25)
        .style("opacity", 1.0)
        .attr("x", function (d) { return projection([d.lon, d.lat])[0] - 10; })
        .attr("y", function (d) { return projection([d.lon, d.lat])[1] - 10; })
        .on('mouseover', function (d) {
            carrarmato.show(d);

            d3.select(this).transition()
            .attr('width', 35)
            .attr('height', 35)
            .style("opacity", 1.0)
            .attr("x", function (d) { return projection([d.lon, d.lat])[0] - 15; })
            .attr("y", function (d) { return projection([d.lon, d.lat])[1] - 15; })
        })
        .on("mouseout",  function (d) {
            carrarmato.hide();

            d3.select(this).transition()
            .attr('width', 25)
            .attr('height', 25)
            .style("opacity", 1.0)
            .attr("x", function (d) { return projection([d.lon, d.lat])[0] - 10; })
            .attr("y", function (d) { return projection([d.lon, d.lat])[1] - 10; })

        });

    //add circles to accurate locations
    var circles = svg.append("g").attr("class", "circles").selectAll('circle')
        .data(coords).enter()
        .append('circle')
        .attr("transform", function(e) {
            return "translate(" + projection([
              e.lon,
              e.lat
            ]) + ")" })
        .attr('r', 3)
        .attr('stroke','black')
        .attr('stroke-width',1)
        .attr('fill', "#ffffff")
        .style("opacity", 0.9);


    //add lines to connect circles to carrarmati

    //USA
    //USA: Quabaug, North Brookfield
    svg.append("path")
        .datum({type: "LineString", coordinates: [[-54, 43.5], [-72.082354, 42.268606]]})
        .attr("class", "arc")
        .attr("d", path)
        .style("stroke-dasharray", ("1, 3"))
        .style('stroke-width', 1.5);

    //USA: Flagship Store, Boston
    svg.append("path")
        .datum({type: "LineString", coordinates: [[-65, 28], [-71.084538, 42.348977]]})
        .attr("class", "arc")
        .attr("d", path)
        .style("stroke-dasharray", ("1, 3"))
        .style('stroke-width', 1.5);

    //USA: Vibram USA, Concord
    svg.append("path")
        .datum({type: "LineString", coordinates: [[-57, 35], [-71.409231, 42.453511]]}) //-71.409231	42.453511
        .attr("class", "arc")
        .attr("d", path)
        .style("stroke-dasharray", ("1, 3"))
        .style('stroke-width', 1.5);

    //ITALIA
    //Italia: Milan
    svg.append("path")
        .datum({type: "LineString", coordinates: [[-21, 52], [9.153386, 45.469265]]}) //
        .attr("class", "arc")
        .attr("d", path)
        .style("stroke-dasharray", ("1, 3"))
        .style('stroke-width', 1.5);

    //Italia: Headquarters, Albizzate
    svg.append("path")
        .datum({type: "LineString", coordinates: [[-25, 42], [8.809864,	45.736832]]}) //
        .attr("class", "arc")
        .attr("d", path)
        .style("stroke-dasharray", ("1, 3"))
        .style('stroke-width', 1.5);

    //Italia: Montebelluna
    svg.append("path")
        .datum({type: "LineString", coordinates: [[-12.344586, 60.409759], [12.046143, 45.776234]]}) //
        .attr("class", "arc")
        .attr("d", path)
        .style("stroke-dasharray", ("1, 3"))
        .style('stroke-width', 1.5);


// BEGIN LEAFLET

//==============================//
//====== LEAFLET MAP ===========//
//==============================//

    var svgLeaflet = d3.select("#leaflet")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append('g')
        .attr('class', 'leafletMap');

    svgLeaflet.append("rect")
        .attr("width", width)
        .attr("height", height)
        //.attr("fill", "#555555");
        .attr("fill", "#000000");

//define custom icon class
    var customIcon = L.Icon.extend({
        options: {
            //shadowUrl: 'img/carrarmato.png',
            iconSize:     [20, 20],
            //shadowSize:   [15, 15],
            iconAnchor:   [5, 20],
            //shadowAnchor: [0, 20],
            popupAnchor:  [-5, -20]
        }
    });

    //define custom icon image
    leafletCarrarmato = new customIcon({iconUrl: 'img/carrarmato.png'});

//neutral map layer options
//light map
    var CartoDB_Positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
        attribution: '© OpenStreetMap contributors, © CartoDB'
    });

//dark map
    var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
        attribution: '© OpenStreetMap contributors, © CartoDB'
    });

//set up markers

    var markerGroup = L.layerGroup();

    //loop through data to create markers
    for (i = 0; i < leafletData.length; i++) {

        //create popup content for each marker
        var leaflet_puc = "<strong>" + leafletData[i].name + "</strong><br/>";

        //create each marker
        var leafletMarker = L.marker([leafletData[i].lat, leafletData[i].lon], {icon: leafletCarrarmato})
            .bindPopup(leaflet_puc).addTo(markerGroup);

    }
    //radio button map layers
    var baseMaps = {
        "Map Style: Light": CartoDB_Positron,
        "Map Style: Dark":  CartoDB_DarkMatter
    }; //end loop

    //checkbox map layer
    var markerOverlay = {
        "Vibram Locations": markerGroup
    };

    //initialize map
    var map = L.map('leaflet', {
        center: [38, 14],
        zoom: 2,
        //layers: [CartoDB_DarkMatter, tempGroup]
        layers: [CartoDB_DarkMatter, markerGroup]
    });

    //add layer controls
    L.control.layers(baseMaps, markerOverlay).addTo(map);

// END LEAFLET

}//END MAIN FUNCTION





