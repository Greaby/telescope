const pagerank = require("graphology-pagerank");

module.exports = (graph) => {
    let rank_graph = graph.copy();

    rank_graph.nodes().forEach((node) => {
        if (rank_graph.getNodeAttribute(node, "isolated")) {
            rank_graph.dropNode(node);
        }
    });

    const ranks = pagerank(rank_graph);

    Object.entries(ranks).forEach(([node, value]) => {
        graph.setNodeAttribute(node, "pagerank", value);
    });
};
