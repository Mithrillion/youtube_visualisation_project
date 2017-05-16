var diameter = 960,
    radius = diameter / 2,
    innerRadius = radius - 120;

var cluster = d3.cluster()
    .size([360, innerRadius]);

var line = d3.radialLine()
    .curve(d3.curveBundle.beta(0.85))
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var svg = d3.select("#clusters_plot").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

var link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node");

// d3.json("data/clusters/plot_cluster_0_05.json", function(error, classes) {
//     if (error) throw error;
//
//     // var n_nodes = 100;
//
//     var first_n = classes.slice(0, n_nodes);
//     if(n_nodes < classes.length){
//         var rest = classes.slice(n_nodes, classes.length).map(x_view => x_view.name);
//         first_n.forEach(function(term){
//             term.imports = term.imports.filter(name => !rest.includes(name));
//         });
//         // console.log(first_n);
//     }
//
//     var root = packageHierarchy(first_n)
//         .sum(function(d) { return d.size; });
//
//     cluster(root);
//
//     link = link
//         .data(packageImports(root.leaves()))
//         .enter().append("path")
//         .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
//         .attr("class", "link")
//         .attr("d", line);
//
//     node = node
//         .data(root.leaves())
//         .enter().append("text")
//         .attr("class", "node")
//         .attr("dy", "0.31em")
//         .attr("transform", function(d) { return "rotate(" + (d.x_view - 90) + ")translate(" + (d.y_view + 8) + ",0)" + (d.x_view < 180 ? "" : "rotate(180)"); })
//         .attr("text-anchor", function(d) { return d.x_view < 180 ? "start" : "end"; })
//         .text(function(d) { return d.data.key; })
//         .on("mouseover", mouseovered)
//         .on("mouseout", mouseouted);
// });

CLS_ROOT = 'data/clusters/';

function read_data(n_nodes, json){
    d3.json(CLS_ROOT + json, function(error, classes) {
        if (error) throw error;

        // var n_nodes = 100;

        var first_n = classes.slice(0, n_nodes);
        if(n_nodes < classes.length){
            var rest = classes.slice(n_nodes, classes.length).map(x => x.name);
            first_n.forEach(function(term){
                term.imports = term.imports.filter(name => !rest.includes(name));
            });
            // console.log(first_n);
        }

        var root = packageHierarchy(first_n)
            .sum(function(d) { return d.size; });

        cluster(root);

        link = link
            .data(packageImports(root.leaves()))
            .enter().append("path")
            .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
            .attr("class", "link")
            .attr("d", line);

        node = node
            .data(root.leaves())
            .enter().append("text")
            .attr("class", "node")
            .attr("dy", "0.31em")
            .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
            .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
            .text(function(d) { return d.data.key; })
            .on("mouseover", mouseovered)
            .on("mouseout", mouseouted);
    });
}

read_data(100, d3.select("#perc_overlap").property('value'));

// listener for n_tags slider
d3.select("#n_tags").on('change', function(){
    d3.select("#clusters_plot svg").remove();
    svg = d3.select("#clusters_plot").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    link = svg.append("g").selectAll(".link");
    node = svg.append("g").selectAll(".node");
    read_data(this.value, d3.select("#perc_overlap").property('value'));
    d3.select("#n_tag_counter").text(this.value);
});

d3.select("#perc_overlap").on('change', function(){
    d3.select("#clusters_plot svg").remove();
    svg = d3.select("#clusters_plot").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    link = svg.append("g").selectAll(".link");
    node = svg.append("g").selectAll(".node");
    read_data(d3.select("#n_tags").property('value'), this.value);
});

function mouseovered(d) {
    node
        .each(function(n) { n.target = n.source = false; });

    link
        //.classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
        .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
        .filter(function(l) { return l.target === d || l.source === d; })
        .raise();

    node
        .classed("node--target", function(n) { return n.target; })
        //.classed("node--source", function(n) { return n.source; });
}

function mouseouted(d) {
    link
        //.classed("link--target", false)
        .classed("link--source", false);

    node
        .classed("node--target", false)
        //.classed("node--source", false);
}

// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
    var map = {};

    function find(name, data) {
        var node = map[name], i;
        if (!node) {
            node = map[name] = data || {name: name, children: []};
            if (name.length) {
                node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                node.parent.children.push(node);
                node.key = name.substring(i + 1);
            }
        }
        return node;
    }

    classes.forEach(function(d) {
        find(d.name, d);
    });

    return d3.hierarchy(map[""]);
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
    var map = {},
        imports = [];

    // Compute a map from name to node.
    nodes.forEach(function(d) {
        map[d.data.name] = d;
    });

    // For each import, construct a link from the source to target node.
    nodes.forEach(function(d) {
        if (d.data.imports) d.data.imports.forEach(function(i) {
            imports.push(map[d.data.name].path(map[i]));
        });
    });

    return imports;
}