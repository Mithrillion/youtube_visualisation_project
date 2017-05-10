/**
 * Created by mithrillion on 10/05/17.
 */
var color = d3.scaleLinear()
    .domain([0, 10, 120])
    .range(['red', 'green', 'blue']);


var cloud = d3.layout.cloud().size([1000, 700])
//.words(frequency_list)
//.rotate(0)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    //.font("Impact")
    .fontSize(function(d) { return d.size; })
    .spiral("archimedean")
    .padding(5)
    .on("end", draw);

function draw(words) {
    d3.select("#cloud_plot").append("svg")
        .attr("width", 1000)
        .attr("height", 700)
        .attr("class", "wordcloud")
        .append("g")
        // without the transform, words words would get cutoff to the left and top, they would
        // appear outside of the SVG area
        .attr("transform", "translate(500,350)")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-family", "Impact")
        .attr("text-anchor", "middle")
        .style("font-size", function(d) { return d.size * 0.7 + "px"; })
        .style("fill", function(d, i) { return color(i); })
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
}

WC_ROOT = 'data/word_cloud/';

d3.json(WC_ROOT + "top100_views.json", function(json){
    cloud.words(json);
    cloud.start();
});

d3.select('#word_cloud')
    .on('change', function() {
        var new_json = d3.select(this).property('value');
        d3.json(WC_ROOT + new_json, function(json){
            cloud.words(json);
            d3.select("svg.wordcloud").remove();
            cloud.start();
        })
    });

// trigger happy?
d3.selectAll(".cloud-trigger").on('change', function(){
    console.log("triggered by " + this.id + "!");
});