const config = require("../../config");

const seedrandom = require("seedrandom");
seedrandom(config.seed, { global: true });

const fs = require("fs");

const Twig = require("twig");
const { Graph } = require("graphology");

const parseMarkdown = require("./parse_markdown");
const exportGraph = require("./export_graph");
const getID = require("./ids");
const { range } = require("./interpolation");

const { minify } = require("html-minifier");

const exportSitemamp = require("./export_sitemap");
const exportSearch = require("./export_search");
const calculate_pagerank = require("./calculate_pagerank");
const get_kd_tree = require("./get_kd_tree");

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

        let export_links = [];

        const fileNames = await fs.promises.readdir(config.folders.ressources);

        let citations = [];
        for (let index = 0; index < fileNames.length; index++) {
            if (fileNames[index][0] === ".") {
                continue;
            }

            const file_data = await parseMarkdown(
                `${config.folders.ressources}/${fileNames[index]}`
            );
            const { slug, id } = getID(
                fileNames[index].replace(".md", ""),
                "ressource"
            );

            if (!file_data.meta.authors) {
                file_data.meta.authors = [];
            }
            const authors = file_data.meta.authors.sort().map((author) => {
                let { slug } = getID(author, "author");
                return {
                    link: `author-${slug}.html`,
                    title: author,
                };
            });

            if (!file_data.meta.tags) {
                file_data.meta.tags = [];
            }
            const tags = file_data.meta.tags.sort().map((tag) => {
                const { slug } = getID(tag, "tag");
                return {
                    link: `tag-${slug}.html`,
                    title: tag,
                };
            });

            this.files_to_render.push({
                cat: "ressource",
                id: id,
                title: file_data.env.title,
                slug: slug,
                content: file_data.render,
                authors: authors,
                tags: tags,
            });

            if (!graph.hasNode(id)) {
                console.log(`add node ${slug}`);
                graph.addNode(id, {
                    label: file_data.env.title,
                    slug: slug,
                    cat: "ressource",
                });
            }

            if (file_data.meta.citations) {
                file_data.meta.citations.forEach((citation) => {
                    let [cat, slug] = citation.split(":");
                    citations.push([id, cat, slug]);
                });
            }

            file_data.meta.authors.forEach(async (author) => {
                let { slug, id: authorID } = getID(author, "author");
                if (!graph.hasNode(authorID)) {
                    console.log(`add author node ${slug}`);
                    graph.addNode(authorID, {
                        label: author,
                        slug: slug,
                        cat: "author",
                    });

                    let content = `<h1>${author}</h1>`;

                    if (fs.existsSync(`${config.folders.authors}/${slug}.md`)) {
                        const author_data = await parseMarkdown(
                            `${config.folders.authors}/${slug}.md`
                        );

                        content = author_data.render;
                    }

                    this.files_to_render.push({
                        cat: "author",
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
                        slug: slug,
                        cat: "tag",
                    });

                    let content = `<h1>${tag}</h1>`;

                    if (fs.existsSync(`${config.folders.tags}/${slug}.md`)) {
                        const tag_data = await parseMarkdown(
                            `${config.folders.tags}/${slug}.md`
                        );

                        content = tag_data.render;
                    }

                    this.files_to_render.push({
                        cat: "tag",
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

        citations.forEach(([source_id, cat, slug]) => {
            let { id: target_id } = getID(slug, cat);

            if (graph.hasNode(target_id)) {
                console.log(`add citation ${source_id}->${slug}`);
                graph.addEdge(source_id, target_id);
            } else {
                console.log(`citation ${source_id}: ${slug} not found`);
            }
        });

        if (config.hide_isolated_tags) {
            graph.forEachNode((node, attributes) => {
                if (
                    graph.degree(node) <= config.isolated_tags_threshold &&
                    attributes.cat === "tag"
                ) {
                    graph.setNodeAttribute(node, "isolated", true);
                }
            });
        }

        calculate_pagerank(graph);
        this.calculate_nodes_size();

        const [kd_tree, tree_graph] = get_kd_tree(graph);

        // save main graph
        fs.writeFile(
            `${config.folders.dist}/index.json`,
            JSON.stringify(tree_graph.export()),
            function (err) {
                if (err) return console.log(err);
            }
        );

        // render html files
        this.files_to_render.forEach((data) => {
            const links = kd_tree
                .nearest(
                    {
                        x: tree_graph.hasNode(data.id)
                            ? tree_graph.getNodeAttribute(data.id, "x")
                            : 0,
                        y: tree_graph.hasNode(data.id)
                            ? tree_graph.getNodeAttribute(data.id, "y")
                            : 0,
                    },
                    6
                )
                .filter(([item, _distance]) => item.id != data.id)
                .sort(
                    ([_a, a_distance], [_b, b_distance]) =>
                        a_distance - b_distance
                )
                .map(([item, _distance]) => {
                    return {
                        cat: graph.getNodeAttribute(item.id, "cat"),
                        slug: graph.getNodeAttribute(item.id, "slug"),
                        title: graph.getNodeAttribute(item.id, "label"),
                    };
                });

            let added_nodes = [];
            if (graph.hasNode(data.id)) {
                graph.forEachNeighbor(data.id, function (neighbor, attributes) {
                    if (
                        attributes.cat !== "author" &&
                        neighbor != data.id &&
                        !added_nodes.includes(neighbor)
                    ) {
                        added_nodes.push(neighbor);
                    }

                    graph.forEachNeighbor(
                        neighbor,
                        function (secondNeighbor, attributes) {
                            if (
                                attributes.cat !== "author" &&
                                secondNeighbor != data.id &&
                                !added_nodes.includes(secondNeighbor)
                            ) {
                                added_nodes.push(secondNeighbor);
                            }
                        }
                    );
                });
            }

            export_links.push({
                title: data.title,
                url: `${data.cat}-${data.slug}.html`,
            });
            Twig.renderFile(
                "./src/template.twig",
                {
                    ...config,
                    timestamp: this.timestamp,
                    title: data.title,
                    content: data.content,
                    links: links,
                    authors: data.authors,
                    tags: data.tags,
                    node: data.id,
                },
                (err, html) => {
                    html = minify(html, {
                        collapseWhitespace: true,
                    });

                    fs.writeFile(
                        `${config.folders.dist}/${data.cat}-${data.slug}.html`,
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

        export_links.push({ url: "index.html" });
        Twig.renderFile(
            "./src/template.twig",
            {
                ...config,
                timestamp: this.timestamp,
                content: main_data.render,
            },
            (err, html) => {
                html = minify(html, {
                    collapseWhitespace: true,
                });

                fs.writeFile(
                    `${config.folders.dist}/index.html`,
                    html,
                    function (err) {
                        if (err) return console.log(err);
                    }
                );
            }
        );

        exportSitemamp(export_links);
        exportSearch(export_links);

        // save sub graphs
        graph.forEachNode((node, attributes) => {
            const subGraph = new Graph();

            subGraph.addNode(node, { ...attributes });
            subGraph.removeNodeAttribute(node, "isolated");

            graph.forEachNeighbor(node, function (neighbor, attributes) {
                if (!subGraph.hasNode(neighbor)) {
                    subGraph.addNode(neighbor, { ...attributes });
                }
                subGraph.addEdge(node, neighbor);

                graph.forEachNeighbor(
                    neighbor,
                    function (secondNeighbor, attributes) {
                        if (!subGraph.hasNode(secondNeighbor)) {
                            subGraph.addNode(secondNeighbor, { ...attributes });
                        }

                        subGraph.addEdge(neighbor, secondNeighbor);
                    }
                );
            });

            let file_name = [attributes.cat, attributes.slug]
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
        const graph = this.graph;

        const ranks = graph
            .mapNodes((node) => {
                return graph.getNodeAttribute(node, "pagerank");
            })
            .filter((x) => x);

        const min_rank = Math.min(...ranks);
        const max_rank = Math.max(...ranks);

        // set node size
        graph.forEachNode((node, attributes) => {
            graph.setNodeAttribute(
                node,
                "size",
                Math.round(
                    range(
                        min_rank,
                        max_rank,
                        config.graph.node_min_size,
                        config.graph.node_max_size,
                        attributes.pagerank
                    )
                )
            );
        });
    }
};
