/**
 * Created by mithrillion on 19/05/17.
 */

PK_ROOT = "data/words/";

function draw_packed(json){
    var svg = d3.select("#words").append("svg").attr("width", 800).attr("height", 800).attr("id", "word_plot"),
        margin = 20,
        diameter = +svg.attr("width"),
        g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var color = d3.scaleLinear()
        .domain([-1, 5])
        .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);

    var pack = d3.pack()
        .size([diameter - margin, diameter - margin])
        .padding(2);

    d3.json(PK_ROOT + json, function(error, root) {
        if (error) throw error;

        root = d3.hierarchy(root)
            .sum(function(d) { return Math.pow(d.size, 2); })
            .sort(function(a, b) { return b.value - a.value; });

        var focus = root,
            nodes = pack(root).descendants(),
            view;

        var circle = g.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function(d) { return d.children ? color(d.depth) : (d.data.size > 0 ? "#0ACF00" : "#FF7400"); })
            .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

        var text = g.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "label")
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
            .style("font-size", "12px")
            .style("font-weight", "bold")
            // .text(function(d) { return d.data.name; });
            .text(function(d) { return d.data.children ? d.data.children.filter(c => c.size > 0).slice(0, 1).map(c => c.name).reduce((a, b) => a + "\t" + b) : d.data.name; });

        var node = g.selectAll("circle,text");

        svg
            // .style("background", color(-1))
            .on("click", function() { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d) {
            var focus0 = focus; focus = d;

            var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function(d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function(t) { zoomTo(i(t)); };
                });

            transition.selectAll("#word_plot text")
                .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
                .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
        }

        function zoomTo(v) {
            var k = diameter / v[2]; view = v;
            node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function(d) { return d.r * k; });
        }
    });

    // var svg_w = d3.select("#words").append("svg").attr("width", 1000).attr("height", 1000).attr("id", "word_plot"),
    //     diameter = +svg_w.attr("width"),
    //     g = svg_w.append("g").attr("transform", "translate(2,2)"),
    //     format = d3.format(",d");
    //
    // var pack = d3.pack()
    //     .size([diameter - 4, diameter - 4]);
    //
    // d3.json(PK_ROOT + json, function(error, root) {
    //     if (error) throw error;
    //
    //     root = d3.hierarchy(root)
    //         .sum(function(d) { return d.size; })
    //         .sort(function(a, b) { return b.value - a.value; });
    //
    //     var node = g.selectAll(".node")
    //         .data(pack(root).descendants())
    //         .enter().append("g")
    //         .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
    //         .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    //
    //     node.append("title")
    //         .text(function(d) { return d.data.name + "\n" + format(d.value); });
    //
    //     node.append("circle")
    //         .attr("r", function(d) { return d.r; });
    //
    //     node.filter(function(d) { return !d.children; }).append("text")
    //         .attr("dy", "0.3em")
    //         .text(function(d) { return d.data.name.substring(0, d.r / 3); });
    // });
}

draw_packed("lsa_fame_all.json");

var sortOrder = 'fame';
var cls = 'all';

d3.selectAll(".words-trigger").on('change', function(){
    console.log("triggered by " + this.value + "!");
    sortOrder = this.value;
    d3.select("#word_plot").remove();
    draw_packed("lsa_" + sortOrder + "_" + cls + ".json");
});

d3.select("#group").on('change', function(){
    console.log("triggered by " + this.value + "!");
    cls = this.value;
    d3.select("#word_plot").remove();
    draw_packed("lsa_" + sortOrder + "_" + cls + ".json");
});