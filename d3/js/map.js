///////////////AZIMUTHAL
var d3_geo_radians = Math.PI / 180;
// TODO clip input coordinates on opposite hemisphere
d3.geo.azimuthal = function() {
  var mode = "orthographic", // or stereographic, gnomonic, equidistant or equalarea
  origin,
  scale = 200,
  translate = [480, 250],
  x0,
  y0,
  cy0,
  sy0;

  function azimuthal(coordinates) {
  	var x1 = coordinates[0] * d3_geo_radians - x0,
  	y1 = coordinates[1] * d3_geo_radians,
  	cx1 = Math.cos(x1),
  	sx1 = Math.sin(x1),
  	cy1 = Math.cos(y1),
  	sy1 = Math.sin(y1),
  	cc = mode !== "orthographic" ? sy0 * sy1 + cy0 * cy1 * cx1 : null,
  	c,
  	k = mode === "stereographic" ? 1 / (1 + cc)
  	: mode === "gnomonic" ? 1 / cc
  	: mode === "equidistant" ? (c = Math.acos(cc), c ? c / Math.sin(c) : 0)
  	: mode === "equalarea" ? Math.sqrt(2 / (1 + cc))
  	: 1,
  	x = k * cy1 * sx1,
  	y = k * (sy0 * cy1 * cx1 - cy0 * sy1);
  	return [
  	scale * x + translate[0],
  	scale * y + translate[1]
  	];
  }

  azimuthal.invert = function(coordinates) {
  	var x = (coordinates[0] - translate[0]) / scale,
  	y = (coordinates[1] - translate[1]) / scale,
  	p = Math.sqrt(x * x + y * y),
  	c = mode === "stereographic" ? 2 * Math.atan(p)
  	: mode === "gnomonic" ? Math.atan(p)
  	: mode === "equidistant" ? p
  	: mode === "equalarea" ? 2 * Math.asin(.5 * p)
  	: Math.asin(p),
  	sc = Math.sin(c),
  	cc = Math.cos(c);
  	return [
  	(x0 + Math.atan2(x * sc, p * cy0 * cc + y * sy0 * sc)) / d3_geo_radians,
  	Math.asin(cc * sy0 - (p ? (y * sc * cy0) / p : 0)) / d3_geo_radians
  	];
  };

  azimuthal.mode = function(x) {
  	if (!arguments.length) return mode;
  	mode = x + "";
  	return azimuthal;
  };

  azimuthal.origin = function(x) {
  	if (!arguments.length) return origin;
  	origin = x;
  	x0 = origin[0] * d3_geo_radians;
  	y0 = origin[1] * d3_geo_radians;
  	cy0 = Math.cos(y0);
  	sy0 = Math.sin(y0);
  	return azimuthal;
  };

  azimuthal.scale = function(x) {
  	if (!arguments.length) return scale;
  	scale = +x;
  	return azimuthal;
  };

  azimuthal.translate = function(x) {
  	if (!arguments.length) return translate;
  	translate = [+x[0], +x[1]];
  	return azimuthal;
  };

  return azimuthal.origin([0, 0]);
};
/////AZIMUTHAL


var margin = {top: 20, right: 20, bottom: 20, left: 20};
width = 800 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom,
formatPercent = d3.format(".1%");

queue()
.defer(d3.csv, "d3/data/zip_count.csv")
.defer(d3.json, "d3/data/geojson-vic.json")
.await(ready);

var legendText = ["0", "60", "120", "180", "240"];
var legendColors = ["#FFFFFF","#D0D0D0","#A0A0A0","#707070","#202020"];

var year = 2015
function ready(error, data, us) {
	data.forEach(function(d) {
		d.area = +d.area;
		d.year = +d.year;
		d.zipcode = +d.zipcode;
		d.id = +d.id;
	});

	var dataByCountyByYear = d3.nest()
	.key(function(d) { return d.name; })
	.key(function(d) { return d.year; })
	.map(data);

	var counties  = us

	counties.features.forEach(function(county) {
		// console.log(county,'county')
		county.properties.years = dataByCountyByYear[county.properties['name']]
	});

	var color = d3.scale.threshold()
	.domain([0,20,40,60,80,100,120,140,160,180,200,1000,5000])
	.range(["#FFFFFF","#F0F0F0","#E0E0E0","#D0D0D0","#C0C0C0","#B0B0B0","#A0A0A0","#909090","#808080","#707070","#606060","#505050","#202020"]);

	var projection = d3.geo.azimuthal()
	.origin([144, -37])
	.translate([-800,-1100])
	.scale(90000);

	var path = d3.geo.path()
	.projection(projection);

	

	
	var svg = d3.select("#map").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);	


	var legend = svg.append("g")
	.attr("id", "legend");

	var legenditem = legend.selectAll(".legenditem")
	.data(d3.range(9))
	.enter()
	.append("g")
	.attr("class", "legenditem")
	.attr("transform", function(d, i) { return "translate(" + i * 50 + ",0)"; });

	legenditem.append("rect")
	.attr("x", width - 700)
	.attr("y", height-7)
	.attr("width", 100)
	.attr("height", 10)
	.attr("class", "rect")
	.style("fill", function(d, i) { return legendColors[i]; });

	legenditem.append("text")
	.attr("x", width - 710)
	.attr("y", height -10)
	.style("fill", "white")
	.text(function(d, i) { return legendText[i]; });

	
	// var states = svg.append("g")
	// .attr("id", "states")
	// .data(counties.features);

	var states = svg.selectAll(".county")
		.data(counties.features)
		.enter()
		.append("path")
			.attr("class", "county")
			.attr("d", path);

	states.selectAll("path")
	.data(counties.features)
	.enter().append("path")
	.attr("name", function(d) {

		return d.properties["name"];
	})
	.attr("fill", function(d) {
		return color(d.properties.years[year]["0"].id);
	})
	.attr("d", path);

	states
	.on("mouseover", function(d) {
		tooltip.transition()
		.duration(250)
		.style("opacity", 1);
			tooltip.html(
			"<p><strong>" + d.properties['name']+"</strong></p>" +
			"<table><tbody><tr><td class='wide'>Total Listing :</td><td>" + d.properties.years[year]["0"].id  + "</td></tr></tbody></table>"
			)
			.style("left", (d3.event.pageX + 15) + "px")
			.style("top", (d3.event.pageY - 28) + "px");
		})
	.on("mouseout", function(d) {
		tooltip.transition()
		.duration(250)
		.style("opacity", 0);
	});

	
	function update(year){
		slider.property("value", year);
		d3.select(".mapyear").text(year);
		states.style("fill", function(d) {
			d3.select(".map-info").text("Total listing : "+d.properties.years[year][0].total);
			return color(d.properties.years[year][0].id)
		});
	}
	


	var slider = d3.select(".slider")
	.append("input")
	.attr("class","slider")
	.attr("type", "range")
	.attr("min", 2015)
	.attr("max", 2019)
	.attr("step", 1)
	.on("input", function() {
		year = this.value;
		console.log(year)
		
		update(year);
	});

	update(2015);

}

d3.select(self.frameElement).style("height", "685px");