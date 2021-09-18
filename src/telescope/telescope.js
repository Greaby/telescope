const config = require("../../config");

const fs = require("fs");

const Twig = require("twig");
const { Graph } = require("graphology");

const parseMarkdown = require("./parse_markdown");
const exportGraph = require("./export_graph");
const getID = require("./ids");

module.exports = class Telescope {
    files_to_render = [];

    constructor() {
        this.timestamp = Date.now();
        this.graph = new Graph();
    }

    init_folder() {
        if (fs.existsSync(config.folders.dist)) {
            fs.rmSync(config.folders.dist, { recursive: true });
        }
        fs.mkdirSync(config.folders.dist);
    }

    async generate() {
        this.init_folder();

        const graph = this.graph;

        const fileNames = await fs.promises.readdir(config.folders.ressources);

        let citations = [];
        for (let index = 0; index < fileNames.length; index++) {
            if (fileNames[index][0] === ".") {
                continue;
            }

            const file_data = await parseMarkdown(
                `${config.folders.data}/ressources/${fileNames[index]}`
            );
            const { slug, id } = getID(
                fileNames[index].replace(".md", ""),
                "ressource"
            );

            this.files_to_render.push({
                type: "ressource",
                id: id,
                title: file_data.env.title,
                slug: slug,
                content: file_data.render,
            });

            if (!graph.hasNode(id)) {
                console.log(`add node ${slug}`);
                graph.addNode(id, {
                    label: file_data.env.title,
                    x: Math.floor(Math.random() * 100),
                    y: Math.floor(Math.random() * 100),
                    slug: slug,
                    type: "ressource",
                });
            }

            if (file_data.meta.citations) {
                file_data.meta.citations.forEach((citation) => {
                    let [type, slug] = citation.split(":");
                    citations.push([id, type, slug]);
                });
            }

            file_data.meta.authors.forEach(async (author) => {
                let { slug, id: authorID } = getID(author, "author");
                if (!graph.hasNode(authorID)) {
                    console.log(`add author node ${slug}`);
                    graph.addNode(authorID, {
                        label: author,
                        x: Math.floor(Math.random() * 100),
                        y: Math.floor(Math.random() * 100),
                        slug: slug,
                        type: "author",
                    });

                    let content = `<h1>${author}</h1>`;

                    if (fs.existsSync(`data/authors/${slug}.md`)) {
                        const author_data = await parseMarkdown(
                            `data/authors/${slug}.md`
                        );

                        content = author_data.render;
                    }

                    this.files_to_render.push({
                        type: "author",
                        id: authorID,
                        title: author,
                        slug: slug,
                        content: content,
                    });
                }

                graph.addEdge(authorID, id);
                graph.addEdge(id, authorID);
            });

            file_data.meta.tags.forEach(async (tag) => {
                const { slug, id: tagID } = getID(tag, "tag");
                if (!graph.hasNode(tagID)) {
                    console.log(`add tag node ${slug}`);
                    graph.addNode(tagID, {
                        label: tag,
                        x: Math.floor(Math.random() * 100),
                        y: Math.floor(Math.random() * 100),
                        slug: slug,
                        type: "tag",
                    });

                    let content = `<h1>${tag}</h1>`;

                    if (fs.existsSync(`data/tags/${slug}.md`)) {
                        const tag_data = await parseMarkdown(
                            `data/tags/${slug}.md`
                        );

                        content = tag_data.render;
                    }

                    this.files_to_render.push({
                        type: "tag",
                        id: tagID,
                        title: tag,
                        slug: slug,
                        content: content,
                    });
                }
                graph.addEdge(tagID, id);
                graph.addEdge(id, tagID);
            });
        }

        citations.forEach(([source_id, type, slug]) => {
            let { id: target_id } = getID(slug, type);

            if (graph.hasNode(target_id)) {
                console.log(`add citation ${source_id}->${slug}`);
                graph.addEdge(source_id, target_id);
            }
        });

        if (config.remove_isolated_tags) {
            graph.nodes().forEach((node) => {
                if (
                    graph.degree(node) <= config.isolated_tags_threshold &&
                    graph.getNodeAttribute(node, "type") === "tag"
                ) {
                    graph.dropNode(node);
                }
            });
        }

        this.calculate_nodes_size();

        // save main graph
        fs.writeFile(
            `${config.folders.dist}/index.json`,
            exportGraph(graph),
            function (err) {
                if (err) return console.log(err);
            }
        );

        // render html files
        this.files_to_render.forEach((data) => {
            Twig.renderFile(
                "./src/template.twig",
                {
                    timestamp: this.timestamp,
                    labels: config.labels,
                    title: data.title,
                    content: data.content,
                },
                (err, html) => {
                    fs.writeFile(
                        `${config.folders.dist}/${data.type}-${data.slug}.html`,
                        html,
                        function (err) {
                            if (err) return console.log(err);
                        }
                    );
                }
            );
        });

        // save index.html
        let main_data = await parseMarkdown(`${config.folders.data}/index.md`);

        Twig.renderFile(
            "./src/template.twig",
            {
                timestamp: this.timestamp,
                labels: config.labels,
                content: main_data.render,
            },
            (err, html) => {
                fs.writeFile(
                    `${config.folders.dist}/index.html`,
                    html,
                    function (err) {
                        if (err) return console.log(err);
                    }
                );
            }
        );

        // save sub graphs
        graph.forEachNode((node, attributes) => {
            const subGraph = new Graph();

            subGraph.addNode(node, attributes);

            graph.forEachNeighbor(node, function (neighbor, attributes) {
                if (!subGraph.hasNode(neighbor)) {
                    subGraph.addNode(neighbor, attributes);
                }
                subGraph.addEdge(node, neighbor);

                graph.forEachNeighbor(
                    neighbor,
                    function (secondNeighbor, attributes) {
                        if (!subGraph.hasNode(secondNeighbor)) {
                            subGraph.addNode(secondNeighbor, attributes);
                        }

                        subGraph.addEdge(neighbor, secondNeighbor);
                    }
                );
            });

            let file_name = [attributes.type, attributes.slug]
                .filter((n) => n)
                .join("-");

            fs.writeFile(
                `${config.folders.dist}/${file_name}.json`,
                exportGraph(subGraph),
                function (err) {
                    if (err) return console.log(err);
                }
            );
        });
    }

    calculate_nodes_size() {
        const BASE_SIZE = 3;
        const graph = this.graph;

        graph.forEachNode((node, attributes) => {
            graph.setNodeAttribute(
                node,
                "size",
                Math.round(BASE_SIZE * Math.sqrt(graph.degree(node)))
            );
        });
    }
};
