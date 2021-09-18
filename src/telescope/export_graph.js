const forceAtlas2 = require("graphology-layout-forceatlas2");

module.exports = (graph) => {
    forceAtlas2.assign(graph, {
        iterations: 1000,
        settings: {
            gravity: 0.8,
        },
    });

    return JSON.stringify(graph.export());
};
