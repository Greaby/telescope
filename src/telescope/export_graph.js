const forceAtlas2 = require("graphology-layout-forceatlas2");
const random = require("graphology-layout/random");

module.exports = (graph) => {
    random.assign(graph);

    graph.forEachNode((node, attributes) => {
        if (attributes.isolated) {
            graph.dropNode(node);
        }
    });

    forceAtlas2.assign(graph, {
        iterations: 1000,
        settings: {
            gravity: 0.8,
        },
    });

    // Optimization of the JSON file size
    graph.forEachNode((node, _attributes) => {
        graph.removeNodeAttribute(node, "pagerank");
        graph.updateNodeAttribute(node, "x", (x) => Math.round(x));
        graph.updateNodeAttribute(node, "y", (y) => Math.round(y));
    });

    return JSON.stringify(graph.export());
};
