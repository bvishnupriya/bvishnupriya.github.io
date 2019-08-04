
var margin = {top: 20, right: 20, bottom: 20, left: 20};
width = 1200 - margin.left - margin.right,
height = 700 - margin.top - margin.bottom,
format = d3.format(",");

var svg = d3.select("#map").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

tooltip =
d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);
var dFormat= d3.format(".0%");

var parameters = location.search.substring(1).split("&");
var temp = parameters[0].split("=");
var yearFrom = unescape(temp[1]);

queue()
.defer(d3.csv,
"https://raw.githubusercontent.com/vishnupriya-b/CSV/master/WDIData_exports.csv")
.defer(d3.json,
"https://raw.githubusercontent.com/vishnupriya-b/CSV/master/world.geojson")
.await(ready);


function ready(error, data,
mapdata) {

data.forEach(function(d) {
d.CountryCode = d.CountryCode;
d.Years =+d.Years;
d.Exports=d3.round(+d.Exports,2);
});

var exportDataByYear = d3.nest()
.key(function(d) { return d.CountryCode; })
.key(function(d) { return d.Years; })
.map(data);


mapdata.features.forEach(function(country) {

var id=country.id;

if(typeof exportDataByYear[id] != "undefined"){

country.years = exportDataByYear[id];
}
});


var color = d3.scale.threshold()
.domain([0, 20, 40, 60 ,80 ,100, 140 , 180])
.range(["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014","#cc4c02", "#993404", "#662506"]);


var projection =
d3.geo.mercator().scale(200).center([0,30]).translate([width / 2, height
/ 2]);

var path = d3.geo.path().projection(projection);

var countryShapes = svg.selectAll(".country")
.data(mapdata.features)
.enter()
.append("path")
.attr("class", "country")
.attr("d", path);

svg.append("path")
.datum(topojson.feature(mapdata, function(a, b) { return a !== b; }))
.attr("class", "countries")
.attr("d", path);



function update(year){
localStorage.setItem("year", year);
slider.property("value", year);
d3.select(".year").text(year);
countryShapes.style("fill", function(d) {
if(typeof d.years != "undefined"){
var value =d.years[year][0].Exports;
return color(value)
}
});
countryShapes
.on("mouseover", function(d) {
tooltip.transition()
.duration(250)
.style("opacity", 1);
if(typeof d.years!= "undefined"){
tooltip.html(
"<strong>Country: </strong><span class='details'>" + d.years[year][0].CountryName + "<br></span>" + "<strong>Exports(%): </strong><span class='details'>" +format(d.years[year][0].Exports) +"</span>"
)
.style("left", (d3.event.pageX + 15) + "px")
.style("top", (d3.event.pageY - 28) + "px");
}
})
.on("mouseout", function(d) {
tooltip.transition()
.duration(250)
.style("opacity", 0);
});
}
var slider = d3.select(".slider")
.append("input")
.attr("type", "range")
.attr("min", 1998)
.attr("max", 2017)
.attr("step", 1)
.on("input", function() {
var year = this.value;

update(year);
});

update(yearFrom);

}

d3.select(self.frameElement).style("height", "685px");