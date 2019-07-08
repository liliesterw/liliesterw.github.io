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


var margin = {top: 20, right: 0, bottom: 20, left: 0};
width = 800 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom,
formatPercent = d3.format(".1%");

var centered;
// https://bl.ocks.org/mbostock/2206590


queue()
.defer(d3.csv, "d3/data/ex_airbnb_rev.csv")
.defer(d3.json, "d3/data/geojson-vic.json")
.defer(d3.csv, "d3/data/bed.csv")
.await(ready);

var legendText1 = ['-36K',,,,0,,,,'380K'];
var legendColors1 = ["red","#EC1E24","#ef4c4f","#F28083","#BFBFBD","#a8c6a1","#7DC66C","#0C9D0A","green"];

var year = 2015
function ready(error, data, us,beds) {
	data.forEach(function(d) {
		d.area = +d.area;
		d.year = +d.year;
		d.zipcode = +d.zipcode;
		d.id = +d.id;
	});

	var dataByCountyByYear = d3.nest()
	.key(function(d) { return d.name; })
	.map(data);


	var counties  = us
	var rev = data
	counties.features.forEach(function(county) {
		// console.log(county,'county')
		county.properties.data = 
		dataByCountyByYear[county.properties['name']]
	});

	var color1 = d3.scale.threshold()
	.domain([-36000,-24000,-12000,-1,1,2000,100000,200000,380000])
	.range(["red","#EC1E24","#ef4c4f","#F28083","#BFBFBD","#a8c6a1","#7DC66C","#0C9D0A","green"]);

	var projection = d3.geo.azimuthal()
	.origin([144.964600, -37.020100])
	.translate([330,-900])
	.scale(80000);

	var path = d3.geo.path()
	.projection(projection);

	

	
	var svg = d3.select("#map1").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	

	tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

	// info = d3.select("#map1").append("div")
	// .attr("class", "info")
	// .style("opacity", 0);


	svg.append("rect")
	.attr("class", "background")
	.attr("width", width)
	.attr("height", height)
	.on("click", clicked);

	
	
	// var states = svg.append("g")
	// .attr("id", "states")
	// .data(counties.features);

	var states = svg.selectAll(".county")
	.data(counties.features)
	.enter()
	.append("path")
	.attr("d", path)
	.attr("class", function(d) {
		return "county" ;
	})
	.on("click", clicked);

	states.selectAll("path")
	.data(counties.features)
	.enter().append("path")
	.attr("name", function(d) {
		return d.properties["name"];
	})
	.attr("fill", function(d) {
		return color1(d.properties.data["0"].id);
	})

	.attr("d", path);



	d3.selection.prototype.appendHTML =
    d3.selection.enter.prototype.appendHTML = function(HTMLString) {
        return this.select(function() {
            return this.appendChild(document.importNode(new DOMParser().parseFromString(HTMLString, 'text/html').body.childNodes[0], true));
        });
    };

	states
	.on("mouseover", function(d) {
		// console.log(d)
		

		tooltip.transition()
		.duration(250)
		.style("opacity", 1);
		tooltip.html(
			"<p><strong>" + d.properties['name']+"</strong></p>" +
			"<table><tbody><tr><td class='wide'>Differences :</td><td>" + d.properties.data["0"].id  + "</td></tr></tbody></table>"
			)
		.style("left", (d3.event.pageX + 15) + "px")
		.style("top", (d3.event.pageY - 28) + "px");
	})
	.on("mouseout", function(d) {
		tooltip.transition()
		.duration(250)
		.style("opacity", 0);


	});

	var legend = svg.append("g")
	.attr("id", "legend");

	var legenditem1 = legend.selectAll(".legenditem1")
	.data(d3.range(9))
	.enter()
	.append("g")
	.attr("class", "legenditem1")
	.attr("transform", function(d, i) { return "translate(" + i * 15 + ",0)"; });

	legenditem1.append("rect")
	.attr("x", width - 700 )
	.attr("y", height - 7)
	.attr("width", 30)
	.attr("height", 10)
	.attr("class", "rect")
	.style("fill", function(d, i) { return legendColors1[i]; });

	legenditem1.append("text")
	.attr("x", width -700 )
	.attr("y", height -10)
	.style("color", "black")
	.text(function(d, i) { return legendText1[i]; });

	function update(year){
		// console.log(year)
		slider.property("value", year);
		d3.select(".year").text(year);
		states.style("fill", function(d) {
			return color1(d.properties.data["0"].id)
		});
	}

	function updateInfo(area,zipcode,rev){
		d3.select(".info-area").text(area);
		d3.select(".info-zipcode").text(zipcode);

		d3.select("#section-hidden").style("visibility","");
		d3.select("#section-hidden2").style("visibility","");
		d3.select("#general-info-title").style("visibility","hidden");
		d3.select("#general-info-title-beds").style("visibility","");
		if(rev > 0){
			d3.select(".info-rev-plus").style("color","green").text(rev);
			d3.select(".info-profit").style("color","black").text("Airbnb is more profitable");
		}
		else if(rev == 0){
			d3.select(".info-rev-plus").style("color","black").text(rev);
			d3.select(".info-profit").style("color","black").text("There is no data");
		}
		else{
			d3.select(".info-rev-plus").text(rev).style("color","red");
			d3.select(".info-profit").style("color","black").text("Rent Yearly is more profitable");
		}

		var obj;
		d3.select("#chartBR").remove()
		d3.select('#chartBedRate').append('div').attr('id','chartBR');
			d3.json('d3/data/dataset.json',function(error,data){
				
			data.sort(function(a,b){
    			return a[4] - b[4];
			})
			  var newArray = data.filter(function (el) {
				  return el.zipcode == zipcode;
				});

			  function removeDuplicates(arr){
				    let unique_array = []
				    let unique_data =[]
				    for(let i = 0;i < arr.length; i++){
				        if(unique_array.indexOf(arr[i]['year']) == -1){
				            unique_array.push(arr[i]['year'])
				            unique_data.push(arr[i])
				        }
				    }
				    return unique_data
				}

			  // console.log(removeDuplicates(newArray))
			  obj = d3.clusterpuritychart().containerID('chartBR').noOfCategories(3).fixAngleLayout(false);
			  d3.select('#chartBR').append('svg').datum(removeDuplicates(newArray)).call(obj);
			});
			d3.select('#click_1').on('click',clickFun);
			d3.select('#click_2').on('click',clickFun);
			function clickFun(){
			  obj.change(document.getElementById('click_1').checked);
			}
		
	}
	
	var slider = d3.select(".slider1")
	.append("input")
	.attr("class","slider1")
	.attr("type", "range")
	.attr("min", 2015)
	.attr("max", 2019)
	.attr("step", 1)
	.on("input", function() {
		year = this.value;
		update(year);
	});
	function clicked(d) {
		var x, y, k;
		console.log(d)
		updateInfo(d.properties['name'],d.properties.data["0"].zipcode,d.properties.data["0"].id)
		if (d && centered !== d) {
			var centroid = path.centroid(d);
			x = centroid[0];
			y = centroid[1];
			k = 4;
			centered = d;
		} else {
			x = width / 2;
			y = height / 2;
			k = 1;
			centered = null;
		}

		states.selectAll("path")
		.classed("active", centered && function(d) { return d === centered; });

		states.transition()
		.duration(750)
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
		.style("stroke-width", 1.5 / k + "px");

		// console.log(d)
	}
	update(2015);

}

d3.select(self.frameElement).style("height", "685px");