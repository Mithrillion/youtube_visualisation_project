/**
 * Created by mithrillion on 17/05/17.
 */

STATS_ROOT = "data/stats/";  // move to first script

function render_vc(json){
    var svg1 = d3.select("#stat1").append("svg").attr("width", 1000).attr("height", 400).attr("id", "stat1_plot"),
        margin1 = {top: 20, right: 20, bottom: 30, left: 120},
        width1 = +svg1.attr("width") - margin1.left - margin1.right,
        height1 = +svg1.attr("height") - margin1.top - margin1.bottom;

    var tooltip_views = d3.select("#stat1").append("div").attr("class", "toolTip");

    var x_view = d3.scaleLinear().range([0, width1]);
    var y_view = d3.scaleBand().range([height1, 0]);

    var g1 = svg1.append("g")
        .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

    d3.json(STATS_ROOT + json, function(error, data) {
        if (error) throw error;

        data.sort(function(a, b) { return a.views - b.views; });

        // x_view.domain([0, d3.max(data, function(d) { return d.views; })]);
        x_view.domain([0, 25000]);
        y_view.domain(data.map(function(d) { return d.group; })).padding(0.1);

        g1.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height1 + ")")
            .call(d3.axisBottom(x_view).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height1]));

        g1.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y_view));

        g1.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("height", y_view.bandwidth())
            .attr("y", function(d) { return y_view(d.group); })
            .attr("width", function(d) { return x_view(d.views); })
            .on("mouseover", function(d){
                tooltip_views
                    .style("left", d3.mouse(this)[0] + 200 + "px")
                    .style("top", d3.mouse(this)[1] + 50 + "px")
                    .style("display", "inline-block")
                    .style("position", "absolute")
                    .html((d.group) + "<br>" + "views:&nbsp" + Math.round(100.*d.views)/100);
            })
            .on("mouseout", function(d){ tooltip_views.style("display", "none");});
    });
}

render_vc("overall.json");