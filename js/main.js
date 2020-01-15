var f = d3.format(',');
var e = d3.format('.1f');

// var projection = d3.geoAlbers()
//     .center([-45, 15])
//     .rotate([50, -15, 0])
//     .translate([400, 350])
//     .parallels([29.5, 45.5])
//     .scale(6500);
var projection = d3.geoConicConformal()
    .parallels([30, 50])
    .rotate([-20, 90])
    .scale(7000)
    .center([-122.5, -21.5]);
var geoPathGenerator = d3.geoPath().projection(projection);

//Load the data using d3.queue
d3.queue()
    .defer(d3.json, 'data/censusTractsUpdated.json')
    .awaitAll(function(error, results){
        generateMap(results[0]);
    });

//Generate the map of the Census Tracts
function generateMap(data){
    //Create the SVG container
    var svgContainer = d3.select('#map')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 600)
        .style('overflow', 'visible');

    //Create the map
    var mapSVG = svgContainer.selectAll('.tracts')
        .data(topojson.feature(data, data.objects.tracts).features)
        .enter()
        .append('path')
        .attr('class', function(d){
            return d.properties.Tracts
        })
        .attr('d', function(d, i){
            return geoPathGenerator(d);
        })
        .style('fill', '#c6093b')
        .style('fill-opacity', function(d){
            return 2 / d.properties.Unemp_Rate;
        })
        .style('stroke-width', 0);
}