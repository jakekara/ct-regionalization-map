import "./style/main.scss";
import Legend from "../Legend";

var d3 = require("d3");
var topojson = require("topojson");
var pym = require("pym.js");
// var MapConn = require("../MapConn")

function draw(data, connTowns){

    var colors = {
        small_town:"#f2f79e",
        small_school:"#8fb8de",
        both:"#73ab84",
        two_schools:"#8c7284"
    }

    var data = data, connTowns = connTowns;

    d3.select("#root").html("")

    var bbox = d3.select("#root").node().getBoundingClientRect(),
    width = bbox.width,
    height = width / 1.65;


    console.log("Got school data", data);
    console.log("Got shape data, yo", connTowns);

    var legendBox = d3.select("#root").append("div").classed("legend", true);

    var caption = d3.select("#root").append("div").classed("caption", true).html("&nbsp;");


    var legend = new Legend(legendBox, [
        {
            "label":"Small town",
            //"color":"white",
            "class":"smalltown-item"
        },
        // {
        //     "label":"Small district",
        //     //"color":"black",
        //     "class":"smalldistrict-item"
        // },
        {
            "label":"Small town & district",
            //"color":"black",
            "class":"both-item"
        },{
            "label":"(est.) 2 schools or fewer",
            //"color":"black",
            "class":"twoschools-item"
        }
    ],{
    })
    legend.draw();

    var svg = d3.select("#root").append("svg")
    .attr("width", width)
    .attr("height", height);

    console.log("1")

    var projection = d3.geoMercator()
    .rotate([72.7, 0, 0])
    .center([0, 41.52])
    .scale(width * 22)
    .translate([width/ 2, height / 2]);;

    console.log("2")
    var path = d3.geoPath()
    .projection(projection)

    console.log("3")
    console.log(connTowns.objects)

    console.log(topojson.feature(connTowns, connTowns.objects["ct_towns_s"]));

    var towns = svg.selectAll('.town')
        .data(topojson.feature(connTowns, connTowns.objects.ct_towns_s).features)
        .enter()
        .append('path')
        .attr('class', 'town')
        .attr('d', path)
        .attr("id", function(d){ return d.id})

    function townData(townGeo){
        var town = townGeo.id;
        var matches = data.filter(function(a){ return a["Town"] === town});
        if (matches.length !== 1){ return {}}
        return matches[0];
    }

    // colorize
    function getColor(townGeo){
        console.log("Getting color", townGeo, data);
        var town = townGeo.id.replace("_","");
        var matches = data.filter(function(a){ return a["Town"] == town});
        console.log(town, matches, town)

        if (matches.length !== 1){ return "white"}

        console.log("match", matches[0])

        var small_town = matches[0].lt_2000 == "True",
            small_pop = matches[0].pop_int < 10 * 1000,
            two_schools = (Number(matches[0].ELEM) === 1) || (Number(matches[0].ELEM)  === 2),
            both = (small_town && small_pop) || (matches[0].pop_int < 2000)
        
        if (both){
            return colors["both"];
        }
        if (small_pop){
            return colors["small_school"]
        }
        if (small_town){
            return colors["small_town"]
        }
        if (two_schools){
            return colors["two_schools"]
        }
        return "white";
    }


    towns.style("fill", getColor)
    .style("stroke-color", "gray");

    towns.on("mouseover", function(d){
        console.log(d)
        caption.text(d.id.replace("_"," "));   
    });

    towns.on("mouseout", function(){ caption.html("&nbsp;") });
    console.log("DONE")

}
console.log("Getting data");

d3.csv("index.csv").then(function (d) {
    var data = d;

    d3.json("shapes/ct_towns.topojson").then(function (d) {

        var width=900,height=600;
        var connTowns = d;
        draw(data, connTowns);

        var timeout;
        function scheduleRedraw(){
            clearTimeout(timeout);
            timeout = setTimeout(function(){ draw(data, connTowns);}, 150);
    
        }
        

        if (window.addEventListener){ window.addEventListener("resize", scheduleRedraw, false); }
        else if (window.attachEvent) { window.attachEvent("onresize", scheduleRedraw); }

    });
});

pym.Child({ polling: 500 });