/**
 * Created by Peter on 10/05/2017.
 */
d3.xml("data/clusters/hsbm-small.svg").mimeType("image/svg+xml").get(function(error, xml) {
    if (error) throw error;
    xml.documentElement.setAttribute("width", "100%");
    xml.documentElement.setAttribute("height", "100%");
    document.getElementById("clusters_plot").appendChild(xml.documentElement);
});