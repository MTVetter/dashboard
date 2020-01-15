var f = d3.format('.2');
var e = d3.format('.1f');

//Create the projection for the topojson file
var projection = d3.geoConicConformal()
    .parallels([30, 50])
    .rotate([-20, 90])
    .scale(6000)
    .center([-122.5, -20.2]);
var geoPathGenerator = d3.geoPath().projection(projection);

d3.queue()
    .defer(d3.json, '../../data/censusTractsUpdated.json')
    .awaitAll(function(error, results){
        generateHouseholdMap(results[0]);
        generateHouseholdChart(results[0]);
    });

function generateHouseholdMap(data){
    //Create the color scale
    var colorScale = d3.scaleThreshold()
        .domain([0,500,1000,1500,2000,2500])
        .range(['#0c2c84','#225ea8', '#1d91c0', '#41b6c4', '#7fcdbb', '#c7e9b4', '#ffffcc'].reverse());

    //Create the SVG container
    var svgContainer = d3.select('#householdMap')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500)
        .style('overflow', 'visible');

    //Create the tooltip for the map
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .style('font-family', 'futura')
        .html(function(d){
            return '<p>Tract: ' + d.properties.Tract + '<br/># of Households: ' + d.properties.HH_Total +
            '<br/>Poverty Rate: '+d.properties.Pov_Rate+'</p>';
        });

    svgContainer.call(tip);

    svgContainer.selectAll('rect').remove();
    svgContainer.selectAll('text').remove();

    //Create a map using census tracts
    var tractMap = svgContainer.selectAll('.tracts')
        .data(topojson.feature(data, data.objects.tracts).features)
        .enter()
        .append('path')
        .attr('class', function(d){
            return 't' + d.properties.Tract;
        })
        .attr('d', function(d,i){
            return geoPathGenerator(d);
        })
        .style('fill', function(d){
            var hhNumber = d.properties.HH_Total;
            return colorScale(hhNumber);
        })
        .style('opacity', 0.85)
        .on('mouseenter', function(d){
            d3.selectAll('.' + this.getAttribute('class'))
                .style('stroke-width', 2)
                .style('stroke', '#dddddd');

            tip.show(d);
        })
        .on('mouseleave', function(d){
            d3.selectAll('.' + this.getAttribute('class'))
                .style('stroke-width', 0)
                .style('stroke', '#dddddd');

            tip.hide(d);
        });

    //Create the map legend
    var xPos = 5;
    var yPos = 40;
    var height = 600;

    //Background
    svgContainer.append('text')
        .style('font-weight', 700)
        .style('fill', '#ddd')
        .attr('x', xPos)
        .attr('y', yPos - 10)
        .text('Households');

    //Create the lowest legend
    svgContainer.append('rect')
        .style('fill', colorScale(350))
        .style('stroke', 'none')
        .attr('x', xPos)
        .attr('y', yPos)
        .attr('height', '7px')
        .attr('width', height / 35);
    svgContainer.append('text')
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .attr('x', xPos + 25)
        .attr('y', yPos + 7)
        .text('< 500');

    svgContainer.append('rect')
        .style('fill', colorScale(750))
        .style('stroke', 'none')
        .attr('x', xPos)
        .attr('y', yPos + 15)
        .attr('height', '7px')
        .attr('width', height / 35);
    svgContainer.append('text')
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .attr('x', xPos + 25)
        .attr('y', yPos + 22)
        .text('501 - 1,000');

    svgContainer.append("rect")
        .style("fill", colorScale(1250))
        .style("stroke", "none")
        .attr("x", xPos)
        .attr("y", yPos + 30)
        .attr("height", "7px")
        .attr("width", height/35);
    svgContainer.append("text")
        .style("font-weight", 300)
        .style('fill', '#ddd')
        .attr("x", xPos + 25)
        .attr("y", yPos + 37)
        .text('1,001 - 1,500');

    svgContainer.append("rect")
        .style("fill", colorScale(1750))
        .style("stroke", "none")
        .attr("x", xPos)
        .attr("y", yPos + 45)
        .attr("height", "7px")
        .attr("width", height/35);
    svgContainer.append("text")
        .style("font-weight", 300)
        .style('fill', '#ddd')
        .attr("x", xPos + 25)
        .attr("y", yPos + 52)
        .text('1,501 - 2,000');

    svgContainer.append("rect")
        .style("fill", colorScale(2250))
        .style("stroke", "none")
        .attr("x", xPos)
        .attr("y", yPos + 60)
        .attr("height", "7px")
        .attr("width", height/35);
    svgContainer.append("text")
        .style("font-weight", 300)
        .style('fill', '#ddd')
        .attr("x", xPos + 25)
        .attr("y", yPos + 67)
        .text('2,001 - 2,500');

    svgContainer.append("rect")
        .style("fill", colorScale(2750))
        .style("stroke", "none")
        .attr("x", xPos)
        .attr("y", yPos + 75)
        .attr("height", "7px")
        .attr("width", height/35);
    svgContainer.append("text")
        .style("font-weight", 300)
        .style('fill', '#ddd')
        .attr("x", xPos + 25)
        .attr("y", yPos + 82)
        .text('> 2,500');
}

function generateHouseholdChart(data){
    var theme = 'HH_Total';
    var census = topojson.feature(data, data.objects.tracts).features;

    var colorScale = d3.scaleThreshold()
        .domain([0,500,1000,1500,2000,2500])
        .range(['#0c2c84', '#225ea8', '#1d91c0', '#41b6c4', '#7fcdbb', '#c7e9b4', '#ffffcc'].reverse());

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scaleBand()
        .range([0, width])
        .domain(census.map(function(d){ return d.properties.Tract; }));

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, 20000]);

    var svg = d3.select('#householdChart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate('+margin.left+','+margin.top+')');

    svg.selectAll('.bar')
        .data(census)
        .enter()
        .append('rect')
        .attr('class', function(d){ return 't'+d.properties.Tract; })
        .attr('x', function(d, i){ return i * (width / census.length); })
        .attr('width', 2.5)
        .attr('y', function(d){ return y(d.properties.HH_Total); })
        .attr('height', function(d){ return height - y(d.properties.HH_Total); })
        .style('fill', function(d){
            return colorScale(d.properties.HH_Total);
        })
        .sort(function(a, b){
            return b.properties[theme] - a.properties[theme]
        })
        .on('mouseenter', function(d){
            d3.selectAll('.' + this.getAttribute('class'))
                .style('stroke-width', 2)
                .style('stroke', '#ddd');
        })
        .on('mouseleave', function(d){
            d3.selectAll('.' + this.getAttribute('class'))
                .style('stroke-width', 0)
                .style('stroke','#ddd');
        });

    svg.append('g')
        .call(d3.axisLeft(y));
}