STATS_ROOT = "data/stats/";  // move to first script

// load the csv and create the chart
function render_ld(json, asPercentage) {
    // create the svg
    var svg2 = d3.select("#stat2").append("svg").attr("width", 1000).attr("height", 400).attr("id", "stat2_plot"),
        margin2 = {top: 20, right: 20, bottom: 30, left: 40},
        width2 = +svg2.attr("width") - margin2.left - margin2.right,
        height2 = +svg2.attr("height") - margin2.top - margin2.bottom,
        g2 = svg2.append("g").attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    // set x scale
    var x = d3.scaleBand()
        .rangeRound([0, width2])
        .paddingInner(0.05)
        .align(0.1);

    // set y scale
    var y = d3.scaleLinear()
        .rangeRound([height2, 0]);

    // set the colors
    var z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    d3.json(STATS_ROOT + json, function(error, data) {
        if (error) throw error;

        var keys = ['likes', 'dislikes'];

        // remove invalid values
        data = data.filter(d => d.likes >=0 && d.dislikes >=0);

        if (asPercentage){
            data.forEach(function(d){
                var total = d.likes + d.dislikes;
                d.likes = d.likes / total;
                d.dislikes = d.dislikes / total;
            })
        }

        if (asPercentage){
            data.sort(function(a, b) { return b.likes - a.likes; });
        } else {
            data.sort(function(a, b) { return b.likes + b.dislikes - a.likes - a.dislikes; });
        }

        x.domain(data.map(function(d) { return d.group; }));
        // y.domain([0, d3.max(data, function(d) { return d.likes + d.dislikes; })]).nice();
        if (asPercentage){
            y.domain([0, 1]).nice();
        } else {
            y.domain([0, 250]).nice();
        }
        z.domain(keys);

        g2.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys)(data))
            .enter().append("g")
            .attr("fill", function(d) { return z(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter().append("rect")
            .attr("x", function(d) { return x(d.data.group); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .on("mouseover", function() { tooltip.style("display", null); })
            .on("mouseout", function() { tooltip.style("display", "none"); })
            .on("mousemove", function(d) {
                var xPosition = d3.mouse(this)[0] - 5;
                var yPosition = d3.mouse(this)[1] - 5;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select("text").text(Math.round(100.*d[1]-100.*d[0])/100);
            });

        g2.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height2 + ")")
            .call(d3.axisBottom(x));

        g2.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start");

        var legend = g2.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", width2 - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);

        legend.append("text")
            .attr("x", width2 - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });
    });

    // Prep the tooltip bits, initial display is hidden
    var tooltip = svg2.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

    tooltip.append("rect")
        .attr("width", 60)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.5);

    tooltip.append("text")
        .attr("x", 30)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");
};

render_ld("overall.json", false);