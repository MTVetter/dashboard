//JavaScript file for the Demographics page
var f = d3.format('.2');
var e = d3.format('.1f');

//Create the projection for the topojson file
var projection = d3.geoConicConformal()
    .parallels([30, 50])
    .rotate([-20, 90])
    .scale(6000)
    .center([-122.5, -20]);
var geoPathGenerator = d3.geoPath().projection(projection);

//Load the data using d3.queue
d3.queue()
    .defer(d3.json, '../../data/censusTractsUpdated.json')
    .awaitAll(function(error, results){
        generateRaceMap(results[0]);
        generateRaceChart(results[0]);

        generateEthinicMap(results[0]);
        generateEthinicChart(results[0]);

        generateEducationMap(results[0]);
        generateEducationChart(results[0]);
    });

//Create the race map function
function generateRaceMap(data){
    //Create the color scale
    var colorScale = d3.scaleLinear()
        .domain([0,1,2,3,4])
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']);

    //Create the SVG container
    var svgContainer = d3.select('#raceMap')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500)
        .style('overflow', 'visible');

    //Create the tooltip for the map
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .style('font-family', 'futura')
        .html(function(d){
            return '<p>Tract: ' + d.properties.Tract + '<br/>% White: ' + e((d.properties.Pop_White / d.properties.Pop_Total) * 100) +
             '<br/>% Black: ' + e((d.properties.Pop_Black / d.properties.Pop_Total) * 100) +
             '<br/>% Hispanic: ' + e((d.properties.Pop_Hispanic / d.properties.Pop_Total) * 100) +
             '<br/>% Asian: ' + e((d.properties.Pop_Asian / d.properties.Pop_Total) * 100) +
             '<br/>% Other Race: ' + e((d.properties.Pop_Other / d.properties.Pop_Total) * 100) +
             '</p>';
        });

    svgContainer.call(tip);

    colorRaceMap = function (percent){
        //Determine which button is selected
        if (percent === 'Pop_White'){ var keyColor = colorScale(0); var keyMult = 15; }
        if (percent === 'Pop_Black'){ var keyColor = colorScale(1); var keyMult = 5; }
        if (percent === 'Pop_Hispanic'){ var keyColor = colorScale(2); var keyMult = 15; }
        if (percent === 'Pop_Asian'){ var keyColor = colorScale(3); var keyMult = 2.5; }
        if (percent === 'Pop_Other'){ var keyColor = colorScale(4); var keyMult = 2.5; }

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
                if (percent === "Pop_White"){ return colorScale(0); }
                if (percent === 'Pop_Black'){ return colorScale(1); }
                if (percent === "Pop_Hispanic"){ return colorScale(2); }
                if (percent === 'Pop_Asian'){ return colorScale(3); }
                if (percent === 'Pop_Other'){ return colorScale(4); }
            })
            .style('fill-opacity', function(d){
                // if (((d.properties[percent] / d.properties.Pop_Total) * 3 / keyMult * 5) < 0.15){
                //     return 0.10;
                // } else if (((d.properties[percent] / d.properties.Pop_Total) * 3 / keyMult * 5) > 0.15 && ((d.properties[percent] / d.properties.Pop_Total) * 3 / keyMult * 5) < 0.31){
                //     return 0.25;
                // } else if (((d.properties[percent] / d.properties.Pop_Total) * 3 / keyMult * 5) > 0.30 && ((d.properties[percent] / d.properties.Pop_Total) * 3 / keyMult * 5) < 0.46){
                //     return 0.40;
                // } else if (((d.properties[percent] / d.properties.Pop_Total) * 3 / keyMult * 5) > 0.45 && ((d.properties[percent] / d.properties.Pop_Total) * 3 / keyMult * 5) < 0.61){
                //     return 0.55;
                // } else if (((d.properties[percent] / d.properties.Pop_Total) * 3 / keyMult * 5) > 0.60){
                //     return 0.90;
                // }
                return ((d.properties[percent] / d.properties.Pop_Total)) * 3 / keyMult * 5; 
            })
            .style('opacity', 1)
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
            .attr('y', yPos - 7)
            .text('KEY');

        //Create the lowest legend
        svgContainer.append('rect')
            .style('fill', keyColor)
            .style('stroke', 'none')
            .style('opacity', 0.15)
            .attr('x', xPos)
            .attr('y', yPos)
            .attr('height', '7px')
            .attr('width', height / 35);
        svgContainer.append('text')
            .style('font-weight', 300)
            .style('fill', '#ddd')
            .attr('x', xPos + 25)
            .attr('y', yPos + 7)
            .text('<' + keyMult + '% population');

        svgContainer.append('rect')
            .style('fill', keyColor)
            .style('stroke', 'none')
            .style('opacity', 0.3)
            .attr('x', xPos)
            .attr('y', yPos + 15)
            .attr('height', '7px')
            .attr('width', height / 35);
        svgContainer.append('text')
            .style('font-weight', 300)
            .style('fill', '#ddd')
            .attr('x', xPos + 25)
            .attr('y', yPos + 22)
            .text(keyMult + '-' + 2 * keyMult + '% population');

        svgContainer.append("rect")
            .style("fill", keyColor)
            .style("stroke", "none")
            .style("opacity", .45)
            .attr("x", xPos)
            .attr("y", yPos + 30)
            .attr("height", "7px")
            .attr("width", height/35);
        svgContainer.append("text")
            .style("font-weight", 300)
            .style('fill', '#ddd')
            .attr("x", xPos + 25)
            .attr("y", yPos + 37)
            .text(2 * keyMult + "-" + (3 * keyMult) + "% population");

        svgContainer.append("rect")
            .style("fill", keyColor)
            .style("stroke", "none")
            .style("opacity", .6)
            .attr("x", xPos)
            .attr("y", yPos + 45)
            .attr("height", "7px")
            .attr("width", height/35);
        svgContainer.append("text")
            .style("font-weight", 300)
            .style('fill', '#ddd')
            .attr("x", xPos + 25)
            .attr("y", yPos + 52)
            .text((3 * keyMult) + "-" + 4 * keyMult + "% population");

        svgContainer.append("rect")
            .style("fill", keyColor)
            .style("stroke", "none")
            .style("opacity", .90)
            .attr("x", xPos)
            .attr("y", yPos + 60)
            .attr("height", "7px")
            .attr("width", height/35);
        svgContainer.append("text")
            .style("font-weight", 300)
            .style('fill', '#ddd')
            .attr("x", xPos + 25)
            .attr("y", yPos + 67)
            .text(function() {
              if (4 * keyMult == 100) { 
                return 4 * keyMult + "% population";
              } else {
                return ">" + 4 * keyMult + "% population";
              }
            })
    }

    //Create the on click actions for the maps
    $('#white').on('click', function(){
        svgContainer.selectAll('path').remove();
        colorRaceMap('Pop_White');
    });

    $('#black').on('click', function(){
        svgContainer.selectAll('path').remove();
        colorRaceMap('Pop_Black');
    });

    $('#hispanic').on('click', function(){
        svgContainer.selectAll('path').remove();
        colorRaceMap('Pop_Hispanic');
    });

    $('#asian').on('click', function(){
        svgContainer.selectAll('path').remove();
        colorRaceMap('Pop_Asian');
    });

    $('#other').on('click', function(){
        svgContainer.selectAll('path').remove();
        colorRaceMap('Pop_Other');
    })
}

//Create the race chart function
function generateRaceChart(data){
    //Create the color scale for the chart using the same colors as the map
    var colorScale = d3.scaleLinear()
        .domain([0,1,2,3,4])
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']);

    //Create the chart
    var allChart = d3.select('#raceChart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500)
        .style('overflow', 'visible');

    //Get the data
    var census = topojson.feature(data, data.objects.tracts).features;

    //Create the tooltip for the chart
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .style('font-family', 'futura')
        .html(function(d){
            return '<p>Tract: ' + d.properties.Tract + '<br/>% White: ' + e((d.properties.Pop_White / d.properties.Pop_Total) * 100) +
             '<br/>% Black: ' + e((d.properties.Pop_Black / d.properties.Pop_Total) * 100) +
             '<br/>% Hispanic: ' + e((d.properties.Pop_Hispanic / d.properties.Pop_Total) * 100) +
             '<br/>% Asian: ' + e((d.properties.Pop_Asian / d.properties.Pop_Total) * 100) +
             '<br/>% Other Race: ' + e((d.properties.Pop_Other / d.properties.Pop_Total) * 100) +
             '</p>';
        });

    //Atach the tooltip to the chart container
    allChart.call(tip);

    //Initially set the chart to white population
    populateRacePoints('Pop_White');

    //Initially set the map to white population
    colorRaceMap('Pop_White');

    function populateRacePoints(population){
        //Array to hold all values for each race
        var maxmins = [];
        var blackMaxMins = [];
        var asianMaxMins = [];
        var hispanicMaxMins = [];
        var otherMaxMins = [];

        //Loop through all the data and "extract" the values to the corresponding arrays
        census.forEach(function(i){
            maxmins.push(i.properties.Pop_White);
            blackMaxMins.push(i.properties.Pop_Black);
            asianMaxMins.push(i.properties.Pop_Asian);
            hispanicMaxMins.push(i.properties.Pop_Hispanic);
            otherMaxMins.push(i.properties.Pop_Other);
        });

        //Width of the chart
        var w = $('#raceChart').width();

        //Create the x-axis and y-axis scale based on the largest value for each attribute
        if (population === "Pop_White"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(maxmins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 100])
                .range([80, w - 50]);
        } else if (population === "Pop_Black"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(blackMaxMins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 100])
                .range([80, w - 50]);
        } else if (population === "Pop_Hispanic"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(hispanicMaxMins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 100])
                .range([80, w - 50]);
        } else if (population === "Pop_Asian"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(asianMaxMins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 80])
                .range([80, w - 50]);
        } else if (population === "Pop_Other"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(otherMaxMins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 20])
                .range([80, w - 50]);
        }

        var xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d')).tickSize(-400,0,0);
        var yAxis = d3.axisLeft(yScale).ticks(10).tickSize(-w + 130,0,0);

        allChart.append('g').attr('class', 'axis')
            .attr('transform', 'translate(0, 430)')
            .call(xAxis)
            .selectAll('text')
            .style('font-size', '12px')
            .style('font-family', 'futura')
            .style('font-weight', 700)
            .style('fill', '#ddd')
            .attr('transform', 'translate(0, 5)');

        allChart.append('g').attr('class', 'yaxis')
            .attr('transform', 'translate(80, 0)')
            .transition()
            .duration(750)
            .call(yAxis)
            .selectAll('text')
            .style('font-size', '12px')
            .style('fill', '#ddd')
            .attr('transform', 'translate(-5,0)');

        allChart.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -250)
            .attr('y', 20)
            .style('text-anchor', 'middle')
            .style('fill', '#ddd')
            .text('Number of People');

        allChart.append('text')
            .attr('x', 340)
            .attr('y', 470)
            .style('text-anchor', 'middle')
            .style('font-weight', 300)
            .style('fill', '#ddd')
            .text('Percent of Population');

        allChart.selectAll('points')
            .data(census)
            .enter()
            .append('rect')
            .attr('class', function(d){
                return 't' + d.properties.Tract;
            })
            .attr('x', function(d){
                return xScale(Math.floor((d.properties[population] / d.properties.Pop_Total)*100));
            })
            .attr('y', function(d){
                return yScale(Math.floor(d.properties[population]/150) * 150) - 6;
            })
            .attr('width', 6)
            .attr('height', 6)
            .style('fill-opacity', function(d){
                var percent = (d.properties[population] / d.properties.Pop_Total);
                if ((percent) < 0.15){
                    return 0.10;
                } else if ((percent) > 0.15 && (percent) < 0.31){
                    return 0.25;
                } else if ((percent) > 0.30 && (percent) < 0.46){
                    return 0.40;
                } else if ((percent) > 0.45 && (percent) < 0.61){
                    return 0.55;
                } else if ((percent) > 0.60){
                    return 0.90;
                }
            })
            .style('opacity', 1)
            .style('fill', function(){
                if (population === 'Pop_White'){ return colorScale(0); }
                if (population === 'Pop_Black'){ return colorScale(1); }
                if (population === 'Pop_Hispanic'){ return colorScale(2); }
                if (population === 'Pop_Asian'){ return colorScale(3); }
                if (population === 'Pop_Other'){ return colorScale(4); }
            })
            .on('mouseenter', function(d){
                d3.selectAll('.' + this.getAttribute('class'))
                    .style('stroke-width', 2)
                    .style('stroke', '#dddddd');

                tip.show(d);
            })
            // .on('click', function(d){
            //     allChart.selectAll('rect')
            //         .style('stroke-width', 0)
            //         .style('stroke', 'none');

            //     d3.selectAll('.' + this.getAttribute('class'))
            //         .style('stroke-width', 2)
            //         .style('stroke', '#dddddd');

            //     tip.show(d);
            // })
            .on('mouseleave', function(d){
                d3.selectAll('.' + this.getAttribute('class'))
                    .style('stroke-width', 0)
                    .style('stroke', '#dddddd');

                tip.hide(d);
            });
    }

    //Assign actions to the race buttons to update the charts
    d3.select('#white').on('click', function(){
        allChart.selectAll('rect').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateRacePoints('Pop_White');
    });

    d3.select('#black').on('click', function(){
        allChart.selectAll('rect').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateRacePoints('Pop_Black');
    });

    d3.select('#hispanic').on('click', function(){
        allChart.selectAll('rect').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateRacePoints('Pop_Hispanic');
    });

    d3.select('#asian').on('click', function(){
        allChart.selectAll('rect').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateRacePoints('Pop_Asian');
    });

    d3.select('#other').on('click', function(){
        allChart.selectAll('rect').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateRacePoints('Pop_Other');
    });
}

//Create the function to generate the Ethinic map
function generateEthinicMap(data){
    var colorScale = d3.scaleLinear()
        .domain([0,1,2,3,4,5,6,7])
        .range(['#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#3288bd', '#fee08b', '#80cdc1']);

    var svgContainer_Ethinic = d3.select('#ethinicMap')
        .append('svg')
        .attr('width', '50%')
        .attr('height', 500)
        .style('overflow', 'visible');

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d){
            return '<p>Tract: ' + d.properties.Tract + '<br>% Minority: ' + e(((d.properties.Pop_Black + d.properties.Pop_Asian + d.properties.Pop_Hispanic + d.properties.Pop_Other) / d.properties.Pop_Total) * 100) + '</p>'
        });

    svgContainer_Ethinic.call(tip);

    var keyColor = colorScale(7);
    var keyMult = 15;

    svgContainer_Ethinic.selectAll('rect').remove();
    svgContainer_Ethinic.selectAll('text').remove();

    var tractMap = svgContainer_Ethinic.selectAll('.tracts')
        .data(topojson.feature(data, data.objects.tracts).features)
        .enter()
        .append('path')
        .attr('class', function(d){ return 't' + d.properties.Tract; })
        .attr('d', function(d, i){ return geoPathGenerator(d); })
        .style('fill', function(d){
            return colorScale(7);
        })
        .style('fill-opacity', function(d){
            return ((d.properties.Pop_Black + d.properties.Pop_Asian + d.properties.Pop_Hispanic + d.properties.Pop_Other) / d.properties.Pop_Total) * 3 / keyMult * 5;
        })
        .style('opacity', 1)
        .on('mouseenter', function(d){
            d3.selectAll('.' + this.getAttribute('class'))
                .style('stroke-width', 2)
                .style('stroke', '#ddd');

            tip.show(d);
        })
        .on('mouseleave', function(d){
            d3.selectAll('.' + this.getAttribute('class'))
                .style('stroke-width', 0)
                .style('stroke', '#ddd');

            tip.hide(d);
        });

    //Create the map legend
    var xPos = 5;
    var yPos = 40;
    var height = 600;

    //background
    svgContainer_Ethinic.append('text')
        .style('font-weight', 700)
        .style('fill', '#ddd')
        .attr('x', xPos)
        .attr('y', yPos - 7)
        .text("KEY");
    svgContainer_Ethinic.append('rect')
        .style('fill', keyColor)
        .style('stroke', 'none')
        .style('opacity', 0.15)
        .attr('x', xPos)
        .attr('y', yPos)
        .attr('height', '7px')
        .attr('width', height/35);
    svgContainer_Ethinic.append('text')
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .attr('x', xPos + 25)
        .attr('y', yPos + 7)
        .text('<' +keyMult+ '% population');
    svgContainer_Ethinic.append('rect')
        .style('fill', keyColor)
        .style('stroke', 'none')
        .style('opacity', 0.3)
        .attr('x', xPos)
        .attr('y', yPos + 15)
        .attr('height', '7px')
        .attr('width', height/35);
    svgContainer_Ethinic.append('text')
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .attr('x', xPos + 25)
        .attr('y', yPos + 22)
        .text(keyMult + '-' + 2 * keyMult + '% population');
    svgContainer_Ethinic.append('rect')
        .style('fill', keyColor)
        .style('stroke', 'none')
        .style('opacity', 0.45)
        .attr('x', xPos)
        .attr('y', yPos + 30)
        .attr('height', '7px')
        .attr('width', height/35);
    svgContainer_Ethinic.append('text')
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .attr('x', xPos + 25)
        .attr('y', yPos + 37)
        .text(2 * keyMult + '-' + (3 * keyMult) + '% population');
    svgContainer_Ethinic.append("rect")
        .style("fill", keyColor)
        .style("stroke", "none")
        .style("opacity", .6)
        .attr("x", xPos)
        .attr("y", yPos + 45)
        .attr("height", "7px")
        .attr("width", height/35);
    svgContainer_Ethinic.append("text")
        .style("font-weight", 300)
        .style('fill', '#ddd')
        .attr("x", xPos + 25)
        .attr("y", yPos + 52)
        .text((3 * keyMult) + "-" + 4 * keyMult + "% population");
    svgContainer_Ethinic.append("rect")
        .style("fill", keyColor)
        .style("stroke", "none")
        .style("opacity", .75)
        .attr("x", xPos)
        .attr("y", yPos + 60)
        .attr("height", "7px")
        .attr("width", height/35);
    svgContainer_Ethinic.append("text")
        .style("font-weight", 300)
        .style('fill', '#ddd')
        .attr("x", xPos + 25)
        .attr("y", yPos + 67)
        .text(">" + 5 * keyMult + "% population");
}

//Function to create ethinic chart
function generateEthinicChart(data){
    
    var colorScale = d3.scaleLinear()
        .domain([0,1,2,3,4,5,6,7])
        .range(['#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#3288bd', '#fee08b', '#80cdc1']);

    var allChart = d3.select('#ethinicChart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500)
        .style('overflow', 'visible');

    var censusTracts = topojson.feature(data, data.objects.tracts).features;
    var maxmins = [];
    censusTracts.forEach(function(i){
        maxmins.push(i.properties.Pop_Total);
    });

    var w = $('#ethinicChart').width();

    var xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([80, w - 50]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(maxmins)])
        .range([430, 30]);

    var xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d')).tickSize(-400, 0, 0);
    var yAxis = d3.axisLeft(yScale).ticks(10).tickSize(-w + 130, 0, 0);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d){
            return '<p>Tract: ' + d.properties.Tract + '<br>% Minority: ' + e(((d.properties.Pop_Black + d.properties.Pop_Asian + d.properties.Pop_Hispanic + d.properties.Pop_Other) / d.properties.Pop_Total) * 100) + '</p>'
        });

    allChart.call(tip);

    allChart.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0, 430)')
        .call(xAxis)
        .selectAll('text')
        .style('font-size', '12px')
        .style('font-weight', 700)
        .style('fill', '#ddd')
        .attr('transform', 'translate(0, 5)');

    allChart.append('g')
        .attr('class', 'yaxis')
        .attr('transform', 'translate(80, 0)')
        .call(yAxis)
        .selectAll('text')
        .style('fill', '#ddd')
        .style('font-size', '12px')
        .attr('transform', 'translate(-5, 0)');

    allChart.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -250)
        .attr('y', 20)
        .style('text-anchor', 'middle')
        .style('fill', '#ddd')
        .text('Population');

    allChart.append('text')
        .attr('x', 340)
        .attr('y', 470)
        .style('text-anchor', 'middle')
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .text('Percent of Population');

    allChart.selectAll('points')
        .data(censusTracts)
        .enter()
        .append('rect')
        .attr('class', function(d){ return 't' + d.properties.Tract; })
        .attr('x', function(d){
            return xScale(Math.floor(((d.properties.Pop_Black + d.properties.Pop_Asian + d.properties.Pop_Hispanic + d.properties.Pop_Other) / d.properties.Pop_Total) * 100)); 
        })
        .attr('y', function(d){
            return yScale(Math.floor(d.properties.Pop_Total));
        })
        .attr('width', 6)
        .attr('height', 6)
        .style('fill-opacity', function(d){
            //Minority percentage
            var minority = (((d.properties.Pop_Black + d.properties.Pop_Asian + d.properties.Pop_Hispanic + d.properties.Pop_Other) / d.properties.Pop_Total) * 100);
            
            if ((minority) < 15){
                return 0.15
            } else if ((minority) > 15 &&  (minority) < 30){
                return 0.30
            } else if ((minority) > 30 && (minority) < 45){
                return 0.45
            } else if ((minority) > 45 && (minority) < 60){
                return 0.60
            } else if ((minority) > 60){
                return 0.75
            }
        })
        .style('opacity', 1)
        .style('fill', colorScale(7))
        .on('mouseenter', function(d){
            d3.selectAll('.' + this.getAttribute('class'))
                .style('stroke-width', 2)
                .style('stroke', '#ddd');

            tip.show(d);
        })
        .on('mouseleave', function(d){
            d3.selectAll('.' + this.getAttribute('class'))
                .style('stroke-width', 0)
                .style('stroke', '#ddd');

            tip.hide(d);
        });
}

//Function to create education map
function generateEducationMap(data){
    //Create the color scale
    var colorScale = d3.scaleLinear()
        .domain([0,1,2,3,4])
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']);

    var svgContainer_Education = d3.select('#educationMap')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500)
        .style('overflow', 'visible');

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d){
            return '<p>Tract: ' + d.properties.Tract +
             '<br/>% No High School Education: ' + e((d.properties.Edu_No_High_School / d.properties.Pop_Total) * 100) +
             '<br/>% High School Education: ' + e((d.properties.Edu_High_School / d.properties.Pop_Total) * 100) +
             '<br/>% Associate Degree: ' + e((d.properties.Edu_Associate / d.properties.Pop_Total) * 100) +
             '<br/>% Bachelor Degree: ' + e((d.properties.Edu_Bachelors / d.properties.Pop_Total) * 100) +
             '<br/>% Graduate Degree: ' + e((d.properties.Edu_Graduate / d.properties.Pop_Total) * 100) +
             '</p>';
        });

    svgContainer_Education.call(tip);

    colorEducationMap = function(percent){
        //Determine which button is selected
        if (percent === 'Edu_No_High_School'){ var keyColor = colorScale(0); var keyMult = 5; }
        if (percent === 'Edu_High_School'){ var keyColor = colorScale(1); var keyMult = 10; }
        if (percent === 'Edu_Associate'){ var keyColor = colorScale(2); var keyMult = 10; }
        if (percent === 'Edu_Bachelors'){ var keyColor = colorScale(3); var keyMult = 10; }
        if (percent === 'Edu_Graduate'){ var keyColor = colorScale(4); var keyMult = 5; }

        svgContainer_Education.selectAll('rect').remove();
        svgContainer_Education.selectAll('text').remove();

        var tractMap = svgContainer_Education.selectAll('.tracts')
            .data(topojson.feature(data, data.objects.tracts).features)
            .enter()
            .append('path')
            .attr('class', function(d){ return 't' + d.properties.Tract; })
            .attr('d', function(d, i){ return geoPathGenerator(d); })
            .style('fill', function(d){
                if (percent === 'Edu_No_High_School'){ return colorScale(0); }
                if (percent === 'Edu_High_School'){ return colorScale(1); }
                if (percent === 'Edu_Associate'){ return colorScale(2); }
                if (percent === 'Edu_Bachelors'){ return colorScale(3); }
                if (percent === 'Edu_Graduate'){ return colorScale(4); }
            })
            .style('fill-opacity', function(d){
                return ((d.properties[percent] / d.properties.Pop_Total)) * 3 / keyMult * 5;
            })
            .style('opacity', 1)
            .on('mouseenter', function(d){
                d3.selectAll('.' + this.getAttribute('class'))
                    .style('stroke-width', 2)
                    .style('stroke', '#ddd');

                tip.show(d);
            })
            .on('mouseleave', function(d){
                d3.selectAll('.' + this.getAttribute('class'))
                    .style('stroke-width', 0)
                    .style('stroke', '#ddd');

                tip.hide(d);
            });

        //Legend
        var xPos = 5;
        var yPos = 40;
        var height = 600;

        svgContainer_Education.append('text')
            .style('font-weight', 700)
            .style('fill', '#ddd')
            .attr('x', xPos)
            .attr('y', yPos - 7)
            .text('KEY');
        //Create the lowest legend
        svgContainer_Education.append('rect')
            .style('fill', keyColor)
            .style('stroke', 'none')
            .style('opacity', 0.15)
            .attr('x', xPos)
            .attr('y', yPos)
            .attr('height', '7px')
            .attr('width', height / 35);
        svgContainer_Education.append('text')
            .style('font-weight', 300)
            .style('fill', '#ddd')
            .attr('x', xPos + 25)
            .attr('y', yPos + 7)
            .text('<' + keyMult + '% population');

        svgContainer_Education.append('rect')
            .style('fill', keyColor)
            .style('stroke', 'none')
            .style('opacity', 0.3)
            .attr('x', xPos)
            .attr('y', yPos + 15)
            .attr('height', '7px')
            .attr('width', height / 35);
        svgContainer_Education.append('text')
            .style('font-weight', 300)
            .style('fill', '#ddd')
            .attr('x', xPos + 25)
            .attr('y', yPos + 22)
            .text(keyMult + '-' + 2 * keyMult + '% population');

        svgContainer_Education.append("rect")
            .style("fill", keyColor)
            .style("stroke", "none")
            .style("opacity", 0.45)
            .attr("x", xPos)
            .attr("y", yPos + 30)
            .attr("height", "7px")
            .attr("width", height/35);
        svgContainer_Education.append("text")
            .style("font-weight", 300)
            .style('fill', '#ddd')
            .attr("x", xPos + 25)
            .attr("y", yPos + 37)
            .text(2 * keyMult + "-" + (3 * keyMult) + "% population");

        svgContainer_Education.append("rect")
            .style("fill", keyColor)
            .style("stroke", "none")
            .style("opacity", 0.6)
            .attr("x", xPos)
            .attr("y", yPos + 45)
            .attr("height", "7px")
            .attr("width", height/35);
        svgContainer_Education.append("text")
            .style("font-weight", 300)
            .style('fill', '#ddd')
            .attr("x", xPos + 25)
            .attr("y", yPos + 52)
            .text((3 * keyMult) + "-" + 4 * keyMult + "% population");

        svgContainer_Education.append("rect")
            .style("fill", keyColor)
            .style("stroke", "none")
            .style("opacity", 0.90)
            .attr("x", xPos)
            .attr("y", yPos + 60)
            .attr("height", "7px")
            .attr("width", height/35);
        svgContainer_Education.append("text")
            .style("font-weight", 300)
            .style('fill', '#ddd')
            .attr("x", xPos + 25)
            .attr("y", yPos + 67)
            .text(function() {
              if (4 * keyMult == 100) { 
                return 4 * keyMult + "% population";
              } else {
                return ">" + 4 * keyMult + "% population";
              }
            });
    }

    //Create the on click actions for the maps
    $('#nohs').on('click', function(){
        svgContainer_Education.selectAll('path').remove();
        colorEducationMap('Edu_No_High_School');
    });

    $('#hs').on('click', function(){
        svgContainer_Education.selectAll('path').remove();
        colorEducationMap('Edu_High_School');
    });

    $('#associate').on('click', function(){
        svgContainer_Education.selectAll('path').remove();
        colorEducationMap('Edu_Associate');
    });

    $('#bachelor').on('click', function(){
        svgContainer_Education.selectAll('path').remove();
        colorEducationMap('Edu_Bachelors');
    });

    $('#grad').on('click', function(){
        svgContainer_Education.selectAll('path').remove();
        colorEducationMap('Edu_Graduate');
    })
}

//Create the education chart function
function generateEducationChart(data){
    //Create the color scale for the chart using the same colors as the map
    var colorScale = d3.scaleLinear()
        .domain([0,1,2,3,4])
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']);

    //Create the chart
    var allChart = d3.select('#educationChart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500)
        .style('overflow', 'visible');

    //Get the data
    var census = topojson.feature(data, data.objects.tracts).features;

    //Create the tooltip for the chart
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .style('font-family', 'futura')
        .html(function(d){
            return '<p>Tract: ' + d.properties.Tract + '<br/>% with No High School Education: ' + e((d.properties.Edu_No_High_School / d.properties.Pop_Total) * 100) +
             '<br/>% with High School Education: ' + e((d.properties.Edu_High_School / d.properties.Pop_Total) * 100) +
             '<br/>% with Associate Degree: ' + e((d.properties.Edu_Associate / d.properties.Pop_Total) * 100) +
             '<br/>% with Bachelor Degree: ' + e((d.properties.Edu_Bachelors / d.properties.Pop_Total) * 100) +
             '<br/>% with Graduate Degree: ' + e((d.properties.Edu_Graduate / d.properties.Pop_Total) * 100) +
             '</p>';
        });

    //Atach the tooltip to the chart container
    allChart.call(tip);

    //Initially set the chart to white population
    populateEducationPoints('Edu_No_High_School');

    //Initially set the map to white population
    colorEducationMap('Edu_No_High_School');

    function populateEducationPoints(population){
        //Array to hold all values for each race
        var maxmins = [];
        var blackMaxMins = [];
        var asianMaxMins = [];
        var hispanicMaxMins = [];
        var otherMaxMins = [];

        //Loop through all the data and "extract" the values to the corresponding arrays
        census.forEach(function(i){
            maxmins.push(i.properties.Edu_No_High_School);
            blackMaxMins.push(i.properties.Edu_High_School);
            asianMaxMins.push(i.properties.Edu_Associate);
            hispanicMaxMins.push(i.properties.Edu_Bachelors);
            otherMaxMins.push(i.properties.Edu_Graduate);
        });

        //Width of the chart
        var w = $('#educationChart').width();

        //Create the x-axis and y-axis scale based on the largest value for each attribute
        if (population === "Edu_No_High_School"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(maxmins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 50])
                .range([80, w - 50]);
        } else if (population === "Edu_High_School"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(blackMaxMins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 60])
                .range([80, w - 50]);
        } else if (population === "Edu_Associate"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(hispanicMaxMins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 50])
                .range([80, w - 50]);
        } else if (population === "Edu_Bachelors"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(asianMaxMins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 50])
                .range([80, w - 50]);
        } else if (population === "Edu_Graduate"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(otherMaxMins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 50])
                .range([80, w - 50]);
        }

        var xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d')).tickSize(-400,0,0);
        var yAxis = d3.axisLeft(yScale).ticks(10).tickSize(-w + 130,0,0);

        allChart.append('g').attr('class', 'axis')
            .attr('transform', 'translate(0, 430)')
            .call(xAxis)
            .selectAll('text')
            .style('font-size', '12px')
            .style('font-family', 'futura')
            .style('font-weight', 700)
            .style('fill', '#ddd')
            .attr('transform', 'translate(0, 5)');

        allChart.append('g').attr('class', 'yaxis')
            .attr('transform', 'translate(80, 0)')
            .transition()
            .duration(750)
            .call(yAxis)
            .selectAll('text')
            .style('font-size', '12px')
            .style('fill', '#ddd')
            .attr('transform', 'translate(-5,0)');

        allChart.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -250)
            .attr('y', 20)
            .style('text-anchor', 'middle')
            .style('fill', '#ddd')
            .text('Number of People');

        allChart.append('text')
            .attr('x', 340)
            .attr('y', 470)
            .style('text-anchor', 'middle')
            .style('font-weight', 300)
            .style('fill', '#ddd')
            .text('Percent of Population');

        allChart.selectAll('points')
            .data(census)
            .enter()
            .append('rect')
            .attr('class', function(d){
                return 't' + d.properties.Tract;
            })
            .attr('x', function(d){
                return xScale(Math.floor((d.properties[population] / d.properties.Pop_Total)*100));
            })
            .attr('y', function(d){
                return yScale(Math.floor(d.properties[population]/150) * 150) - 6;
            })
            .attr('width', 6)
            .attr('height', 6)
            .style('fill-opacity', function(d){
                var percent = (d.properties[population] / d.properties.Pop_Total);
                if ((percent) < 0.10){
                    return 0.10;
                } else if ((percent) > 0.10 && (percent) < 0.21){
                    return 0.25;
                } else if ((percent) > 0.20 && (percent) < 0.30){
                    return 0.40;
                } else if ((percent) > 0.30 && (percent) < 0.40){
                    return 0.55;
                } else if ((percent) > 0.40){
                    return 0.90;
                }
            })
            .style('opacity', 1)
            .style('fill', function(){
                if (population === 'Edu_No_High_School'){ return colorScale(0); }
                if (population === 'Edu_High_School'){ return colorScale(1); }
                if (population === 'Edu_Associate'){ return colorScale(2); }
                if (population === 'Edu_Bachelors'){ return colorScale(3); }
                if (population === 'Edu_Graduate'){ return colorScale(4); }
            })
            .on('mouseenter', function(d){
                d3.selectAll('.' + this.getAttribute('class'))
                    .style('stroke-width', 2)
                    .style('stroke', '#dddddd');

                tip.show(d);
            })
            // .on('click', function(d){
            //     allChart.selectAll('rect')
            //         .style('stroke-width', 0)
            //         .style('stroke', 'none');

            //     d3.selectAll('.' + this.getAttribute('class'))
            //         .style('stroke-width', 2)
            //         .style('stroke', '#dddddd');

            //     tip.show(d);
            // })
            .on('mouseleave', function(d){
                d3.selectAll('.' + this.getAttribute('class'))
                    .style('stroke-width', 0)
                    .style('stroke', '#dddddd');

                tip.hide(d);
            });
    }

    //Assign actions to the race buttons to update the charts
    d3.select('#nohs').on('click', function(){
        allChart.selectAll('rect').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateEducationPoints('Edu_No_High_School');
    });

    d3.select('#hs').on('click', function(){
        allChart.selectAll('rect').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateEducationPoints('Edu_High_School');
    });

    d3.select('#bachelor').on('click', function(){
        allChart.selectAll('rect').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateEducationPoints('Edu_Bachelors');
    });

    d3.select('#associate').on('click', function(){
        allChart.selectAll('rect').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateEducationPoints('Edu_Associate');
    });

    d3.select('#grad').on('click', function(){
        allChart.selectAll('rect').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateEducationPoints('Edu_Graduate');
    });
}