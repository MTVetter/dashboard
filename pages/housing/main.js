//JavaScript file for the Housing page
var f = d3.format('.2');
var e = d3.format('.1f');

//Create the projection for the topojson file
var projection = d3.geoConicConformal()
    .parallels([30, 50])
    .rotate([-20, 90])
    .scale(6000)
    .center([-122.5, -20.2]);
var geoPathGenerator = d3.geoPath().projection(projection);

var projection2 = d3.geoAlbers()
    .center([25.5, 17.5])
    .rotate([35, -12.5, 0])
    .translate([400, 350])
    .scale(450);
var geoPathGenerator2 = d3.geoPath().projection(projection2);

//Load the data using d3.queue
d3.queue()
    .defer(d3.json, '../../data/censusTractsUpdated.json')
    .awaitAll(function(error, results){
        generateHouseholdMap(results[0]);
        generateHouseholdChart(results[0]);

        generateIncomeMap(results[0]);
        generateIncomeChart(results[0]);
    });

d3.queue()
    .defer(d3.json, '../../data/hgac.json')
    .defer(d3.csv, '../../data/HousingUnits.csv')
    .awaitAll(function(error, results){
        generateUnitsMap(results[0], results[1]);
    });

//Create the household map function
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

//Create the household chart function
function generateHouseholdChart(data){
    //Create the color scale for the chart using the same colors as the map
    var colorScale = d3.scaleThreshold()
        .domain([0,500,1000,1500,2000,2500])
        .range(['#0c2c84','#225ea8', '#1d91c0', '#41b6c4', '#7fcdbb', '#c7e9b4', '#ffffcc'].reverse());

    //Create the chart
    var allChart = d3.select('#householdChart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500);

    //Get the data
    var census = topojson.feature(data, data.objects.tracts).features;
    var maxmins = [];
    census.forEach(function(i){
        maxmins.push(i.properties.Pov_Rate);
    });

    //Create the tooltip for the chart
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .style('font-family', 'futura')
        .html(function(d){
            return '<p>Tract: ' + d.properties.Tract + '<br/># of Households: ' + d.properties.HH_Total +
            '<br/>Poverty Rate: '+ d.properties.Pov_Rate+'</p>';
        });

    //Atach the tooltip to the chart container
    allChart.call(tip);

    //Width of the chart
    var w = $('#householdChart').width();

    //Create the x-axis and y-axis scale based on the largest value for each attribute
    var xScale = d3.scaleLinear()
        .domain([0, 8500])
        .range([80, w - 50]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(maxmins)])
        .range([430, 30]);

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
        .attr('y', 40)
        .style('text-anchor', 'middle')
        .style('fill', '#ddd')
        .text('Poverty Rate');

    allChart.append('text')
        .attr('x', 340)
        .attr('y', 470)
        .style('text-anchor', 'middle')
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .text('Number of Households');

    allChart.selectAll('points')
        .data(census)
        .enter()
        .append('circle')
        .attr('class', function(d){
            return 't' + d.properties.Tract;
        })
        .attr('cx', function(d){
            return xScale(Math.floor(d.properties.HH_Total));
        })
        .attr('cy', function(d){
            return yScale(Math.floor(d.properties.Pov_Rate));
        })
        .attr('r', 2.5)
        .style('fill-opacity', 1)
        .style('opacity', 1)
        .style('fill', function(d){
            var hhNumber = d.properties.HH_Total;
            return colorScale(hhNumber);
        })
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
}

//Create the function to generate the housing units map
function generateUnitsMap(data, stats){
    var nested_crashes = d3.nest()
        .key(function(d) { return d.county; })
        .entries(stats);

    //Determine scales for the charts
    function findMax(data){
        var crashValues = [];
        crashValues[0] = [];
        crashValues[1] = [];

        nested_crashes.forEach(function(i){
            if (i.key == data){
                i.values.forEach(function(j){
                    crashValues[0].push(+j.Med_HU_value);
                    crashValues[1].push(+j.Inc_HH_Median);
                });
            }
        });

        return [d3.max(crashValues[0]), d3.max(crashValues[1])];
    }
    var colorScale = d3.scaleThreshold()
        .domain([0,15000,50000,125000,200000,250000])
        .range(['#f0f0ff', '#aaa7ff', '#9b97f1', '#7c77d6', '#6f6abb', '#615da1', '#545086']);

    var svgContainer_Units = d3.select('#housingMap')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500)
        .style('overflow', 'visible');

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d){
            return '<p>County: ' + d.properties.County +
            '<br>Total Housing Units: ' + d.properties.HU_Total +
            '<br>Median Household Income: ' + d.properties.Inc_HH_Median +
            '<br>Median House Value: ' + d.properties.Med_Hu_val + '</p>'
        });

    svgContainer_Units.call(tip);

    svgContainer_Units.selectAll('rect').remove();
    svgContainer_Units.selectAll('text').remove();

    var tractMap = svgContainer_Units.selectAll('.tracts')
        .data(topojson.feature(data, data.objects.counties).features)
        .enter()
        .append('path')
        .attr('class', function(d){ return d.properties.County; })
        .attr('d', function(d, i){ return geoPathGenerator2(d); })
        .style('fill', function(d){
            return colorScale(d.properties.HU_Total);
        })
        .style('fill-opacity', 1)
        .style('opacity', 1)
        .on('click', function(d){
            //Get the attribute for the class
            var thisreg = this.getAttribute('class');
            //Select all paths within the SVG container and make the outline black
            svgContainer_Units.selectAll('path')
                .style('stroke', '#191b1d')

            //Select all classes of a particular county and make the outline white
            d3.selectAll('.' + thisreg)
                .style('stroke', 'white')

            //Create the y-axis for the first chart
            var yScale = d3.scaleLinear().domain([0, findMax(thisreg)[0]]).range([400, 10]);
            var yAxis = d3.axisLeft(yScale).tickSize(-250, 0, 0).tickFormat(d3.format(','));

            //Select the chart area and create a transition
            d3.selectAll('.area').transition().style('fill', 'none');

            //Select the y-axis label and update the text and color based on the values
            chartContainer.select('.yaxis')
                .transition()
                .duration(750)
                .call(yAxis)
                .selectAll('text')
                .style('fill', colorScale(findMax(thisreg)[0]))
                .style('font-size', '12px')
                .attr('transform', 'translate(-5,0)');

            //Repeat the previous process for the other chart
            var yScale = d3.scaleLinear().domain([0, findMax(thisreg)[1]]).range([400, 10]);
            var yAxis = d3.axisLeft(yScale).tickSize(-250, 0, 0).tickFormat(d3.format(','));

            chartContainer2.select('.yaxis')
                .transition()
                .duration(750)
                .call(yAxis)
                .selectAll('text')
                .style('fill', colorScale(findMax(thisreg)[1]))
                .style('font-size', '12px')
                .attr('transform', 'translate(-5,0)');

            circleMaker(thisreg);
        })
        .on('mouseenter', function(d){
            tip.show(d);
            d3.select(this).style('opacity', 0.5).style('cursor', 'pointer');
        })
        .on('mouseleave', function(d){
            tip.hide(d);
            d3.select(this).style('opacity', 1);
        });

    //Select the first chart and add an SVG element
    var chartContainer = d3.select('#valueChart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500)
        .style('overflow', 'visible');

    var chartContainer2 = d3.select('#incomeChart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500)
        .style('overflow', 'visible');

    //Label the axis for each chart
    chartContainer.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -250)
        .attr('y', 5)
        .style('font-weight', 400)
        .style('fill', '#ddd')
        .text('Median House Value');

    chartContainer2.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -270)
        .attr('y', 5)
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .text('Median Household Income');

    //Assign scales and axis
    var xScale = d3.scaleLinear().domain([2012, 2020]).range([60, 300]);
    var yScale = d3.scaleLinear().domain([0, findMax('Harris')[0]]).range([400, 20]);

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

    var yScale = d3.scaleLinear().domain([0, findMax('Harris')[1]]).range([400, 20]);
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

    circleMaker('Harris');

    //Function to create the data for the charts
    function circleMaker(town){
        chartContainer.selectAll('path').remove();
        chartContainer2.selectAll('path').remove();

        nested_crashes.forEach(function(i){
            i.values.forEach(function(j){
                if (j.county == town){
                    var yScale = d3.scaleLinear().domain([0, findMax(town)[0]]).range([400, 20]);

                    var areamaker = d3.area()
                        .x(function(d){ return xScale(d.year); })
                        .y1(function(d){ return yScale(d.Med_HU_value); })
                        .y0(function(d){ return yScale(0); });

                    chartContainer.append('path')
                        .datum(i.values)
                        .attr('class', 'area')
                        .attr('d', areamaker)
                        .style('fill', colorScale(findMax(i.key)[0]))
                        .style('stroke', 'none')
                        .style('opacity', 0.5);

                    var yScale = d3.scaleLinear().domain([0, findMax(town)[1]]).range([400, 20]);

                    var areamaker2 = d3.area()
                        .x(function(d){ return xScale(d.year); })
                        .y1(function(d){ return yScale(d.Inc_HH_Median); })
                        .y0(function(d){ return yScale(0); });

                    chartContainer2.append('path')
                        .datum(i.values)
                        .attr('class', 'area')
                        .attr('d', areamaker2)
                        .style('fill', colorScale(findMax(i.key)[1]))
                        .style('stroke', 'none')
                        .style('opacity', 0.5);
                }
            });
        });
    }

    //Create the map legend
    var xPos = 5;
    var yPos = 40;
    var height = 600;

    //background
    svgContainer_Units.append('text')
        .style('font-weight', 700)
        .style('fill', '#ddd')
        .attr('x', xPos)
        .attr('y', yPos - 10)
        .text('Housing Units');

    //Create the lowest legend
    svgContainer_Units.append('rect')
        .style('fill', colorScale(250))
        .style('stroke', 'none')
        .attr('x', xPos)
        .attr('y', yPos)
        .attr('height', '7px')
        .attr('width', height / 35);
    svgContainer_Units.append('text')
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .attr('x', xPos + 25)
        .attr('y', yPos + 7)
        .text('< 15,000');

    svgContainer_Units.append('rect')
        .style('fill', colorScale(47000))
        .style('stroke', 'none')
        .attr('x', xPos)
        .attr('y', yPos + 15)
        .attr('height', '7px')
        .attr('width', height / 35);
    svgContainer_Units.append('text')
        .style('font-weight', 300)
        .style('fill', '#ddd')
        .attr('x', xPos + 25)
        .attr('y', yPos + 22)
        .text('15,001 - 50,000');

    svgContainer_Units.append("rect")
        .style("fill", colorScale(105850))
        .style("stroke", "none")
        .attr("x", xPos)
        .attr("y", yPos + 30)
        .attr("height", "7px")
        .attr("width", height/35);
    svgContainer_Units.append("text")
        .style("font-weight", 300)
        .style('fill', '#ddd')
        .attr("x", xPos + 25)
        .attr("y", yPos + 37)
        .text('50,001 - 125,000');

    svgContainer_Units.append("rect")
        .style("fill", colorScale(175000))
        .style("stroke", "none")
        .attr("x", xPos)
        .attr("y", yPos + 45)
        .attr("height", "7px")
        .attr("width", height/35);
    svgContainer_Units.append("text")
        .style("font-weight", 300)
        .style('fill', '#ddd')
        .attr("x", xPos + 25)
        .attr("y", yPos + 52)
        .text('125,001 - 200,000');

    svgContainer_Units.append("rect")
        .style("fill", colorScale(249000))
        .style("stroke", "none")
        .attr("x", xPos)
        .attr("y", yPos + 60)
        .attr("height", "7px")
        .attr("width", height/35);
    svgContainer_Units.append("text")
        .style("font-weight", 300)
        .style('fill', '#ddd')
        .attr("x", xPos + 25)
        .attr("y", yPos + 67)
        .text('200,001 - 250,00');

    svgContainer_Units.append("rect")
        .style("fill", colorScale(275000))
        .style("stroke", "none")
        .attr("x", xPos)
        .attr("y", yPos + 75)
        .attr("height", "7px")
        .attr("width", height/35);
    svgContainer_Units.append("text")
        .style("font-weight", 300)
        .style('fill', '#ddd')
        .attr("x", xPos + 25)
        .attr("y", yPos + 82)
        .text('> 250,000');
}

//Function to create income map
function generateIncomeMap(data){
    //Create the color scale
    var colorScale = d3.scaleLinear()
        .domain([0,1,2,3,4])
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']);

    var svgContainer_Education = d3.select('#incomeMap')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500)
        .style('overflow', 'visible');

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d){
            return '<p>Tract: ' + d.properties.Tract +
             '<br/>Household Income Below 25K: ' + d.properties.Inc_Below_25 +
             '<br/>Household Income 25 - 50K: ' + d.properties.Inc_25To50 +
             '<br/>Household Income 50 - 100K: ' + d.properties.Inc_50To100 +
             '<br/>Household Income Above 100K: ' + d.properties.Inc_Above_100 +
             '</p>';
        });

    svgContainer_Education.call(tip);

    colorEducationMap = function(percent){
        //Determine which button is selected
        if (percent === 'Inc_Below_25'){ var keyColor = colorScale(0); var keyMult = 5; }
        if (percent === 'Inc_25To50'){ var keyColor = colorScale(1); var keyMult = 10; }
        if (percent === 'Inc_50To100'){ var keyColor = colorScale(2); var keyMult = 10; }
        if (percent === 'Inc_Above_100'){ var keyColor = colorScale(3); var keyMult = 10; }

        svgContainer_Education.selectAll('rect').remove();
        svgContainer_Education.selectAll('text').remove();

        var tractMap = svgContainer_Education.selectAll('.tracts')
            .data(topojson.feature(data, data.objects.tracts).features)
            .enter()
            .append('path')
            .attr('class', function(d){ return 't' + d.properties.Tract; })
            .attr('d', function(d, i){ return geoPathGenerator(d); })
            .style('fill', function(d){
                if (percent === 'Inc_Below_25'){ return colorScale(0); }
                if (percent === 'Inc_25To50'){ return colorScale(1); }
                if (percent === 'Inc_50To100'){ return colorScale(2); }
                if (percent === 'Inc_Above_100'){ return colorScale(3); }
            })
            .style('fill-opacity', function(d){
                return ((d.properties[percent] / d.properties.HH_Total)) * 3 / keyMult * 5;
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
    $('#below25').on('click', function(){
        svgContainer_Education.selectAll('path').remove();
        colorEducationMap('Inc_Below_25');
    });

    $('#inc25to50').on('click', function(){
        svgContainer_Education.selectAll('path').remove();
        colorEducationMap('Inc_25To50');
    });

    $('#inc50to100').on('click', function(){
        svgContainer_Education.selectAll('path').remove();
        colorEducationMap('Inc_50To100');
    });

    $('#above100').on('click', function(){
        svgContainer_Education.selectAll('path').remove();
        colorEducationMap('Inc_Above_100');
    });
}

//Create the income chart function
function generateIncomeChart(data){
    //Create the color scale for the chart using the same colors as the map
    var colorScale = d3.scaleLinear()
        .domain([0,1,2,3,4])
        .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']);

    //Create the chart
    var allChart = d3.select('#houseIncomeChart')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 500);
        // .style('overflow', 'visible');

    //Get the data
    var census = topojson.feature(data, data.objects.tracts).features;

    //Create the tooltip for the chart
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d){
            return '<p>Tract: ' + d.properties.Tract +
             '<br/>Household Income Below 25K: ' + d.properties.Inc_Below_25 +
             '<br/>Household Income 25 - 50K: ' + d.properties.Inc_25To50 +
             '<br/>Household Income 50 - 100K: ' + d.properties.Inc_50To100 +
             '<br/>Household Income Above 100K: ' + d.properties.Inc_Above_100 +
             '</p>';
        });

    //Atach the tooltip to the chart container
    allChart.call(tip);

    //Initially set the chart to white population
    populateEducationPoints('Inc_Below_25');

    //Initially set the map to white population
    colorEducationMap('Inc_Below_25');

    function populateEducationPoints(population){
        //Array to hold all values for each race
        var maxmins = [];
        var blackMaxMins = [];
        var asianMaxMins = [];
        var hispanicMaxMins = [];

        //Loop through all the data and "extract" the values to the corresponding arrays
        census.forEach(function(i){
            maxmins.push(i.properties.Inc_Below_25);
            blackMaxMins.push(i.properties.Inc_25To50);
            asianMaxMins.push(i.properties.Inc_50To100);
            hispanicMaxMins.push(i.properties.Inc_Above_100);
        });

        //Width of the chart
        var w = $('#houseIncomeChart').width();

        //Create the x-axis and y-axis scale based on the largest value for each attribute
        if (population === "Inc_Below_25"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(maxmins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 100])
                .range([80, w - 50]);
        } else if (population === "Inc_25To50"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(blackMaxMins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 100])
                .range([80, w - 50]);
        } else if (population === "Inc_50To100"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(asianMaxMins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 100])
                .range([80, w - 50]);
        } else if (population === "Inc_Above_100"){
            var yScale = d3.scaleLinear()
                .domain([0, d3.max(hispanicMaxMins)])
                .range([430, 30]);

            var xScale = d3.scaleLinear()
                .domain([0, 100])
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
            .text('Number of Households');

        allChart.append('text')
            .attr('x', 340)
            .attr('y', 470)
            .style('text-anchor', 'middle')
            .style('font-weight', 300)
            .style('fill', '#ddd')
            .text('Percent of Households');

        allChart.selectAll('points')
            .data(census)
            .enter()
            .append('circle')
            .attr('class', function(d){
                return 't' + d.properties.Tract;
            })
            .attr('cx', function(d){
                if (isNaN(Math.floor((d.properties[population] / d.properties.HH_Total)*100))){
                    return xScale(0);
                } else {
                    return xScale(Math.floor((d.properties[population] / d.properties.HH_Total)*100));
                }
                
            })
            .attr('cy', function(d){
                return yScale(Math.floor(d.properties[population]/150) * 150) - 6;
            })
            .attr('r', 3)
            .style('fill-opacity', function(d){
                var percent = (d.properties[population] / d.properties.HH_Total);
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
                if (population === 'Inc_Below_25'){ return colorScale(0); }
                if (population === 'Inc_25To50'){ return colorScale(1); }
                if (population === 'Inc_50To100'){ return colorScale(2); }
                if (population === 'Inc_Above_100'){ return colorScale(3); }
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
    d3.select('#below25').on('click', function(){
        allChart.selectAll('circle').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateEducationPoints('Inc_Below_25');
    });

    d3.select('#inc25to50').on('click', function(){
        allChart.selectAll('circle').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateEducationPoints('Inc_25To50');
    });

    d3.select('#inc50to100').on('click', function(){
        allChart.selectAll('circle').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateEducationPoints('Inc_50To100');
    });

    d3.select('#above100').on('click', function(){
        allChart.selectAll('circle').remove();
        allChart.selectAll('.yaxis').remove();
        allChart.selectAll('.axis').remove();
        populateEducationPoints('Inc_Above_100');
    });
}