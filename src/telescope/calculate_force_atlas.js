const forceAtlas2 = require("graphology-layout-forceatlas2");
const random = require("graphology-layout/random");

module.exports = (graph) => {
    random.assign(graph);

    forceAtlas2.assign(graph, {
        iterations: 2000,
        settings: {
            gravity: 0.8,
        },
    });
};
