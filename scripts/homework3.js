
var mapSvg;

var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };

var mapData;
var timeData;

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function () {
  mapSvg = d3.select('#map');
  lineSvg = d3.select('#linechart');
  lineWidth = +lineSvg.style('width').replace('px', '');
  lineHeight = +lineSvg.style('height').replace('px', '');;
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;



  // Load both files before doing anything else
  Promise.all([d3.json('data/africa.geojson'),
  d3.csv('data/africa_gdp_per_capita.csv')])
    .then(function (values) {

      mapData = values[0];

      timeData = values[1];

      drawMap();
    })

});

// Get the min/max values for a year and return as an array
// of size=2. You shouldn't need to update this function.
function getExtentsForYear(yearData) {
  var max = Number.MIN_VALUE;
  var min = Number.MAX_VALUE;
  for (var key in yearData) {
    if (key == 'Year')
      continue;
    let val = +yearData[key];
    if (val > max)
      max = val;
    if (val < min)
      min = val;
  }
  return [min, max];
}

// Draw the map in the #map svg
function drawMap() {

  // create the map projection and geoPath
  let projection = d3.geoMercator()
    .scale(400)
    .center(d3.geoCentroid(mapData))
    .translate([+mapSvg.style('width').replace('px', '') / 2,
    +mapSvg.style('height').replace('px', '') / 2.3]);
  let path = d3.geoPath()
    .projection(projection);

  //reference  the #year-input input box, and get the current year
  let yearAttrib = document.getElementById('year-input').value;
  console.log(`year = ${yearAttrib}`);

  // get the selected year based on the input box's value
  var year = yearAttrib;


  // get the GDP values for countries for the selected year
  let yearData = timeData.filter(d => d.Year == year)[0];

  // get the min/max GDP values for the selected year
  let extent = getExtentsForYear(yearData);

  //get the selected color scale 
  let colorscaleAttrib = document.getElementById('color-scale-select').value;
  console.log(`colorscale = ${colorscaleAttrib}`);

  // get the selected color scale based on the dropdown value
  var RdYlGn = d3.scaleSequential(d3.interpolateRdYlGn).domain(extent),
    Viridis = d3.scaleSequential(d3.interpolateViridis).domain(extent),
    BrBG = d3.scaleSequential(d3.interpolateBrBG).domain(extent),
    PiYG = d3.scaleSequential(d3.interpolatePiYG).domain(extent),
    Accent = d3.scaleOrdinal(d3.schemeAccent).domain(extent);

  var div = d3.select("body").append("div")
    .attr("class", "tooltip-donut")
    .style("opacity", 0);






  mapSvg.select('g').remove();

  // draw the map on the #map svg
  let g = mapSvg.append('g');
  g.selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', d => { return d.properties.name })
    .attr('class', 'countrymap')
    .style('fill', d => {
      let val = +yearData[d.properties.name];
      if (isNaN(val))
        return 'white';
      if (colorscaleAttrib == 'interpolateRdYlGn')
        return RdYlGn(val);
      else if (colorscaleAttrib == 'interpolateViridis')
        return Viridis(val);
      else if (colorscaleAttrib == 'interpolateBrBG')
        return BrBG(val);
      else if (colorscaleAttrib == 'interpolatePiYG')
        return PiYG(val);
      else return Accent(val);
    })


    .on('mouseover', function (d, i) {
      console.log('mouseover on ' + d.gdp);
      d3.select(this).transition()
        .duration('50')
        .attr('opacity', '.85');
      div.transition()
        .duration(50)
        .style("opacity", 1);
      let show = ('Country: ' + d.properties.name) + '<br/>' + 'GDP: ' + yearData[d.properties.name];
      div.html(show)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 15) + "px");

    })
    .on('mousemove', function (d, i) {
      console.log('mousemove on ' + d.properties.name);
    })
    .on('mouseout', function (d, i) {
      console.log('mouseout on ' + d.properties.name);
      d3.select(this).transition()
        .duration('50')
        .attr('opacity', '1');
      div.transition()
        .duration('50')
        .style("opacity", 0);
    })
    .on('click', function (d, i) {
      console.log('clicked on ' + d.properties.name);
      drawLineChart(d.properties.name);

    })
    .call(function legend() {
      margin = ({ top: 20, right: 40, bottom: 30, left: 40 });
      width = 280;
      height = 550;
      barHeight = 20;
      const defs = mapSvg.append("defs");
      //reference  the #year-input input box, and get the current year
      let yearAttrib = document.getElementById('year-input').value;
      console.log(`year = ${yearAttrib}`);

      // get the selected year based on the input box's value
      var year = yearAttrib;
      // get the GDP values for countries for the selected year
      let yearData = timeData.filter(d => d.Year == year)[0];

      // get the min/max GDP values for the selected year
      let extent = getExtentsForYear(yearData);


      let colorscaleAttrib = document.getElementById('color-scale-select').value;
      console.log(`colorscale = ${colorscaleAttrib}`);

      if (colorscaleAttrib == 'interpolateRdYlGn')
        colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain(extent);
      else if (colorscaleAttrib == 'interpolateViridis')
        colorScale = d3.scaleSequential(d3.interpolateViridis).domain(extent);
      else if (colorscaleAttrib == 'interpolateBrBG')
        colorScale = d3.scaleSequential(d3.interpolateBrBG).domain(extent);
      else if (colorscaleAttrib == 'interpolatePiYG')
        colorScale = d3.scaleSequential(d3.interpolateBrBG).domain(extent);
      else colorScale = d3.scaleOrdinal(d3.schemeAccent).domain(extent);


      axisScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([margin.left, width - margin.right]);

      axisBottom = g => g
        .attr("class", `x-axis`)
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(axisScale)
          .ticks(width / 60)
          .tickSize(-barHeight));





      const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");

      linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100 * i / n.length}%`, color: colorScale(t) })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);



      g.append('g')
        .attr("transform", `translate(0,${height - margin.bottom - barHeight})`)
        .append("rect")
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr("width", 200)
        .attr("height", 20)
        .style("fill", "url(#linear-gradient)");

      g.append('g')
        .call(axisBottom);

      return mapSvg.node();

    })





}










// Draw the line chart in the #linechart svg for
// the country argument (e.g., `Algeria').
function drawLineChart(country) {
  console.log('enter into drawLineChart: ' + country);


  lineSvg.select('g').remove();
  const xScale = d3.scaleLinear();
  var lineData;

  // get the GDP values for countries
  timeData.forEach(d => {
    for (var key in d) {
      if (key == "Year")
        d.Year = +d.Year;
      else
        d[key] = +d[key];
    }
    lineData = timeData;

    xScale.domain(d3.extent(timeData, function (d) { return d.Year; }))
      .range([0, lineInnerWidth]);

  });




  const g = lineSvg.append('g')
    .attr('transform', `translate(${lineMargin.left},${lineMargin.top})`);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(lineData, d => d[country])])
    .range([lineInnerHeight, 0]);



  g.append('g')
    .style('fill', 'gray')
    .call(d3.axisLeft(yScale));

  g.append('g')
    .style('fill','gray')
    .attr('transform', `translate(0,${lineInnerHeight})`)
    .call(d3.axisBottom(xScale));

  const singleLine = d3.line()
    .x(d => xScale(d.Year))
    .y(d => yScale(d[country]));




  g.append('path')
    .datum(lineData)
    .attr('class', 'singleLine')
    .style('fill', 'none')
    .style('stroke', 'black')
    .style('stroke-size', '2')
    .attr("d", singleLine)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

    //add chart label
    g.append("text")
    .attr("class","xLabel")
    .attr("text-anchor","end")
    .attr("x",lineInnerWidth/2)
    .attr("y",lineInnerHeight+35)
    .text("Year")
    .style("fill","grey");

    g.append("text")
    .attr("class","yLabel")
    .attr("text-anchor","end")
    .attr("x",-lineMargin.left)
    .attr("y",-lineMargin.left+30)
    .attr("dy",".75em")
    .attr("transform","rotate(-90)")
    .style("fill","grey")
    .text("GDP for " + country +" (based on crrent USD");



  // Create a rect on top of the svg area: this rectangle recovers mouse position

  g
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', width)
    .attr('height', height)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);


  // This allows to find the closest X index of the mouse:
  var bisect = d3.bisector(function (d) { return d.Year; }).left;
  // Create the circle that travels along the curve of chart
  var focus = g
    .append('g')
    .append('circle')
    .style("fill", "none")
    .attr("stroke", "black")
    .attr('r', 8.5)
    .style("opacity", 0);


  // Create the text that travels along the curve of chart
  var focusText = g
    .append('g')
    .append('text')
    .style("opacity", 0)
    .attr("text-anchor", "left")
    .attr("alignment-baseline", "middle")

  // What happens when the mouse move -> show the annotations at the right positions.
  function mouseover() {
    focus.style("opacity", 1)
    focusText.style("opacity", 1)
  }

  function mousemove() {
    // recover coordinate we need
    var x0 = xScale.invert(d3.mouse(this)[0]);
    var i = bisect(lineData, x0, 1);
    selectedData = lineData[i]
    focus
      .attr("cx", xScale(selectedData.Year))
      .attr("cy", yScale(selectedData[country]))
    focusText
      .html("Year:" + selectedData.Year + "</br> " + "GDP: " + selectedData[country])
      .attr("x", xScale(selectedData.Year) + 15)
      .attr("y", yScale(selectedData[country]))
  }
  function mouseout() {
    focus.style("opacity", 0)
    focusText.style("opacity", 0)
  }


  if (!country)
    return;

}







