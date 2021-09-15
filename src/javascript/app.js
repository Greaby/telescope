import Graph from "graphology";
import Sigma from "sigma";

const BASE_SIZE = 2;

const loadSigma = async (json_file) => {
    let data = await fetch(json_file).then((response) => response.json());
    const graph = new Graph();
    graph.import(data);

    graph.forEachNode((node, attributes) => {
        let color = null;
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
        graph.setNodeAttribute(
            node,
            "size",
            BASE_SIZE * Math.sqrt(graph.degree(node))
        );
    });

    const settings = {
        labelRenderedSizeThreshold: 10,
    };

    const container = document.getElementById("graph-container");
    const renderer = new Sigma(graph, container, settings);

    renderer.on("clickNode", ({ node, captor, event }) => {
        let slug = graph.getNodeAttribute(node, "slug");
        let type = graph.getNodeAttribute(node, "type");
        window.location = `./${type}-${slug}.html`;
    });
};

let json_file = "./index.json";

let path = window.location.href.split("/").pop();

if (path !== "") {
    json_file = "./" + path.replace(".html", ".json");
}

loadSigma(json_file);
