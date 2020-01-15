var f = d3.format(',');
var e = d3.format('.1f');

var projection = d3.geoAlbers()
    .center([35, 10])
    .rotate([45, -15, 0])
    .translate([400, 350])
    .scale(475);
var geoPathGenerator = d3.geoPath().projection(projection);

//Load the data using d3.queue
d3.queue()
    .defer(d3.json, '../../data/trans.json')
    .defer(d3.csv, '../../data/CrashSummary_Updated.csv')
    .awaitAll(function(error, results){
        generateMap(results[0], results[1]);
    });

d3.queue()
    .defer(d3.csv, '../../data/CrashSummary_Updated.csv')
    .awaitAll(function(error, results){
        generateCrashChart(results[0])
    });

//Color Scale
var colorScale = d3.scaleThreshold()
    .domain([0, 2500, 5000, 7500, 10000])
    .range(['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf'].reverse());

//Generate the map
function generateMap(towns, data){
    //Create a tooltip
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d){
            var town = d.properties.County.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
            return '<p>' + town + '</p><b>2018 Statistics</b><br>Total Injuries: ' + f(findIndex(town, 'TotalInjury')) + '<br>Total Fatalities: ' + findIndex(town, 'TotalFatality') + '<br><br>Total Crashes: ' + f(findIndex(town, 'TotalCrashes'));
        });

    //Create the SVG container for the map
    var svgContainer = d3.select('#map')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500);

    svgContainer.call(tip);

    //Create a function to get a particular statistic for a certain town
    var findIndex = function(town, statistic){
        for (var i = 0; i < data.length; i++){
            if (data[i].year == 2018 && data[i].county == town){
                return +data[i][statistic];
            }
        }
    };

    //Create the elements for the map
    var mapSVG = svgContainer.selectAll('.county')
        .data(topojson.feature(towns, towns.objects.counties).features)
        .enter()
        .append('path')
        .attr('class', function(d){
            return d.properties.County.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
        })
        .attr('d', function(d, i){
            return geoPathGenerator(d);
        })
        .style('fill', function(d){
            var capTown = d.properties.County.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
            return colorScale(findIndex(capTown, 'TotalCrashes'));
        })
        .style('opacity', 1)
        .style('stroke', '#191b1d')
        .style('stroke-width', '1px')
        .on('click', function() {
            //Get the attribute for the class
            var thisreg = this.getAttribute('class');
            //Select all paths within the SVG container and make the outline black
            svgContainer.selectAll('path')
                .style('stroke', '#191b1d')

            //Select all classes of a particular county and make the outline white
            d3.selectAll('.' + thisreg)
                .style('stroke', 'white')

            //Create the y-axis for the first chart
            var yScale = d3.scaleLinear().domain([0, findTownMax(thisreg)[0]]).range([400, 20]);
            var yAxis = d3.axisLeft(yScale).tickSize(-250, 0, 0).tickFormat(function(e){
                if (Math.floor(e) != e){
                    return;
                } else {
                    return e;
                }
            });

            //Select the chart area and create a transition
            d3.selectAll('.area').transition().style('fill', 'none');

            //Select the y-axis label and update the text and color based on the values
            chartContainer.select('.yaxis')
                .transition()
                .duration(750)
                .call(yAxis)
                .selectAll('text')
                .style('fill', colorScale(findTownMax(thisreg)[0]))
                .attr('transform', 'translate(-5,0)');

            //Repeat the previous process for the other chart
            var yScale = d3.scaleLinear().domain([0, findTownMax(thisreg)[1]]).range([400, 20]);
            var yAxis = d3.axisLeft(yScale).tickSize(-250, 0, 0).tickFormat(function(e){
                if (Math.floor(e) != e){
                    return;
                } else {
                    return e;
                }
            });

            chartContainer2.select('.yaxis')
                .transition()
                .duration(750)
                .call(yAxis)
                .selectAll('text')
                .style('fill', colorScale(findTownMax(thisreg)[1]))
                .attr('transform', 'translate(-5,0)');

            circleMaker(thisreg);
        })
        .on('mouseenter', function(d){
            tip.show(d);
            d3.select(this).style('opacity', 0.5).style('cursor', 'pointer');
        })
        .on('mouseleave', function(d){
            d3.select(this).style('opacity', 1);
            tip.hide(d);
        });

    //Select the first chart and add an SVG element for the chart
    var chartContainer = d3.select('#injuryChart').append('svg')
        .attr('width', '100%')
        .attr('height', 500);

    //Select the second chart and add an SVG element for the chart
    var chartContainer2 = d3.select('#deathChart').append('svg')
        .attr('width', '100%')
        .attr('height', 500);

    var nested_crashes = d3.nest()
        .key(function(d) { return d.county })
        .entries(data);

    //Determine scales dynamically
    function findTownMax(town){
        var crashValues = [];
        crashValues[0] = [];
        crashValues[1] = [];

        nested_crashes.forEach(function(i){
            if (i.key == town){
                i.values.forEach(function(j){
                    crashValues[0].push(+j.TotalInjury);
                    crashValues[1].push(+j.TotalFatality);
                });
            }
        });

        return [d3.max(crashValues[0]), d3.max(crashValues[1])];
    }

    //Label the axis for each chart
    chartContainer.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -250)
        .attr('y', 12)
        .style('font-weight', 400)
        .style('fill', '#ddd')
        .text('Total Injuries');

    chartContainer2.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -270)
        .attr('y', 20)
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .text('Total Fatalities');

    //Assign scales and axis
    var xScale = d3.scaleLinear().domain([2010, 2018]).range([60, 300]);
    var yScale = d3.scaleLinear().domain([0, findTownMax('Total')[0]]).range([400, 20]);

    var xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d'));
    var yAxis = d3.axisLeft(yScale).ticks(10).tickSize(-250, 0, 0);

    chartContainer.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0, 400)')
        .style('stroke-width', '1px')
        .call(xAxis)
        .selectAll('text')
        .style('fill', '#ddd')
        .style('font-size', '12px')
        .style('text-anchor', 'end')
        .attr('transform', 'rotate(-45)');

    chartContainer.append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(60,0)')
        .call(yAxis)
        .selectAll('text')
        .style('fill', '#ddd')
        .style('font-size', '12px')
        .attr('transform', 'translate(-5,0)');

    var yScale = d3.scaleLinear().domain([0, findTownMax('Total')[1]]).range([400, 20]);
    var yAxis = d3.axisLeft(yScale).ticks(10).tickSize(-250, 0, 0);

    chartContainer2.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0, 400)')
        .style('stroke-width', '1px')
        .call(xAxis).selectAll('text')
        .style('fill', '#ddd')
        .style('font-size', '12px')
        .style('text-anchor','end')
        .attr('transform', 'rotate(-45)');

    chartContainer2.append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(60, 0)')
        .call(yAxis)
        .selectAll('text')
        .style('fill', '#ddd')
        .style('font-size', '12px')
        .attr('transform', 'translate(-5,0)');

    circleMaker('Total');

    function circleMaker(town){
        chartContainer.selectAll('path').remove();
        chartContainer2.selectAll('path').remove();

        nested_crashes.forEach(function(i){
            i.values.forEach(function(j){
                if (j.county == town){
                    var yScale = d3.scaleLinear().domain([0, findTownMax(town)[0]]).range([400, 20]);

                    var areamaker = d3.area()
                        .x(function(d) { return xScale(d.year); })
                        .y1(function(d) { return yScale(d.TotalInjury); })
                        .y0(function(d) { return yScale(0); });

                    chartContainer.append('path')
                        .datum(i.values)
                        .attr('class', 'area')
                        .attr('d', areamaker)
                        .style('fill', colorScale(findTownMax(i.key)[0]))
                        .style('stroke','none')
                        .style('opacity', 0.1);

                    var yScale = d3.scaleLinear().domain([0, findTownMax(town)[1]]).range([400, 20]);

                    var areamaker2 = d3.area()
                        .x(function(d) { return xScale(d.year); })
                        .y1(function(d) { return yScale(+d.TotalFatality); })
                        .y0(function(d) { return yScale(0); });

                    chartContainer2.append('path')
                        .datum(i.values)
                        .attr('class', 'area')
                        .attr('d', areamaker2)
                        .style('fill', colorScale(findTownMax(i.key)[1]))
                        .style('stroke', 'none')
                        .style('opacity', 0.1);
                }
            });
        });
    }

    //Create the legend for the map
    var xPos = 5;
    var yPos = 60;
    var height = 600;

    //Create a legend title
    svgContainer.append('text')
        .style('font-weight', 700)
        .style('font-size', 18)
        .style('fill', '#ddd')
        .attr('x', xPos)
        .attr('y', yPos - 35)
        .text('Total Crashes - 2018');

    svgContainer.append('text')
        .style('font-weight', 700)
        .style('fill', '#ddd')
        .attr('x', xPos)
        .attr('y', yPos - 7)
        .text('KEY');

    //Create the bare value rectangle and legend number
    svgContainer.append('rect')
        .style('fill', colorScale(1500))
        .style('stroke', 'none')
        .attr('x', xPos)
        .attr('y', yPos)
        .attr('height', '7px')
        .attr('width', height/35);
    svgContainer.append('text')
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .attr('x', xPos + 25)
        .attr('y', yPos + 7)
        .text('<2,500 crashes');

    //Create the next value rectangle and legend number
    svgContainer.append('rect')
        .style('fill', colorScale(3350))
        .style('stroke', 'none')
        .attr('x', xPos)
        .attr('y', yPos + 15)
        .attr('height', '7px')
        .attr('width', height/35);
    svgContainer.append("text")
        .style("font-weight", 300)
        .style('fill', '#ddd')
        .attr("x", xPos + 25)
        .attr("y", yPos + 22)
        .text("2,501-5,000 crashes");

    //Create the next value rectangle and legend number
    svgContainer.append("rect")
        .style("fill", colorScale(6120))
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
        .text("5,001-7,500 crashes");

    //Create the next value rectangle and legend number
    svgContainer.append("rect")
        .style("fill", colorScale(9550))
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
        .text("7,501-10,000 crashes");

    //Create the uppermost value rectangle and legend number
    svgContainer.append("rect")
        .style("fill", colorScale(10500))
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
        .text(">10,000 crashes");
}

function generateCrashChart(data){
    var height = 500;
    var width = 1100;
    var padding = 50;

    var year = 0;
    var x = 1;
    var y = 40;
    var tot = 0;
    var xMax = 71;

    var nested_crashes = d3.nest()
        .key(function(d) { return d.county })
        .entries(data);

    var svg = d3.select('#deathInjury')
        .append('svg')
        .attr('height', height)
        .attr('width', width);

    var xScale = d3.scaleLinear().domain([2010, 2018]).range([0 + padding, width - (2.5 * padding)]);
    var yScale = d3.scaleLinear().domain([90, 0]).range([height-60, -10]);

    var xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d'));

    svg.append('g')
        .attr('class', 'taxis')
        .attr('transform', 'translate(0, 440)')
        .call(xAxis)
        .selectAll('text')
        .style('font-size', 18)
        .style('stroke', '#ddd')
        .style('fill', '#ddd')
        .attr('transform', 'translate(35, 3)')
        .style('text-anchor', 'middle');

    data.sort(function(a, b){ return parseInt(a.year) - parseInt(b.year); });

    data.forEach(function(d){
        if (year != d.year){
            x = 1;
            y = 89;
            year = d.year;
        }
        if (d.county == 'Total'){
            for (var i = 1; i < parseInt(d.DeathMotorists) + 1; i++){
                svg.append('circle')
                    .attr('cx', xScale(d.year) + x)
                    .attr('cy', yScale(y))
                    .attr('r', 2)
                    .attr('stroke-width', 0.5)
                    .attr('stroke', 'orange')
                    .attr('fill', 'none')
                if (x >= xMax){ x = 1; y--; } else { x += 6;}
            }

            for (var i = 1; i < parseInt(d.NonMotoristDeath) + 1; i++){
                svg.append('circle')
                    .attr('cx', xScale(d.year) + x)
                    .attr('cy', yScale(y))
                    .attr('r', 2)
                    .attr('fill', 'orange')
                if (x >= xMax){ x = 1; y--;} else{ x += 6;}
            }

            svg.append('text')
                .attr('class', 'legend')
                .attr('x', xScale((+d.year + +d.year + 1)/2) - 15)
                .attr('y', yScale(y) - 40)
                .text(d.NonMotoristDeath + '  Non-Motorist Fatalities')
                .style('font-size', 9.5)
                .style('fill', '#ddd')
                .style('text-anchor', 'middle');

            svg.append('text')
                .attr('class', 'legend')
                .attr('x', xScale((+d.year + +d.year + 1)/2) - 15)
                .attr('y', yScale(y) - 20)
                .text(f(d.DeathMotorists) + ' Motorist Fatalities')
                .style('font-size', 9.5)
                .style('fill', '#ddd')
                .style('text-anchor', 'middle');
        }
    });
}