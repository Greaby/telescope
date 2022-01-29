const pagerank = require("graphology-pagerank");

module.exports = (graph) => {
    let rank_graph = graph.copy();

    rank_graph.forEachNode((node, attributes) => {
        if (attributes.hidden) {
            rank_graph.dropNode(node);
        }
    });

    const ranks = pagerank(rank_graph);

    Object.entries(ranks).forEach(([node, value]) => {
        graph.setNodeAttribute(node, "pagerank", value);
    });
};
