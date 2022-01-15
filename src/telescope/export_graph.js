const calculate_force_atlas = require("./calculate_force_atlas");

module.exports = (graph) => {
    graph.forEachNode((node, attributes) => {
        if (attributes.isolated) {
            graph.dropNode(node);
        }
    });

    calculate_force_atlas(graph);

    // Optimization of the JSON file size
    graph.forEachNode((node, _attributes) => {
        graph.removeNodeAttribute(node, "pagerank");
        graph.updateNodeAttribute(node, "x", (x) => Math.round(x));
        graph.updateNodeAttribute(node, "y", (y) => Math.round(y));
    });

    return JSON.stringify(graph.export());
};
