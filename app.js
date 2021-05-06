let dataLink="https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
// https request
const req = new XMLHttpRequest();

// variables for the canvas, set height, width and padding
let width = 1200;
let height = 400;
let padding = 60;

// declare svg to draw scales and variables later
let svg = d3.select("svg");
svg.attr("width", width);
svg.attr("height", height);

// create variables for x and y values
let dataPoint = [];
let baseTemp;
let variance;

let minYear;
let maxYear;

// create varibles for x and y scales
let xScale;
let yScale;
// create functions for scale x and y
let createScales = () => {
  // x scale for the year
  minYear = d3.min(dataPoint, (dataPoint) => dataPoint['year'])
  maxYear = d3.max(dataPoint, (dataPoint) => dataPoint["year"])
  xScale = d3.scaleLinear()
             .domain([minYear, maxYear])
             .range([padding, width - padding])

  //y scale for the months in a year
  yScale = d3.scaleTime()
             .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
             .range([height - padding, padding])
}

let drawScales = () => {
  let xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format('d'))

  let yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.timeFormat('%B'))
  svg.append("g")
     .call(yAxis)
     .attr("id", "y-axis")
     .attr("transform", "translate(" + padding + ", 0)")

  svg.append("g")
     .call(xAxis)
     .attr("id", "x-axis")
     .attr("transform", "translate(0, " + (height - padding) + ")")
}
// create funtion for dawing the cells
let drawCells = () => {
  // create div for tooltip
  let div = d3.select("body")
              .append("div")
              .attr("id", "tooltip")

  svg.selectAll("rect")
     .data(dataPoint)
     .enter()
     .append("rect")
     .attr("class", "cell")
     // create multiple different colors used for the variance
     // different range of variance collide with different colors
     .attr("fill", (dataPoint) => {
       variance = dataPoint['variance'];
       if (variance <= -6) {
         return "MidnightBlue";
       } else if (variance <= -3) {
         return "RoyalBlue";
       } else if (variance <= -1.5) {
         return "SkyBlue";
       } else if (variance <= 0) {
         return "LemonChiffon";
       } else if (variance <= 1) {
         return "Orange";
       } else if (variance <= 3) {
         return "DarkOrange";
       } else if (variance <= 5) {
         return "Coral";
       } else {
         return "Crimson";
       }
     })
     .attr("data-month", (dataPoint) => dataPoint["month"] -1)
     .attr("data-year", (dataPoint) => dataPoint["year"])
     .attr("data-temp", (dataPoint) => dataPoint["variance"] + baseTemp)
     .attr("height", (height - (2 * padding)) / 12)   //height of each rect cells
     .attr("y", (dataPoint) => {                      // y values of each rect cells
       return yScale(new Date(0, dataPoint["month"], 0, 0, 0, 0, 0))
      })
     .attr("width", (dataPoint) => {
       let xValues = maxYear - minYear;
       let cellXvalues = (width - (2*padding)) / xValues;
       return cellXvalues;
     })
     .attr("x", (dataPoint) => {
       return xScale(dataPoint["year"]);
     })
     .on("mouseover", function(dataPoint, index) {
       div.transition()
          .style("visibility", "visible")
          .attr("data-year", index["year"])
        let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        let baseTemperature = 8.66;
        div.html(
          "The temperature in the month of " + monthNames[index["month"] - 1] +
          " in " + index["year"] + " is " +
          (baseTemperature + index["variance"]).toFixed(2) + "\xB0C" + ". " +
          "The difference is " + (index["variance"]).toFixed(2) + "\xB0C" + "."
        )
     })
     .on("mouseout", function(dataPoint) {
       div.transition()
          .style("visibility", "hidden")
     })
}

req.open("GET", dataLink, true);
req.send();
req.onload = function(){
  const json = JSON.parse(req.responseText);
  baseTemp = json["baseTemperature"];
  dataPoint = json["monthlyVariance"];
  console.log(dataPoint)
  createScales();
  drawScales();
  drawCells();
}
