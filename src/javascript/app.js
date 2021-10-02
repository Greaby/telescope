import Graph from "graphology";
import Sigma from "sigma";
import config from "../../config";

const loadSigma = async (json_file) => {
    const container = document.querySelector("#graph-container");
    const currentNode = container.dataset.node;

    const data = await fetch(json_file).then((response) => response.json());

    const graph = new Graph();
    graph.import(data);

    graph.forEachNode((node, attributes) => {
        let color = null;

        if (node === currentNode) {
            graph.setNodeAttribute(node, "color", "#F2C84B");
            graph.setNodeAttribute(node, "size", config.graph.node_max_size);
            return;
        }

        switch (attributes.type) {
            case "ressource":
                color = "#D24335";
                break;
            case "tag":
                color = "#87AA66";
                break;
            case "author":
                color = "#4CB3D2";
                break;
        }

        graph.setNodeAttribute(node, "color", color);
    });

    const settings = {
        labelRenderedSizeThreshold: 15,
        defaultEdgeColor: "#e2e8f0",
    };

    const renderer = new Sigma(graph, container, settings);

    renderer.on("clickNode", ({ node, captor, event }) => {
        let slug = graph.getNodeAttribute(node, "slug");
        let type = graph.getNodeAttribute(node, "type");
        window.location = `./${type}-${slug}.html`;
    });
};

window.addEventListener("DOMContentLoaded", function () {
    let json_file = "./index.json";
    let path = window.location.href.split("/").pop();

    if (path !== "") {
        json_file = "./" + path.replace(".html", ".json");
    }

    loadSigma(json_file);
});
