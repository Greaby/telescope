const forceAtlas2 = require("graphology-layout-forceatlas2");

module.exports = (graph) => {
    forceAtlas2.assign(graph, {
        iterations: 1000,
        settings: {
            gravity: 0.5,
            //adjustSizes: true,
        },
    });

    return graph.export();
};
