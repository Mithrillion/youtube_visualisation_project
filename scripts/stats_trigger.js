/**
 * Created by mithrillion on 17/05/17.
 */

// trigger happy? (place at last loading script of stats page)
var json = "overall.json";
d3.selectAll(".stats-trigger").on('change', function(){
    console.log("triggered by " + this.id + "! value = " + this.value );
    var group;
    if (this.value === 'all'){
        json = "overall.json";
        group = 'all';
    } else {
        json = "g_" + this.value + ".json";
        group = this.value.toString();
    }
    d3.select("#stat1_plot").remove();
    d3.select("#stat2_plot").remove();
    d3.select("#lang_plot").remove();
    render_vc(json);
    render_ld(json, d3.select("#ld-switch").property("checked"));
    render_lg('lang.json', group);
});

d3.select("#ld-switch").on('change', function(){
    console.log("ld-switch changed! value = " + this.checked);
    d3.select("#stat2_plot").remove();
    render_ld(json, this.checked);
});